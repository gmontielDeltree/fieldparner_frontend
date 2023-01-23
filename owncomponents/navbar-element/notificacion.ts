import { formatDistance } from "date-fns";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { html } from "lit";

import es from "date-fns/locale/es";
export interface Notificacion {
  msg: string;
  distancia_tiempo: any;
  url: string;
  fecha_generada: Date;
  tipo: string;
  desde: string;
}


export const notificacion_template = (
  notificacion: Notificacion,
  index: number
) => {
  return html`
    <li>
      <a href=${notificacion.url} class="dropdown-item">
        <!-- Message Start -->
        <div class="media">
        
          <div class="media-body">
            <h5 class="dropdown-item-title"><i class="fa-solid fa-truck-pickup"></i> ${notificacion.tipo}</h5>
            <p class="fs-6">${notificacion.msg}</p>
            <p class="fs-6 text-muted">
              <i class="far fa-clock mr-1"></i> ${formatDistanceToNow(notificacion.fecha_generada,{locale:es})}
            </p>
          </div>
        </div>
        <!-- Message End -->
      </a>
    </li>
  `;
};
