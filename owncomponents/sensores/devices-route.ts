import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { RouterLocation } from "@vaadin/router";
import "./sensores-offcanvas";
import gbl_state from "../state";
import { DailyTelemetryCard } from "./sensores-types";
import { gblStateLoaded } from "../state";
import { gbl_devices } from "./sensores";

@customElement("device-route-handler")
export class DevicesRouteHandler extends LitElement {
  @property()
  location: RouterLocation;

  @state({ hasChanged: () => false })
  card: DailyTelemetryCard;

  @state()
  loaded: boolean = false;

  async willUpdate(props) {
    console.count("Devices-Route-WillUpdate");
    if (props.has("location")) {
      let card: DailyTelemetryCard = await gbl_devices.get_device_daily_card(
        this.location.params.uuid as string,
        this.location.params.date as string
      );
      this.card = card;
      console.log("Device Card Loaded", this.card);
      this.loaded = true;
    }
  }

  render() {
    if (!this.loaded || !gblStateLoaded()) {
      return null;
    }

    return html`<sensores-oc
      .map=${gbl_state.map}
      .uuid=${this.location.params.uuid}
      ._selected_device_card=${this.card}
    /> `;
  }
}
