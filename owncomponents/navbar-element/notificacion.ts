import { formatDistance } from "date-fns";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { html } from "lit";

export interface Notificacion {
  msg: string;
  distancia_tiempo: any;
  url: string;
  fecha_generada: Date;
  tipo: string;
}


export const notificacion_template = (
  notificacion: Notificacion,
  index: number
) => {
  return html`
    <li>
      <a href="#" class="dropdown-item">
        <!-- Message Start -->
        <div class="media">
          <img
            src="dist/img/user3-128x128.jpg"
            alt="User Avatar"
            class="img-size-50 img-circle mr-3"
          />
          <div class="media-body">
            <h5 class="dropdown-item-title">${notificacion.tipo}</h5>
            <p class="fs-6">${notificacion.msg}</p>
            <p class="fs-6 text-muted">
              <i class="far fa-clock mr-1"></i> ${formatDistanceToNow(notificacion.fecha_generada)}
            </p>
          </div>
        </div>
        <!-- Message End -->
      </a>
    </li>
  `;
};
