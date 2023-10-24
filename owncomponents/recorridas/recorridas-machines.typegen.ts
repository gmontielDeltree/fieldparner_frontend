
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.invoke-m7wb9": { type: "done.invoke.invoke-m7wb9"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.invoke-m7wb9": { type: "error.platform.invoke-m7wb9"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "fetchRecorrida": "done.invoke.invoke-m7wb9";
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
          "editarRecorrida": "";
        };
        eventsCausingServices: {
          "fetchRecorrida": "";
        };
        matchesStates: "failedFetch" | "inicial" | "loadRecorrida" | "loaded" | "loaded.editandoPunto" | "loaded.empty" | "loaded.mostrandoRecorrida" | { "loaded"?: "editandoPunto" | "empty" | "mostrandoRecorrida"; };
        tags: never;
      }
  