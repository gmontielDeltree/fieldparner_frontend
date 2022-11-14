import { ReactiveController, ReactiveControllerHost } from "lit";
import { Notificacion } from "./notificacion";
import gbl_state, { gblStateLoaded } from "../state";
import { Actividad } from "../depositos/depositos-types";
import isFuture from "date-fns/isFuture";
import parseISO from "date-fns/parseISO";
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

export class NotificacionController implements ReactiveController {
  host: ReactiveControllerHost;
  value = new Date();
  notificaciones: Notificacion[];
  timeout: number;
  private _timerID?: number;

  constructor(host: ReactiveControllerHost, timeout = 10000) {
    (this.host = host).addController(this);
    this.timeout = timeout;
  }

  generarNotificaciones = () => {
    if (gblStateLoaded()) {
      gbl_state.db
        .allDocs({
          include_docs: true,
          attachments: true,
          binary: true,
          //descending:true,
          startkey: "actividad:",
          endkey: "actividad:\ufff0",
        })
        .then((e) => {
          let acts = e.rows.map((r) => r.doc) as unknown as Actividad[];

          //   Filtramos lo que es nota y es en el futuro
          let s1 = acts.filter(({ tipo, proxima_visita }) => {
            if (tipo === "nota" && isFuture(parseISO(proxima_visita))) {
              return true;
            } else {
              return false;
            }
          });

          //   por cada actividad que paso el filtro, generamos una notificacion
          let notif = s1.map((nota) => {
            let n: Notificacion = {
              tipo: "Próxima Visita",
              url: `/campo/lote/${nota.lote_uuid}`,
              fecha_generada: new Date(),
              msg: "programada en " + formatDistanceToNow(parseISO(nota.proxima_visita)),
              distancia_tiempo: new Date(),
            };

            return n;
          });

          this.notificaciones = notif;

          console.log("Lista de Notificaciones", this.notificaciones);
          this.host.requestUpdate();
        });
    }
  };

  hostConnected() {
    // Start a timer when the host is connected
    this._timerID = setInterval(this.generarNotificaciones, this.timeout);
  }

  hostDisconnected() {
    // Clear the timer when the host is disconnected
    clearInterval(this._timerID);
    this._timerID = undefined;
  }
}
