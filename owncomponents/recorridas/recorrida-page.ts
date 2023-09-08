import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { RecorridaMachineCtx, machine } from "./recorridas-machines";
import { interpret, assign } from "xstate";
import { gbl_state } from "../state";
import { SelectorController } from "xstate-lit/dist/select-controller";
import { getRecorrida } from "./recorrida-functions";
import { showRecorridaFeatureCollectionOnMap } from "../mapa-principal/mapa-helpers";
import { TextFieldChangeEvent } from "@vaadin/text-field";
import {
  PuntoRecorrida,
  Recorrida,
  empty_punto,
  empty_recorrida,
} from "./recorrida-types";
import { RouterLocation } from "@vaadin/router";
import "@vaadin/text-field";
import { Marker, LngLat } from "mapbox-gl";
import { MarkEmailReadTwoTone, ThumbUpSharp } from "@mui/icons-material";
import { deepcopy, waitForCondition } from "../helpers";

@customElement("recorrida-page")
export class RecorridaPage extends LitElement {
  @property()
  location: RouterLocation;

  actor = interpret(
    machine
      .withContext({
        map: "MOGO",
        recorrida: {} as Recorrida,
        punto_editando: {} as PuntoRecorrida,
        marker: new Marker(),
      })
      .withConfig({
        guards: {
          editarRecorrida: () => !window.location.pathname.includes("add"),
        },
        actions: {
          emptyRecorrida: assign({ recorrida: empty_recorrida() }),
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
            recorrida: (ctx) => {
              let nr = ctx.recorrida;
              nr.features = nr.features.filter(
                (f) => f._id !== ctx.punto_editando._id
              );
              return nr;
            },
          }),
          seleccionarPunto: assign({ punto_editando: (_, { data }) => data }),
          initPuntoNuevo: assign({
            punto_editando: (ctx: RecorridaMachineCtx) =>
              empty_punto(ctx.map.getCenter()),
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
            }
            ctx.marker.setLngLat(ctx.map.getCenter());
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
          refreshMapa: (ctx: RecorridaMachineCtx) =>
            showRecorridaFeatureCollectionOnMap(
              ctx.map,
              ctx.recorrida,
              "recorrida"
            ),
          guardarRecorrida: (ctx: RecorridaMachineCtx) => {
            console.warn("GUARDAR RECORRIDA");
          },
          generarReporteEnNuevaVentana: (ctx: RecorridaMachineCtx) => {
            console.warn("GENERAR REPORTE");
          },
          editRecorridaData: assign({
            recorrida: (ctx: RecorridaMachineCtx, { data }) => {
              let { field, value } = data;
              ctx.recorrida[field] = value;
              return deepcopy(ctx.recorrida) as Recorrida;
            },
          }),
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
    setTimeout(() => {
      // console.log("Recorrida PRE Start", gbl_state.map);
      this.actor.start();
    }, 10000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.actor.send({ type: "CERRAR" });
  }

  ctx = new SelectorController(this, this.actor, (state) => state.context);
  state = new SelectorController(this, this.actor, (state) => state.value);

  render(): unknown {
    let ctx: RecorridaMachineCtx = this.ctx.value as RecorridaMachineCtx;
    let recorrida = ctx.recorrida;
    let state = this.state.value;

    switch (JSON.stringify(state)) {
      case "empty":
        console.log("EMPTY");
        return html` <div>Aún no hay puntos</div> `;
      case '{"loaded":"empty"}':
        return html`
          <div>Aún no hay puntos</div>

          <vaadin-button
            @click=${() => this.actor.send({ type: "NUEVO_PUNTO" })}
          >
            NUEVO PUNTO
          </vaadin-button>
        `;

      case '{"loaded":"mostrandoRecorrida"}':
        return html`
          <div>
            <h4>${recorrida.nombre}</h4>
            <vaadin-text-field
              .value=${recorrida.nombre}
              @change=${(e: TextFieldChangeEvent) =>
                this.actor.send({
                  type: "EDIT_RECORRIDA_DATA",
                  data: { field: "nombre", value: e.target.value },
                })}
            ></vaadin-text-field>
            <vaadin-button
              @click=${() => this.actor.send({ type: "NUEVO_PUNTO" })}
            >
              NUEVO PUNTO
            </vaadin-button>
            ${ctx.recorrida.features.map((f) => {
              return html`
                <div>${JSON.stringify(f.geometry.coordinates)}</div>
              `;
            })}
          </div>
        `;
      case '{"loaded":"editandoPunto"}':
        return html`<div>${ctx.punto_editando.geometry.coordinates[0]}</div>
          <vaadin-button
            @click=${() => this.actor.send({ type: "PUNTO_GUARDADO" })}
            >GUARDAR</vaadin-button
          > `;
      default:
        console.log("DEFAULT", state, ctx, this.state);
        return html`<div>${state}</div>`;
    }
  }
}
