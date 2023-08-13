import { state } from "lit/decorators.js";
import { createMachine, assign, send, ActorRef, ActorRefWithDeprecatedState, AnyActorRef } from "xstate";

interface Alert {
	_id: string,
	alert_type: string,
	threshold_1:number,
	threshold_2:number,
	mail:string
}

interface AlertsEditorContext {
  alerts: {alert: Alert,actorRef:AnyActorRef}[];
}

const fetch_news_feed = async (ctx, evt) => {
  let a = await fetch(import.meta.env.VITE_COGS_SERVER_URL + "/newsfeed")
  let b = await a.json()
  return b
};

export const alertas_editor_machine = createMachine<AlertsEditorContext>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEMA2YBOAXZsD6kAllgPYZ4C2yAxgBaEB2YAdAG42EkDEAYgKIAVAMIAJPgBEA2gAYAuolAAHErGKcGCkAA9EARgAsATmaHDAZgDsAVl1WATFYAcFx4YA0IAJ57pd5mfMLfQszO0MLXV1DXQBfGI80TBx8IlJyKjpGFgwwakIAI0IIbgAlPh4ygGURGXkkEGVVLHVNHQRpD292uIT0bFwCCGIyShp6JmYcgDMc2HGoXkFRCVrNRrUSDXq2jq9EaTj4kAYSCDhNRP6UobTRzKY1lQ2t0DaAWgA2aWYLD+dLCyGMJ-aydRBvAxWZiOSxWaTRKz2EL6fQ9ECXZKDYbpMZZNgcEiPJotbbg3R+X7-CyA4HOKxghCGb5WD52IwfXSOKxmXwhNEYgapEYZcbZXIFIqE+rrZqbVqIOyOPyc6w8mzWFy6BlWYyRNkw8JKiL6Ryoo4C67Yu6iyZgGZweZE57yhC6CzfUJw8l2aTuszk+l7BBvJzMXSsuEc6RmGwshyHGJAA */
    id: "alertas_editor_machine",
    initial: "vacio",
    context: { alerts: [] },
    states: {
      vacio:{
	on:{
		FETCHED:"recibido"
	}
      },
      
      recibido:{
	on:{
		"REFRESH":"refreshing"
	}
      },

      refreshing:{
	on:{
		"FETCHED":"recibido"
	}
      }
    },
  },
  {
    actions: {
      
    },
  }
);
