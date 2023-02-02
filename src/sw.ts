import { cacheNames, clientsClaim } from "workbox-core";
import {
  registerRoute,
  setCatchHandler,
  setDefaultHandler,
} from "workbox-routing";
import type { StrategyHandler } from "workbox-strategies";
import { NetworkFirst, NetworkOnly, Strategy, StaleWhileRevalidate } from "workbox-strategies";
import type { ManifestEntry } from "workbox-build";

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope;
declare type ExtendableEvent = any;

const data = {
  race: false,
  debug: false,
  credentials: "same-origin",
  networkTimeoutSeconds: 0,
  fallback: "index.html",
};

const cacheName = cacheNames.runtime;

const manifest = self.__WB_MANIFEST as Array<ManifestEntry>;

const cacheEntries: RequestInfo[] = [];


// Fechas de generacion
registerRoute(/.*us-south\.functions\.appdomain\.cloud\/api\/v1\/web\/2659fadf-b282-4e49-b323-bf8cd87cd5e6\/default\/indicesdates.*$/,new StaleWhileRevalidate({cacheName:'fechas_stale'}))

setDefaultHandler(new NetworkOnly());

// this is necessary, since the new service worker will keep on skipWaiting state
// and then, caches will not be cleared since it is not activated
self.skipWaiting();
clientsClaim();
