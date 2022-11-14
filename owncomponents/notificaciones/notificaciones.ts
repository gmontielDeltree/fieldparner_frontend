import { LitElement, html} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import fontawesome from "@fortawesome/fontawesome-free/css/all.min.css";

import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/dropdown";

interface Notificacion {
  msg: string;
  distancia_tiempo: any;
  url: string;
  fecha_generada: Date;
  tipo: string;
}


@customElement("notificaciones-item")
class NotificacionesItem extends LitElement {
  static styles = [unsafeCSS(bootstrap), unsafeCSS(fontawesome)];

  @state()
  cantidad_de_notificaciones: number = 0;

  @state()
  notificaciones: Notificacion[];

  render() {
    const proxima_visita_item = (notif_nota: Notificacion) => html`
      <a href=${notif_nota.url} class="dropdown-item">
        <i class="fas fa-users mr-2"></i> ${notif_nota.msg}
        <span class="float-right text-muted text-sm"
          >${notif_nota.distancia_tiempo}</span
        >
      </a>
    `;

    return html`<div class="nav-item dropdown">
      <a
        class="me-3 dropdown-toggle hidden-arrow"
        href="#"
        id="navbarDropdownMenuLink"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="far fa-bell"></i>
        <span class="badge rounded-pill badge-notification bg-danger">1</span>
      </a>
      <ul
        class="dropdown-menu dropdown-menu-end"
        aria-labelledby="navbarDropdownMenuLink"
      >
        <li>
          <a class="dropdown-item" href="#">Some news</a>
        </li>
        <li>
          <a class="dropdown-item" href="#">Another news</a>
        </li>
        <li>
          <a class="dropdown-item" href="#">Something else here</a>
        </li>
      </ul>
    </div> `;
  }
}
