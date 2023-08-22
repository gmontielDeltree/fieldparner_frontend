
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.invoke-kr9hc": { type: "done.invoke.invoke-kr9hc"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.invoke-nt3gq": { type: "done.invoke.invoke-nt3gq"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.invoke-kr9hc": { type: "error.platform.invoke-kr9hc"; data: unknown };
"error.platform.invoke-nt3gq": { type: "error.platform.invoke-nt3gq"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "fetchImagen": "done.invoke.invoke-kr9hc";
"getFeatures": "done.invoke.invoke-nt3gq";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "fetchImagen": "SELECTED_FEATURE_1" | "SELECTED_FEATURE_2" | "SELECTED_INDICE_1_CHANGED" | "SELECTED_INDICE_2_CHANGED";
"getFeatures": "RETRY" | "xstate.init";
        };
        matchesStates: "Empty" | "Loaded" | "Loaded.PantallaDividida" | "Loaded.PantallaEntera" | "failed" | "loadNuevaImagen1" | "loadNuevaImagen2" | { "Loaded"?: "PantallaDividida" | "PantallaEntera"; };
        tags: never;
      }
  