
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.invoke-jx7rw": { type: "done.invoke.invoke-jx7rw"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.invoke-kr9hc": { type: "done.invoke.invoke-kr9hc"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.invoke-nt3gq": { type: "done.invoke.invoke-nt3gq"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.invoke-o16z2": { type: "done.invoke.invoke-o16z2"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.invoke-jx7rw": { type: "error.platform.invoke-jx7rw"; data: unknown };
"error.platform.invoke-kr9hc": { type: "error.platform.invoke-kr9hc"; data: unknown };
"error.platform.invoke-nt3gq": { type: "error.platform.invoke-nt3gq"; data: unknown };
"error.platform.invoke-o16z2": { type: "error.platform.invoke-o16z2"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "fetchImagen": "done.invoke.invoke-kr9hc";
"fetchImagenInicial": "done.invoke.invoke-o16z2";
"getFeatures": "done.invoke.invoke-nt3gq";
"getGeojson": "done.invoke.invoke-jx7rw";
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
"fetchImagenInicial": "done.invoke.invoke-nt3gq";
"getFeatures": "RETRY" | "done.invoke.invoke-jx7rw";
"getGeojson": "xstate.init";
        };
        matchesStates: "done" | "empty" | "failed" | "fetchImagenInicial" | "loadNuevaImagen1" | "loadNuevaImagen2" | "loaded" | "loaded.pantallaDividida" | "loaded.pantallaEntera" | "withGeojson" | { "loaded"?: "pantallaDividida" | "pantallaEntera"; };
        tags: never;
      }
  