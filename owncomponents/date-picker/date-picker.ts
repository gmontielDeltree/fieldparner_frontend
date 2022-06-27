import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { format, parse } from "date-fns";
import "@vaadin/date-picker";

export class DatePicker extends LitElement {
  @property()
  fecha: string = "";

  firstUpdated() {
    /* Format date */
    const formatDateIso8601 = (dateParts) => {
      const { year, month, day } = dateParts;
      const date = new Date(year, month, day);

      return format(date, "yyyy-MM-dd");
    };

    const parseDateIso8601 = (inputValue) => {
      const date = parse(inputValue, "yyyy-MM-dd", new Date());

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      };
    };

    console.log(
      "i18n",
      this.shadowRoot.getElementById("nota-date-picker").i18n
    );

    this.shadowRoot.getElementById("nota-date-picker").i18n.monthNames[5] =
      "Junio";

    if (this.shadowRoot.getElementById("nota-date-picker")) {
      this.shadowRoot.getElementById("nota-date-picker").i18n = {
        ...this.shadowRoot.getElementById("nota-date-picker").i18n,
        formatDate: formatDateIso8601,
        parseDate: parseDateIso8601,
      };
    }
  }

  change(e: any) {
    this.fecha = e.target.value;
    let event = new CustomEvent("change", {
      detail: e,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`<vaadin-date-picker
      id="nota-date-picker"
      label="Fecha"
      value="2022-12-03"
      placeholder="YYYY-MM-DD"
      .value=${this.fecha}
      clear-button-visible
      @change=${this.change}
    ></vaadin-date-picker> `;
  }
}

customElements.define("date-picker", DatePicker);
