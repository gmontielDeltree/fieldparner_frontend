import { html, LitElement } from "lit";
import {
	dialogFooterRenderer,
	dialogHeaderRenderer,
	dialogRenderer,
} from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { translate } from "lit-translate";

export const insert_insumos_template = (host: LitElement) => {
	const cerrar = ()=>{
		host.dialogOpened = false
		host.modal.show()
	}

	const abrir = ()=>{
		host.dialogOpened = true
		host.modal.hide()
	}

	return html`
	<vaadin-dialog
		aria-label="Add note"

		.opened="${host.dialogOpened}"
		.noCloseOnOutsideClick = ${true}
		@opened-changed="${(e: DialogOpenedChangedEvent) =>
			(host.dialogOpened = e.detail.value)}"
		${dialogHeaderRenderer(
			() => html`
				<h2
					style="flex: 1; cursor: move; margin: 0; font-size: 1.5em; font-weight: bold; padding: var(--lumo-space-m) 0;"
				>
					${translate('insumo_agregar')}
				</h2>
			`,
			[host.dialogOpened]
		)}
		${dialogRenderer(
			() => html`
					
						<vaadin-text-field tabindex='1' label="Title"></vaadin-text-field>
						<vaadin-text-area
							label="Description"
						></vaadin-text-area>
			`,
			[]
		)}
		${dialogFooterRenderer(
			() =>
				html`
					<vaadin-button @click="${cerrar}"
						>${translate("cerrar")}</vaadin-button
					>
					<vaadin-button
						theme="primary"
						@click="${cerrar}"
						>${translate("agregar")}</vaadin-button
					>
				`,
			[]
		)}
	></vaadin-dialog>
	<vaadin-button
		@click="${abrir}"
	>
		${translate("agregar")}
	</vaadin-button>
`}
