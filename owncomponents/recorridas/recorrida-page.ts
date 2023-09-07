import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { RecorridaMachineCtx, machine } from "./recorridas-machines";
import { interpret, assign } from "xstate";
import { gbl_state } from "../state";
import { SelectorController } from "xstate-lit/dist/select-controller";
import { getRecorrida } from "./recorrida-functions";
import { showFeatureCollectionOnMap } from "../mapa-principal/mapa-helpers";
import { TextFieldChangeEvent } from "@vaadin/text-field";
import { PuntoRecorrida, Recorrida, empty_punto, empty_recorrida } from "./recorrida-types";
import { RouterLocation } from "@vaadin/router";
import "@vaadin/text-field";
import { Marker, LngLat } from "mapbox-gl";
import { MarkEmailReadTwoTone, ThumbUpSharp } from "@mui/icons-material";
import { waitForCondition } from "../helpers";

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
      })
      .withConfig({
        guards: {
          editarRecorrida: () => !window.location.pathname.includes("add"),
        },
        actions: {
          emptyRecorrida: assign({recorrida: empty_recorrida()}),
          assignMap: assign({ map: () => gbl_state.map }),
          initCtx: assign({
            recorrida: ({ recorrida }) => {
              return { ...recorrida, _id: this.location.params.uuid };
            },
            punto_editando: {},
          }),
          guardarPunto: assign({
            recorrida: (ctx: RecorridaMachineCtx) => {
              console.log("CTXXXX",ctx)
              let nr = ctx.recorrida;
              nr.features.push(ctx.punto_editando);
              return nr;
            },
            punto_editando: {},
          }),
          seleccionarPunto: assign({ punto_editando: (_, { data }) => data }),
          initPuntoNuevo: assign({
            punto_editando: (ctx: RecorridaMachineCtx) =>
              empty_punto(ctx.map.getCenter()),
          }),
          initEditMapMode: (ctx: RecorridaMachineCtx) => {
            // Agrega un marcador en el centro del mapa
            // Agrega un handler onMoveEnd que desplaza al marcador
            let marker = new Marker();
            marker.setDraggable(true);
            marker.setLngLat(ctx.map.getCenter());
            marker.on("dragend", (e) => {
              // console.log("DFSDFSDFSD",e)
              this.actor.send({
                type: "EDIT_POSICION",
                data: e.target._lngLat,
              });
            });
            marker.addTo(ctx.map);
          },
          salirEditMapMode: () => {},
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
          limpiarMapa: (ctx, evt) => {},
          refreshMapa: (ctx: RecorridaMachineCtx) =>
            showFeatureCollectionOnMap(ctx.map, ctx.recorrida),
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
        return html` <div>empty</div> `;
      case '{"loaded":"empty"}':
      case '{"loaded":"mostrandoRecorrida"}':
        return html`
          <div>
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
          </div>
        `;
      case '{"loaded":"editandoPunto"}':
        return html`<div>${ctx.punto_editando.geometry.coordinates[0]}</div>
          <vaadin-button
            @click=${() => this.actor.send({ type: "PUNTO_GUARDADO" })}
            >GUARDAR</vaadin-button> `;
      default:
        console.log("DEFAULT", state, ctx, this.state);
        return html`<div>${state}</div>`;
    }
  }
}
