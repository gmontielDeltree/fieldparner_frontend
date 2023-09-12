import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { ifDefined } from 'lit/directives/if-defined.js';
import { LitElement, PropertyValueMap, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { RecorridaMachineCtx, machine } from "./recorridas-machines";
import { interpret, assign } from "xstate";
import { gbl_state } from "../state";
import { SelectorController } from "xstate-lit/dist/select-controller";
import { getRecorrida, saveRecorrida } from "./recorrida-functions";
import { showRecorridaFeatureCollectionOnMap } from "../mapa-principal/mapa-helpers";
import { TextFieldChangeEvent } from "@vaadin/text-field";
import {
  PuntoRecorrida,
  Recorrida,
  empty_punto,
  empty_recorrida,
  get_posibles_detalles,
} from "./recorrida-types";
import { RouterLocation } from "@vaadin/router";
import "@vaadin/text-field";
import { GeolocateControl, Marker } from "mapbox-gl";
import { createMenuDots, deepcopy, upload_file } from "../helpers";
import { uuidv7 } from "uuidv7";
import { get, translate as t } from "lit-translate";
import { base_i18n } from "../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { DateTimePickerI18n } from "@vaadin/date-time-picker";
import "@vaadin/date-time-picker";
import "@vaadin/accordion";
import { PuntoRecorrida } from './recorrida-types';
import "../common_components/image_uploader/fp-image-uploader"

@customElement("recorrida-page")
export class RecorridaPage extends LitElement {
  @property()
  location: RouterLocation;

  actor = interpret(
    machine
      .withContext({
        map: "MOGO",
        recorrida: empty_recorrida("") as Recorrida,
        punto_editando: {} as PuntoRecorrida,
        marker: new Marker(),
      })
      .withConfig({
        guards: {
          editarRecorrida: () => !window.location.pathname.includes("add"),
        },
        actions: {
          emptyRecorrida: assign({
            recorrida: () => empty_recorrida(this.location.params.uuid_lote),
          }),
          assignMap: assign({ map: () => gbl_state.map }),
          initCtx: assign({
            recorrida: ({ recorrida }) => {
              return { ...recorrida, _id: this.location.params.uuid };
            },
            punto_editando: {},
          }),
          guardarPunto: assign({
            recorrida: (ctx: RecorridaMachineCtx) => {
              console.log("CTXXXX", ctx);
              let nr = ctx.recorrida;
              nr.features = nr.features.filter(
                (f) => f._id !== ctx.punto_editando._id
              );
              nr.features.push(ctx.punto_editando);
              // Ordenar?
              return nr;
            },
            punto_editando: {},
          }),
          borrarPunto: assign({
            recorrida: (ctx, { data }) => {
              let nr = ctx.recorrida;
              let punto: PuntoRecorrida = data
              nr.features = nr.features.filter(
                (f) => f._id !== punto._id
              );
              return nr;
            },
          }),
          seleccionarPunto: assign({ punto_editando: (_, { data }) => data }),
          initPuntoNuevo: assign({
            punto_editando: (ctx: RecorridaMachineCtx) =>
              empty_punto(ctx.map.getCenter(), ctx.recorrida.features.length + 1),
          }),
          initEditMapMode: (ctx: RecorridaMachineCtx) => {
            // Agrega un marcador en el centro del mapa
            // Agrega un handler onMoveEnd que desplaza al marcador

            if (!ctx.marker.isDraggable()) {
              // Utilizo esto como trampa de inicializacion del Marker
              // asi no duplico el listener "dragend"
              ctx.marker.setDraggable(true);
              ctx.marker.on("dragend", (e) => {
                // console.log("DFSDFSDFSD",e)
                this.actor.send({
                  type: "EDIT_POSICION",
                  data: e.target._lngLat,
                });
              });

              // Add geolocate control event
              let geolocate_control: GeolocateControl =
                ctx.map._custom_controls.geolocate;
              geolocate_control.on("geolocate", (e) => {
                let pos = { lng: e.coords.longitude, lat: e.coords.latitude };
                ctx.marker.setLngLat(pos);
                console.log("GEOLOCATED", e);
                this.actor.send({
                  type: "EDIT_POSICION",
                  data: pos,
                });
              });
            }
            ctx.marker.setLngLat(ctx.punto_editando.geometry.coordinates);
            ctx.marker.addTo(ctx.map);
          },
          salirEditMapMode: (ctx: RecorridaMachineCtx) => {
            ctx.marker.remove();
          },
          assignPosicion: assign({
            punto_editando: (ctx: RecorridaMachineCtx, { data }) => {
              console.log("ASSIGNPOSICION", data, ctx);
              const p = ctx.punto_editando;
              p.geometry.coordinates = [data.lng, data.lat];
              return p;
            },
          }),
          // assignRecorridaId: assign({
          //   recorrida: ({ recorrida }) => {
          //     return { ...recorrida, _id: this.location.params.uuid };
          //   },
          // }),
          centrarMapaEnAccion: (ctx: RecorridaMachineCtx) => {
            ctx.map.flyTo({
              center: ctx.punto_editando.geometry.coordinates,
            });
          },
          limpiarMapa: (ctx: RecorridaMachineCtx, evt) => {
            ctx.map.removeLayer("recorrida");
            ctx.map.removeSource("recorrida");
            ctx.marker.remove();
          },
          refreshMapa: (ctx: RecorridaMachineCtx) => {
            console.log("REFRESH MAPA");

            /* Borrar el handler si existe */
            if (ctx.map._events && ctx.map._events.recorrida_click) {
              console.log("BORRAR HANDLER", ctx.map._events.recorrida_click);
              ctx.map.off(
                "click",
                "recorrida",
                ctx.map._events.recorrida_click
              );
            }

            /* Crear handler click */

            const click_handler = (e) => {
              let id_del_punto = e.features[0].properties._id;

              let punto = ctx.recorrida.features.find(
                (f) => f._id === id_del_punto
              );

              this.actor.send({ type: "SELECCIONAR_PUNTO", data: punto });

              console.log("CLICK", e.features[0]);
            };

            ctx.map._events = {
              recorrida_click: click_handler,
            };

            showRecorridaFeatureCollectionOnMap(
              ctx.map,
              ctx.recorrida,
              "recorrida"
            );

            /* Add al mapa */
            ctx.map.on("click", "recorrida", ctx.map._events.recorrida_click);
          },
          guardarRecorrida: (ctx: RecorridaMachineCtx) => {
            saveRecorrida(ctx.recorrida).then(() =>
              console.log("recorrida_saved")
            );
            // console.warn("GUARDAR RECORRIDA");
          },
          generarReporteEnNuevaVentana: (ctx: RecorridaMachineCtx) => {
            console.warn("GENERAR REPORTE");
          },
          editRecorridaData: assign({
            // Edit el valor de un campo de datos del punto, ej "notas"
            recorrida: (ctx: RecorridaMachineCtx, { data }) => {
              let { field, value } = data;
              ctx.recorrida[field] = value;
              return deepcopy(ctx.recorrida) as Recorrida;
            },
          }),
          assignPuntoData: assign({
            // Le asigna el valor a un campo de detalle
            punto_editando: (ctx: RecorridaMachineCtx, { data }) => {
              let { field, detalles_name, value } = data;
              let punto: PuntoRecorrida = deepcopy(ctx.punto_editando);
              if (detalles_name) {
                let i = punto.properties.detalles?.findIndex(
                  (d) => d.name === detalles_name
                );
                punto.properties.detalles[i].value = value;
              }
              if (field) {
                punto.properties[field] = value;
              }
              return punto;
            },
          }),
          assignAddField: assign({
            // Agrega un field a detalles del punto
            punto_editando: (ctx: RecorridaMachineCtx, { data }) => {
              let { name } = data;
              let punto: PuntoRecorrida = deepcopy(ctx.punto_editando);
              punto.properties.detalles?.push({ name: name, value: "" });
              return punto;
            },
          }),

          /** FIN ACTIONS */
        },
        services: {
          fetchRecorrida: async (ctx: RecorridaMachineCtx) =>
            await getRecorrida(ctx.recorrida._id),
        },
      })
  );

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    if (gbl_state.map === undefined) {
      setTimeout(() => {
        this.actor.start();
      }, 10000);
    } else {
      this.actor.start();
    }

  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.actor.send({ type: "CERRAR" });
  }

  /* Estado y Contexto */
  ctx = new SelectorController(this, this.actor, (state) => state.context);
  state = new SelectorController(this, this.actor, (state) => state.value);

  static override styles = css`
         header {
        align-items: center;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid var(--lumo-contrast-90pct);
        background-color: var(--lumo-primary-color-10pct);
        padding: var(--lumo-space-s);
      }

      header h2 {
        margin: 0;
      }

      header vaadin-icon {
        box-sizing: border-box;
        height: var(--lumo-icon-size-m);
        margin-right: var(--lumo-space-m);
        padding: calc(var(--lumo-space-xs) / 2);
        width: var(--lumo-icon-size-m);
      }
  `

  //summary="${ifDefined(f.properties.nombre)}"

  render(): unknown {
    let ctx: RecorridaMachineCtx = this.ctx.value as RecorridaMachineCtx;
    let recorrida = ctx.recorrida;
    let state = this.state.value;

    /**
     * Envia "EDIT_RECORRIDA_DATA"
     */
    const recorrida_update_field = (field: string, value: any) =>
      this.actor.send({
        type: "EDIT_RECORRIDA_DATA",
        data: { field: field, value: value },
      });

    let state_string = JSON.stringify(state);

    switch (state_string) {
      case "empty":
        console.log("EMPTY");
        return html` <div>Aún no hay puntos</div> `;
      case '{"loaded":"empty"}':
      case '{"loaded":"mostrandoRecorrida"}':
        return html`
          <div style="background-color:#ffffff">

          <header>
            <a
              href="${this.backurl || "/"}"
              @click=${() => this.actor.send({ type: "CERRAR" })}
              aria-label="Go back"
            >
              <vaadin-icon
                icon="vaadin:arrow-left"
                aria-hidden="true"
              ></vaadin-icon>
            </a>
            <h5>${t("nueva_recorrida")}</h5>

            <vaadin-button theme="primary success small" @click=${() => this.actor.send({ type: "GUARDAR" })}
              >GUARDAR</vaadin-button
            >
          </header>

          <div id="body" style="padding:1rem;display: flex;flex-direction: column;">
            <!-- <h5>${recorrida._id}</h5> -->

            <vaadin-text-field
              .label=${t("nombre")}
              .value=${recorrida.nombre}
              @change=${(e: TextFieldChangeEvent) =>
            recorrida_update_field("nombre", e.target.value)
          }
            ></vaadin-text-field>

            <vaadin-date-time-picker
              .label=${t("fecha_hora")}
              .value=${recorrida.fecha}
              .i18n=${base_i18n as DateTimePickerI18n}
              @change=${(e) => {
            recorrida_update_field("fecha", e.target.value);
          }
          }
            ></vaadin-date-time-picker>

            <vaadin-date-picker
              .label=${t("Proxima Visita")}
              placeholder="YYYY-MM-DD"
              .value=${recorrida.proxima_visita}
              .i18n=${base_i18n}
              allowed-char-pattern="[]"
              @change=${(e) =>
            recorrida_update_field("proxima_visita", e.target.value)}
            ></vaadin-date-picker>

            <vaadin-vertical-layout style="align-items: center">
              ${when(
              state_string === '{"loaded":"empty"}',
              () => html`<span>${t("aun_no_hay_puntos")}</span>`
            )}

              <vaadin-button
                @click=${() => this.actor.send({ type: "NUEVO_PUNTO" })}
              >
                NUEVO PUNTO
              </vaadin-button>
            </vaadin-vertical-layout>

            <vaadin-accordion .opened=${null}>
              ${map(ctx.recorrida.features, (f) => {
              return html`
                  <vaadin-accordion-panel>
                    <vaadin-accordion-heading slot="summary">
                      
                    <div style="display:flex;justify-content:space-between;width: 100%;align-items: center;">
                      <div>
                        ${ifDefined(f.properties.nombre)}
                      </div>


                      <vaadin-menu-bar @item-selected=${(e)=>e.detail.value.click()} .items=${[
                  {
                    component: createMenuDots("ellipsis-dots-v"),
                    tooltip: get("mas"),
                    children: [
                      { text: get("edit"), click: () =>
                      this.actor.send({
                        type: "SELECCIONAR_PUNTO",
                        data: f,
                      })},
                      { text: get("borrar"),
                    click: () =>
                    this.actor.send({
                      type: "BORRAR_PUNTO",
                      data: f,
                    })
                    },
                    ]
                  }
                ]}>
                          
                      </vaadin-menu-bar>

                      </div>

                    </vaadin-accordion-heading>

                    <vaadin-vertical-layout>
                    
                      <span>${f.properties.orden}</span>
                      <span>${f.properties.notas}</span>

                      <fp-image-uploader .sologallery=${true} .images=${f.properties.fotos ?? []}></fp-image-uploader>

                    

                      ${when(f.properties.audio !== undefined, () => html`
                        <audio controls>
                          <source .src=${"/attachments?file=" + f.properties.audio}></source>
                        </audio>
                      `)}

                      <span>${JSON.stringify(f.geometry.coordinates)}</span>
                    </vaadin-vertical-layout>
                  </vaadin-accordion-panel>
                `;
            })}
            </vaadin-accordion>
            </div> <!--Body-->
          </div>
        `;

      case '{"loaded":{"editandoPunto":"idle"}}':
        return html`
        <div style="background-color:white;min-width:25vw;">
          <header>
            <a
              @click=${() => this.actor.send({ type: "VOLVER" })}
              aria-label="Go back"
            >
              <vaadin-icon
                icon="vaadin:arrow-left"
                aria-hidden="true"
              ></vaadin-icon>
            </a>
            <h5>${t("punto")}</h5>

            <slot name="menu" class='push'></slot>
            <vaadin-button theme="primary success small" @click=${() => this.actor.send({ type: "PUNTO_GUARDADO" })}
              >GUARDAR</vaadin-button
            >
          </header>

        <!-- <vaadin-button
            @click=${() => this.actor.send({ type: "PUNTO_GUARDADO" })}
            >GUARDAR</vaadin-button
          > -->

        <div id="body" style="padding:1rem;display:flex;flex-direction: column;">
          <!-- <div>${ctx.punto_editando.geometry.coordinates[0]}</div> -->

          <vaadin-text-field
            .label=${t("nombre")}
            .value=${ctx.punto_editando.properties.nombre}
            @change=${(e: TextFieldChangeEvent) =>
            this.actor.send({
              type: "EDIT_PUNTO_DATA",
              data: { field: "nombre", value: e.target.value },
            })}
          ></vaadin-text-field>

          <vaadin-text-area
            .label=${t("notas")}
            .value=${ctx.punto_editando.properties.notas}
            @change=${(e: TextFieldChangeEvent) =>
            this.actor.send({
              type: "EDIT_PUNTO_DATA",
              data: { field: "notas", value: e.target.value },
            })}
          ></vaadin-text-area>

          ${ctx.punto_editando.properties.detalles?.map((d) => {
              return html`<vaadin-text-field
              .label=${d.name}
              .value=${d.value}
              @change=${(e) =>
                  this.actor.send({
                    type: "EDIT_PUNTO_DATA",
                    data: { detalles_name: d.name, value: e.target.value },
                  })}
            ></vaadin-text-field>`;
            })}

          <vaadin-button
            @click=${() => this.actor.send({ type: "ADD_PUNTO_FIELD" })}
            >ADD FIELD</vaadin-button
          >
       
          <audio-recorder
              id="audio-recorder"
              @recordingCompleted=${(e) => {
            console.log("RECORDING COMPLETED", e);
            let audio = e.detail as File;
            audio.name = uuidv7();
            upload_file(audio).then((r) => {
              console.log("AUDIO", r)
              let audio_url = audio.name;
              console.log("audio_url", audio_url);
              this.actor.send({ type: "EDIT_PUNTO_DATA", data: { field: "audio", value: audio_url } })
            });
          }}
            ></audio-recorder>

            ${when(ctx.punto_editando.properties.audio !== undefined, () => html`
              <audio controls>
                <source .src=${"/attachments?file=" + ctx.punto_editando.properties.audio}></source>
              </audio>
            `)}
            
            <fp-image-uploader @upload-done=${(e) => {
            console.log("UPLOAD DONE", e),
              this.actor.send({ type: "EDIT_PUNTO_DATA", data: { field: "fotos", value: [...ctx.punto_editando.properties.fotos ?? [], e.detail] } })
          }} 
                @uploader-remove=${(e) => {
            this.actor.send({ type: "EDIT_PUNTO_DATA", data: { field: "fotos", value: ctx.punto_editando.properties.fotos?.filter((f) => f !== e.detail) } })
          }}
              .images=${ctx.punto_editando.properties.fotos ?? []}
              
              ></fp-image-uploader>
            


  

          <!-- <div>${JSON.stringify(ctx.punto_editando, null, 2)}</div>  -->
            </div>
          </div>
          `;

      case '{"loaded":{"editandoPunto":"mostrarFields"}}':
        return html`
          <div style="position:fixed; top:50%; left:50%; z-index:12">
            <button @click=${() => this.actor.send({ type: "CERRAR_FIELDS" })}>
              x
            </button>
            ${get_posibles_detalles().map((d) => {
          return html` <vaadin-button
                @click=${() =>
              this.actor.send({
                type: "SELECCIONAR_FIELD",
                data: { name: d.name },
              })}
                >${d.name}</vaadin-button
              >`;
        })}
          </div>
        `;
      default:
        console.log("DEFAULT", state, ctx, this.state);
        return html`<div>${state}</div>`;
    }
  }
}
