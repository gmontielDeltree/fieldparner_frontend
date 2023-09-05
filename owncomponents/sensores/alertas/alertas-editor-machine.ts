import { state } from "lit/decorators.js";
import { spawn, actions, sendParent } from "xstate";
import {
  createMachine,
  assign,
  send,
  ActorRef,
  ActorRefWithDeprecatedState,
  AnyActorRef,
} from "xstate";

// Es la interface de lo que devuelve la api
export interface Alert {
  _id: string;
  alert_type: string;
  variable: string;
  threshold_1: number;
  threshold_2: number;
  mail: string;
}

interface AlertsEditorContext {
  device_id: string;
  alerts: { alert: Alert; actorRef: AnyActorRef }[];
  error: string;
}

const fetch_news_feed = async (ctx, evt) => {
  let a = await fetch(import.meta.env.VITE_COGS_SERVER_URL + "/newsfeed");
  let b = await a.json();
  return b;
};

const fetch_alerts_by_device = async (dev_id) => {
  return Promise.resolve([
    {
      _id: "1",
      alert_type: "is_below",
      variable: "temperatura",
      threshold_1: 12,
      threshold_2: 0,
      mail: "aa@cc.com",
    },
  ]);
};

export const alertas_editor_machine = createMachine<AlertsEditorContext>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEMA2YBOAXZsD6kAllgPYZ4C2yAxgBaEB2YAdAG42EkDEAYgKIAVAMIAJPgBEA2gAYAuolAAHErGKcGCkAA9EARgAsATmaHDAZgDsAVl1WATFYAcFx4YA0IAJ57pd5mfMLfQszO0MLXV1DXQBfGI80TBx8IlJyKjpGFgwwakIAI0IIbgAlPh4ygGURGXkkEGVVLHVNHQRpD292uIT0bFwCCGIyShp6JmYcgDMc2HGoXkFRCVrNRrUSDXq2jq9EaTj4kAYSCDhNRP6UobTRzKY1lQ2t0DaAWgA2aWYLD+dLCyGMJ-aydRBvAxWZiOSxWaTRKz2EL6fQ9ECXZKDYbpMZZNgcEiPJotbbg3R+X7-CyA4HOKxghCGb5WD52IwfXSOKxmXwhNEYgapEYZcbZXIFIqE+rrZqbVqIOyOPyc6w8mzWFy6BlWYyRNkw8JKiL6Ryoo4C67Yu6iyZgGZweZE57yhC6CzfUJw8l2aTuszk+l7BBvJzMXSsuEc6RmGwshyHGJAA */
    id: "alertas_editor_machine",
    initial: "vacio",
    context: { device_id: "", alerts: [], error: "" },
    states: {
      vacio: {
        invoke: {
          id: "getAlerts",
          src: (context, event) => fetch_alerts_by_device(context.device_id),
          onDone: {
            target: "recibido",
            actions: assign({
              alerts: (context, event) =>
                (event.data as Alert[]).map((a) => {
                  return {
                    alert: a,
                    actorRef: spawn(create_alerta_machine(a)),
                  };
                }),
            }),
          },
          onError: {
            target: "failure",
            actions: assign({ error: (context, event) => event.data }),
          },
        },
        on: {
          FETCHED: "recibido",
        },
      },

      recibido: {
        on: {
          REFRESHIT: "refreshing",
          "TODO.DELETE": {
            actions: [
              assign({
                alerts: (context, event) =>
                  context.alerts.filter((a) => a.alert._id !== event.id)
              }),
              "borrar_alerta_del_backend"
            ]
          }
        },
      },

      refreshing: {
        on: {
          FETCHED: "recibido",
        },
      },

      failure: {
        on: {
          RETRY: "vacio",
        },
      },
    },
  },
  {
    actions: {
      "borrar_alerta_del_backend":()=>console.log("IMPLEMENTAR_BORRAR_ALERTA")
    },
  }
);

// Los argumentos de esta funcion pueden servir para setear el ctx inicial.
// Incluso puedo pasar todo el objeto Alert
const create_alerta_machine = (a: Alert) =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5SwJYDsoBswH0CG2ATgC4DEAIgKIAylAKpQNoAMAuoqAA4D2qxK3NBxAAPRABYATABoQAT0QBmAKwAOAHTiA7ADZmq1Yp0BGccuM6AvpdmoM2fEWLq03HLDDYAxv0GkAwgASAIIAcgDilDgAasEASizsSCA8fAJCyWIIxqpa6gCcilrmysw6OmpmqrIKCOJS6pLlWjnM+VplplrWtuhYuARgJOqQKPwYASERUbEJbMKpY+nCWSqS6qpt4sxl+fnKezVKLZrFzPXiiuLlBj0gdv2OQ86j41CTYZE4dMaJC7xLQQrJQHdSKK6KfJSEz5Jr7I4ISRacQbM6KfTGfK7STKO4PByDYavPofabfSR-ZKLXwZUCrUHgy5QpqYuHKBHGLQaJGlTmSZhXHTtKw2e59AlOEYQJYTIKfKIAWWCAElqJSuACacCEFd8updDjJFJIcVFDiEapjOodGcBWouR1JMY8eKBpLiRMAMrBaJMeZUzXLTKIcx5HSWySqHTgllXBH1PXmHElI0qLT7ayi1wQODCfFu57-NJA4MIAC0OgRFZd9gLw1c7k8YB8QY1xdpogkMnkEgqG0ksKNOkkA5auhrj0JL2lbyLgI7q1U62MykUK+MbRhFXjWkU6mYZzUzFKTUME4lz3UsDwADdIHOtaXh3uoUVCvpkbvKz26rv94fNhPcNFHPOtnBzbBiHvAN221VlrQjcoygFLRUIRRl1GMEd9nEUx8kMdFcUzIA */
      id: "single_alert",
      initial: "no_selection",
      context: a,
      on: {
        DELETE: "deleted",
      },
      states: {
        no_selection: {
          on: {
            CHANGE_VAR: {
              target: "editing",
              actions: assign({ variable: (ctx, e) => e.value as string }),
            },
          },
        },
        editing: {
          on: {
            CHANGE_VAR: {
              target: "editing",
              actions: assign({ variable: (ctx, e) => e.value as string }),
            },
            CHANGE_T1: {
              actions: assign({ threshold_1: (ctx, e) => +e.value as number }),
            },
            CHANGE_T2: {
              actions: assign({ threshold_2: (ctx, e) => +e.value as number }),
            },
            CHANGE_MAIL: {
              actions: assign({ mail: (ctx, e) => e.value as string }),
            },
            SAVE: {
              target: "saved",
              actions: "save",
            },
          },
        },
        saved: {},
        deleted: {
          type: "final",
          onEntry: sendParent((context) => ({
            type: "ALERT.DELETE",
            id: context._id
          })),
        },
      },
    },
    {
      actions: {
        save: () => console.log("TODO SAVE ALERT"),
      },
    }
  );
