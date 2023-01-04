import { html, LitElement } from "lit";
import {
	dialogFooterRenderer,
	dialogHeaderRenderer,
	dialogRenderer,
} from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { translate } from "lit-translate";
import { motivos_items } from "../../jsons/motivos_items";
import { customElement, property, state } from "lit/decorators.js";
import { FormLayoutResponsiveStep } from "@vaadin/form-layout";
import { Insumo } from "../../insumos/insumos-types";
import { Actividad, LineaDosis } from "../../depositos/depositos-types";

@customElement("insert-insumo-dialog")
export class InsertInsumoDialog extends LitElement {
	@state()
	dialogOpened: boolean = false;

	@property()
	insumos: Insumo[];

	@property()
	actividad: Actividad;

	@property()
	linea_de_dosis: LineaDosis;

	cerrar() {
		this.dialogOpened = false;
		this.dispatchEvent(
			new CustomEvent("abrir-modal", { bubbles: true, composed: true })
		);
	}

	abrir() {
		this.dialogOpened = true;
		this.dispatchEvent(
			new CustomEvent("cerrar-modal", {
				detail: {},
				bubbles: true,
				composed: true,
			})
		);
	}

	agregarLineaInsumo() {
		this.dispatchEvent(
			new CustomEvent("nueva-linea-insumo", {
				detail: this.linea_de_dosis,
				bubbles: true,
				composed: true,
			})
		);
	}

	private responsiveSteps: FormLayoutResponsiveStep[] = [
		{ minWidth: 0, columns: 1 },
		{ minWidth: "20em", columns: 4 },
	];

	render() {
		return html`
			<vaadin-dialog
				aria-label="Add note"
				.opened="${this.dialogOpened}"
				.noCloseOnOutsideClick=${true}
				@opened-changed="${(e: DialogOpenedChangedEvent) =>
					(this.dialogOpened = e.detail.value)}"
				${dialogHeaderRenderer(
					() => html`
						<h2
							style="flex: 1; cursor: move; margin: 0; font-size: 1.5em; font-weight: bold; padding: var(--lumo-space-m) 0;"
						>
							${translate("insumo_agregar")}
						</h2>
					`,
					[this.dialogOpened]
				)}
				${dialogRenderer(
					() => html`
						<vaadin-form-layout
							.responsiveSteps=${this.responsiveSteps}
						>
							<vaadin-combo-box
								id="insumo1"
								label="Insumo"
								style="width:16em"
								colspan="2"
								item-label-path="marca_comercial"
								item-value-path="uuid"
								.items="${this.insumos}"
								.selected-item=${this.linea_de_dosis.insumo}
								@selected-item-changed=${(e) => {
									this.linea_de_dosis.insumo = e.detail.value;
									this.linea_de_dosis.precio_estimado =
										this.linea_de_dosis.insumo?.precio || 0;
									this.requestUpdate();
								}}
							></vaadin-combo-box>

							<vaadin-text-field
								label="Dosis"
								id="insumo2"
								colspan="1"
								.value="${this.linea_de_dosis.dosis}"
								@input=${(e) => {
									this.linea_de_dosis.dosis = +e.target.value;
									this.linea_de_dosis.total = truncar(
										this.linea_de_dosis.dosis *
											this.actividad.detalles.hectareas
									);
									this.requestUpdate();
								}}
								clear-button-visible
							>
								<div slot="suffix">
									${this.linea_de_dosis.insumo
										? this.linea_de_dosis.insumo.unidad +
										  "/ha"
										: ""}
								</div>
							</vaadin-text-field>

							<vaadin-text-field
								label="Total"
								id="insumo3"
								colspan="1"
								value="${this.linea_de_dosis.total}"
								@input=${(e) => {
									this.linea_de_dosis.total = +e.target.value;
									this.linea_de_dosis.dosis = truncar(
										this.linea_de_dosis.total /
											this.actividad.detalles.hectareas
									);
									this.requestUpdate();
								}}
							>
								<div slot="suffix">
									${this.linea_de_dosis.insumo?.unidad || ""}
								</div>
							</vaadin-text-field>

							<vaadin-multi-select-combo-box
								label="Motivo"
								colspan="2"
								id="insumo4"
								style="width:20em"
								item-label-path="nombre"
								item-id-path="id"
								.items="${motivos_items}"
								.selected-items=${this.linea_de_dosis.motivos}
								@selected-items-changed=${(e) => {
									this.linea_de_dosis.motivos =
										e.target.selectedItems;
								}}
							></vaadin-multi-select-combo-box>

							<vaadin-number-field
								label="Precio"
								colspan="1"
								.value=${this.linea_de_dosis.precio_estimado}
								@change=${(e) => {
									this.linea_de_dosis.precio_estimado =
										e.target.value;
								}}
							>
								<div slot="suffix">
									${this.linea_de_dosis.insumo?.unidad
										? "USD/" +
										  this.linea_de_dosis.insumo.unidad
										: ""}
								</div>
							</vaadin-number-field>
						</vaadin-form-layout>
					`,
					[]
				)}
				${dialogFooterRenderer(
					() =>
						html`
							<vaadin-button @click="${this.cerrar}"
								>${translate("cerrar")}</vaadin-button
							>
							<vaadin-button
								theme="primary"
								@click="${() => {
									this.cerrar();
									this.agregarLineaInsumo();
								}}"
								>${translate("agregar")}</vaadin-button
							>
						`,
					[]
				)}
			></vaadin-dialog>
			<vaadin-button @click="${this.abrir}">
				${translate("agregar")}
			</vaadin-button>
		`;
	}
}

function truncar(x) {
	return +x.toPrecision(4);
}
