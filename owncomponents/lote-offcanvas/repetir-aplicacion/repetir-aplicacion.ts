import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Actividad } from "../../depositos/depositos-types";
import "./repetir-aplicacion-dosis";
import "./repetir-aplicacion-selector";

@customElement("repetir-aplicacion")
export class RepetirAplicacion extends LitElement {
  @state({ hasChanged: (o, n) => false })
  campos: any[] = [];

  @state()
  loaded: boolean = false;

  @state()
  selected_lotes: any[] = [];

  @state({ hasChanged: (o, v) => false })
  paso: number = 0;

  @property()
  actividad : Actividad

  constructor() {
    super();
    this.addEventListener("seleccion-campo", (e: CustomEvent) => {
      let lote = e.detail;
      this.selected_lotes.push(lote);
      this.selected_lotes = [...this.selected_lotes];
    });

    this.addEventListener('siguiente', (e:CustomEvent) => {
	this.paso = this.paso + 1
    })

    this.addEventListener('atras', (e:CustomEvent) => {
	this.paso = this.paso - 1
    })
  }

  


  render() {
    if (this.loaded) {
      if (this.paso === 0) {
        return html` <repetir-aplicacion-selector .campos=${this.campos} /> `;
      } else if (this.paso === 1) {
        return html` <repetir-aplicacion-dosis .lotes=${this.selected_lotes} .actividad=${this.actividad}/> `;
      }
    }

    return null;
  }
}
