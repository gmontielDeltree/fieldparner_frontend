import { cacheNames, clientsClaim, skipWaiting } from "workbox-core";
import {
  registerRoute,
  setCatchHandler,
  setDefaultHandler,
} from "workbox-routing";
import { precacheAndRoute } from "workbox-precaching";
import type { StrategyHandler } from "workbox-strategies";
import {
  NetworkFirst,
  CacheFirst,
  NetworkOnly,
  Strategy,
  StaleWhileRevalidate,
} from "workbox-strategies";
import type { ManifestEntry } from "workbox-build";

const global = self;

import PouchDB from "pouchdb";
import {
  postData,
  SWFileAttachment,
  sw_docs_starting,
  sw_get_file_doc,
  sw_only_docs,
  sw_post_file_doc,
} from "./sw-helpers";

let adjuntos_db = new PouchDB("adjuntos");
//adjuntos_db.put({_id:'esbolonio',bolonio:3})

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope;
declare type ExtendableEvent = any;

// self.__WB_MANIFEST is default injection point
// precacheAndRoute(self.__WB_MANIFEST);
precacheAndRoute([]);

// Mapas tiles
registerRoute(
  /.*ecn\.t1\.tiles\.virtualearth\.net.*$/,
  new CacheFirst({ cacheName: "maptiles" })
);

registerRoute(
  /.*\.cloudantnosqldb\.appdomain\.cloud.*\/processed_device_telemetry/,
  new NetworkFirst()
);

registerRoute(
  /.*(?<!events\.)(?:mapbox)\.com\/(?!map\-sessions).*$/,
  new CacheFirst()
);

registerRoute(
  /.*server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile.*$/,
  new CacheFirst({ cacheName: "maptiles" })
);

// Geotiffs
registerRoute(/.*\.geotiff$/, new CacheFirst({ cacheName: "geotiff" }));

// Fechas de generacion
registerRoute(
  /.*us-south\.functions\.appdomain\.cloud\/api\/v1\/web\/2659fadf-b282-4e49-b323-bf8cd87cd5e6\/default\/indicesdates.*$/,
  new StaleWhileRevalidate({ cacheName: "fechas_stale" })
);

// https://stackoverflow.com/questions/68772017/serviceworker-not-intercepting-calls-immediately-after-installation
// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

registerRoute(
  "/attachments",
  async ({ url, request, event, params }) => {
    console.log("ATT GET", url, event, params);
    let filename = url.searchParams.get("file");
    let file_doc: SWFileAttachment = (await sw_get_file_doc(
      adjuntos_db,
      filename
    )) as SWFileAttachment;
    if (file_doc !== null) {
      //existe
      let blob = file_doc._attachments["file_0"].data;
      let content_type = file_doc._attachments["file_0"].data;
      //request.clone()
      const response = await fetch(request);
      const responseBody = await response.text();
      return new Response(blob, {
        headers: response.headers,
      });
    } else {
      // no existe
      const response = await fetch(request);
      const responseBody = await response.text();
      return new Response(`{"error":"no se encuentra el archivo"}`, {
        headers: response.headers,
        status: 404,
      });
    }
  },
  "GET"
);

registerRoute(
  "/attachments",
  async ({ url, request, event, params }) => {
    const response = await fetch(request);
    const data = await request.formData();


    // Get the data from the named element 'file'
    const file = data.get("file");
    console.log("FILE UPLOAD", file)
    postData('serverurl')

    //sw_post_file_doc(adjuntos_db,)

    return new Response(`<!-- Look Ma. Added Content. -->`, {
      headers: response.headers,
    });
  },
  "POST"
);

/* Upload Excel handler */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") return;
  // Es POST
  if (event.request.url.includes("excel-contratistas-upload") === false) return;
  // Es shared-audio

  /* This is to fix the issue Jake found */
  //event.respondWith(Response.redirect('/index.html'));
  event.respondWith(
    new Response(
      "<p>This is a response that comes from your service worker!</p>",
      {
        headers: { "Content-Type": "text/html" },
      }
    )
  );

  event.waitUntil(
    (async function () {
      const data = await event.request.formData();
      const client = await self.clients.get(
        event.resultingClientId || event.clientId
      );
      // Get the data from the named element 'file'
      const file = data.get("file");

      console.log("Excel file", file);
      client.postMessage({ file, action: "load-excel" });
    })()
  );
});

/* Upload Excel handler */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") return;
  // Es POST
  if (event.request.url.includes("excel-insumos-upload") === false) return;
  // Es shared-audio

  /* This is to fix the issue Jake found */
  //event.respondWith(Response.redirect('/index.html'));
  event.respondWith(
    new Response(
      "<p>This is a response that comes from your service worker!</p>",
      {
        headers: { "Content-Type": "text/html" },
      }
    )
  );

  event.waitUntil(
    (async function () {
      const data = await event.request.formData();
      const client = await self.clients.get(
        event.resultingClientId || event.clientId
      );
      // Get the data from the named element 'file'
      const file = data.get("file");

      console.log("Excel file", file);
      client.postMessage({ file, action: "load-excel-insumos" });
    })()
  );
});

/* Share Audio handler */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") return;
  // Es POST
  if (event.request.url.includes("shared-audio") === false) return;
  // Es shared-audio

  /* This is to fix the issue Jake found */
  event.respondWith(Response.redirect("/index.html"));

  event.waitUntil(
    (async function () {
      const data = await event.request.formData();
      const client = await self.clients.get(
        event.resultingClientId || event.clientId
      );
      // Get the data from the named element 'file'
      const file = data.get("file");

      console.log("Audio file", file);
      client.postMessage({ file, action: "load-audio" });
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.endsWith(".json")) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new NetworkFirst();
    event.respondWith(cacheFirst.handle({ request: event.request, event }));
  }

  if (event.request.url.endsWith(".html")) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new NetworkFirst();
    event.respondWith(cacheFirst.handle({ request: event.request, event }));
  }

  if (event.request.url.endsWith(".js") || event.request.url.endsWith(".css")) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new NetworkFirst();
    event.respondWith(cacheFirst.handle({ request: event.request, event }));
  }

  if (
    event.request.url.endsWith(".svg") ||
    event.request.url.endsWith(".png")
  ) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new CacheFirst();
    event.respondWith(cacheFirst.handle({ request: event.request, event }));
  }

  if (event.request.url.includes("https://events.mapbox.com/")) {
    event.respondWith(
      new Response("<h1>Service Unavailable</h1>", {
        status: 200,
        statusText: "Fake Unavailable",
        headers: new Headers({ "Content-Type": "text/html" }),
      })
    );
  }

  if (event.request.url.includes("https://api.mapbox.com/map-sessions/v1")) {
    event.respondWith(
      new Response("<h1>Service Unavailable</h1>", {
        status: 200,
        statusText: "Fake Unavailable",
        headers: new Headers({ "Content-Type": "text/html" }),
      })
    );
  }
});

//setDefaultHandler(new NetworkOnly());

// this is necessary, since the new service worker will keep on skipWaiting state
// and then, caches will not be cleared since it is not activated
self.skipWaiting();
clientsClaim();
