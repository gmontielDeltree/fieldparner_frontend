import { html, LitElement } from "lit";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
	Actividad,
	DetallesAplicacion,
	LineaDosis,
} from "../../depositos/depositos-types";
import { motivos_items } from "../../jsons/motivos_items";

const grid_insumos_template = (actividad: Actividad, host : LitElement) => {
	const borrar = (dosis: LineaDosis) => {
		let dosises = actividad.detalles.dosis;
		let remanente = dosises.filter(
			(d) => d.uuid !== dosis.uuid
		) as LineaDosis[];
		actividad.detalles.dosis = remanente;
		host.requestUpdate()
	};

	return html`<vaadin-grid
		.items=${(actividad.detalles as DetallesAplicacion).dosis}
		style="width: 100%; max-width: 100%; align-self: center;"
		all-rows-visible
	>
		<vaadin-grid-column
			header="Nombre"
			auto-width
			${columnBodyRenderer<LineaDosis>((item) => {
				console.log("render item", item);
				return html`<vaadin-vertical-layout
					style="line-height: var(--lumo-line-height-s);"
				>
					<span>${item.insumo.marca_comercial}</span>
					<span
						style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);"
					>
						${item.insumo.principio_activo}
					</span>
				</vaadin-vertical-layout>`;
			}, actividad.detalles.dosis)}
		></vaadin-grid-column>

		<vaadin-grid-column
			header="Dosis (por ha.)"
			auto-width
			${columnBodyRenderer<any>(
				(item) => html` <vaadin-text-field
					maxlength="5"
					value=${item.dosis}
					@change=${(e) => (item.dosis = +e.target.value)}
				>
					<div slot="suffix">${item.insumo.unidad}/Ha</div>
				</vaadin-text-field>`,
				[]
			)}
		></vaadin-grid-column>

		<vaadin-grid-column
			header="Total"
			auto-width
			${columnBodyRenderer<LineaDosis>(
				(item) => html` <vaadin-text-field
					maxlength="5"
					value=${item.total}
					@change=${(e) => (item.total = +e.target.value)}
				>
					<div slot="suffix">${item.insumo.unidad}</div>
				</vaadin-text-field>`,
				[]
			)}
		></vaadin-grid-column>

		<vaadin-grid-column
			header="Motivos"
			auto-width
			${columnBodyRenderer<LineaDosis>(
				(item) => html`<vaadin-multi-select-combo-box
					item-label-path="nombre"
					item-id-path="id"
					.items=${motivos_items}
					.selectedItems=${item.motivos}
				></vaadin-multi-select-combo-box>`,
				[]
			)}
		></vaadin-grid-column>

		<vaadin-grid-column
			header="Precio"
			auto-width
			${columnBodyRenderer<LineaDosis>(
				(item) => html`<vaadin-number-field
					value="${item.precio_estimado}"
					@change=${(e) => (item.precio_estimado = +e.target.value)}
				>
					<div slot="suffix">
						${item.insumo?.unidad
							? "USD/" + item.insumo.unidad
							: ""}
					</div></vaadin-number-field
				>`,
				[]
			)}
		></vaadin-grid-column>

		<vaadin-grid-column
			frozen-to-end
			auto-width
			flex-grow="0"
			${columnBodyRenderer(
				(item) => html`
					<vaadin-button
						@click=${() => borrar(item as LineaDosis)}
						theme="icon"
						aria-label="borrar item"
					>
						<vaadin-icon icon="vaadin:trash"></vaadin-icon>
						<vaadin-tooltip
							slot="tooltip"
							text="Borrar"
						></vaadin-tooltip>
					</vaadin-button>
				`,
				[]
			)}
		></vaadin-grid-column>
	</vaadin-grid>`;
};

export { grid_insumos_template };
// <vaadin-grid
//   .items=${(
//     actividad.detalles as DetallesAplicacion
//   ).dosis}
//   style="width: 100%; max-width: 100%; align-self: center;"
//   all-rows-visible
// >
//   <vaadin-grid-column
//     header="Nombre"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>((item) => {
//       console.log("render item", item);
//       return html`<vaadin-vertical-layout
//         style="line-height: var(--lumo-line-height-s);"
//       >
//         <span>${item.insumo.marca_comercial}</span>
//         <span
//           style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);"
//         >
//           ${item.insumo.principio_activo}
//         </span>
//       </vaadin-vertical-layout>`;
//     }, actividad.detalles.dosis)}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Dosis (por ha.)"
//     auto-width
//     ${columnBodyRenderer<any>(
//       (item) => html` <vaadin-text-field
//         maxlength="5"
//         value=${item.dosis}
//         @change=${(e) =>
//           (item.dosis = +e.target.value)}
//       >
//         <div slot="suffix">
//           ${item.insumo.unidad}/Ha
//         </div>
//       </vaadin-text-field>`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Total"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>(
//       (item) => html` <vaadin-text-field
//         maxlength="5"
//         value=${item.total}
//         @change=${(e) =>
//           (item.total = +e.target.value)}
//       >
//         <div slot="suffix">${item.insumo.unidad}</div>
//       </vaadin-text-field>`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Motivos"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>(
//       (item) => html`<vaadin-multi-select-combo-box
//         item-label-path="nombre"
//         item-id-path="id"
//         .items=${motivos_items}
//         .selectedItems=${item.motivos}
//       ></vaadin-multi-select-combo-box>`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Precio"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>(
//       (item) => html`<vaadin-number-field
//         value="${item.precio_estimado}"
//         @change=${(e) =>
//           (item.precio_estimado = +e.target.value)}
//       >
//         <div slot="suffix">
//           ${item.insumo?.unidad
//             ? "USD/" + item.insumo.unidad
//             : ""}
//         </div></vaadin-number-field
//       >`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     frozen-to-end
//     auto-width
//     flex-grow="0"
//     ${columnBodyRenderer(
//       (item) => html`
//         <vaadin-button
//           @click=${() =>
//             this.borrar(item as LineaDosis)}
//           theme="icon"
//           aria-label="borrar item"
//         >
//           <vaadin-icon
//             icon="vaadin:trash"
//           ></vaadin-icon>
//           <vaadin-tooltip
//             slot="tooltip"
//             text="Borrar"
//           ></vaadin-tooltip>
//         </vaadin-button>
//       `,
//       []
//     )}
//   ></vaadin-grid-column>
// </vaadin-grid>
