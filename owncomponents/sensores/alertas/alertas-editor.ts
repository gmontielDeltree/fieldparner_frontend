import { LitElement, html } from 'lit';
import { SelectorController } from 'xstate-lit';
import { Alert, alertas_editor_machine } from './alertas-editor-machine';
import { AnyActorRef, interpret } from 'xstate';
import { customElement } from 'lit/decorators';
import { property } from 'lit/decorators.js';
import "@vaadin/combo-box"
import "@vaadin/number-field"
import "@vaadin/button"


@customElement("alert-editor")
export class AlertEditor extends LitElement {

	alerts = new SelectorController(this,interpret(alertas_editor_machine).start(), (state) => state.context.alerts);


	render(){
		let alerts = this.alerts.value
		return html`
			${alerts.map((a) => {
				html`
					<alert-element .alert=${a.alert} .actorRef=${a.actorRef}></alert-element>
				`
				}) 
			}


		`
	}
}

@customElement("alert-element")
export class AlertElement extends LitElement {
	@property()
	alert : Alert

	@property()
	actorRef : AnyActorRef

	temperatura = new SelectorController(this,interpret(this.actorRef).start(), (state) => state.context.temperatura);
	threshold_1 = new SelectorController(this,interpret(this.actorRef).start(), (state) => state.context.threshold_1);
	threshold_2 = new SelectorController(this,interpret(this.actorRef).start(), (state) => state.context.threshold_2);
	mail = new SelectorController(this,interpret(this.actorRef).start(), (state) => state.context.mail);
	variable = new SelectorController(this,interpret(this.actorRef).start(), (state) => state.context.variable);



	protected render() {
		html`
			<vaadin-combo-box></vaadin-combo-box>
			<vaadin-number-field .value=${this.threshold_1.value}></vaadin-number-field>
		
		`
	}
}