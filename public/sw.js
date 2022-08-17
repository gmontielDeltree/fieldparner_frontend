importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');

const version = "0006"

// This will trigger the importScripts() for workbox.strategies and its dependencies:
const {strategies, routing, backgroundSync} = workbox;

if (workbox) {
  
  console.log(`Yay! Workbox is loaded 🎉`);
  console.log("SW Version", version);
  workbox.precaching.precacheAndRoute([]);

  const showNotification = () => {
    self.registration.showNotification('Background sync success!', {
      body: '🎉`🎉`🎉`'
    });
  };


} else {
  console.log(`Boo! Workbox didn't load 😬`);
}


routing.registerRoute(/.*\.cloudantnosqldb\.appdomain\.cloud.*\/processed_device_telemetry/, new strategies.NetworkFirst());

routing.registerRoute(/.*(?<!events\.)(?:mapbox)\.com\/(?!map\-sessions).*$/, new strategies.CacheFirst());


routing.registerRoute(
  ({request}) => request.destination === 'image',
  new strategies.CacheFirst({
    cacheName: 'image-cache',
  })
);

routing.registerRoute(
  ({request}) => request.destination === 'audio',
  new strategies.CacheFirst({
    cacheName: 'audio-cache',
  })
);

// https://stackoverflow.com/questions/68772017/serviceworker-not-intercepting-calls-immediately-after-installation
// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

/* Upload Excel handler */
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'POST') return;
  // Es POST
  if (event.request.url.includes('excel-contratistas-upload') === false) return;
  // Es shared-audio

  /* This is to fix the issue Jake found */
  //event.respondWith(Response.redirect('/index.html'));
  event.respondWith(new Response('<p>This is a response that comes from your service worker!</p>', {
    headers: { 'Content-Type': 'text/html' }
  }))

  event.waitUntil(async function () {
    const data = await event.request.formData();
    const client = await self.clients.get(event.resultingClientId || event.clientId);
    // Get the data from the named element 'file'
    const file = data.get('file');

    console.log('Excel file', file);
    client.postMessage({ file, action: 'load-excel' });
  }());
});

/* Upload Excel handler */
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'POST') return;
  // Es POST
  if (event.request.url.includes('excel-insumos-upload') === false) return;
  // Es shared-audio

  /* This is to fix the issue Jake found */
  //event.respondWith(Response.redirect('/index.html'));
  event.respondWith(new Response('<p>This is a response that comes from your service worker!</p>', {
    headers: { 'Content-Type': 'text/html' }
  }))

  event.waitUntil(async function () {
    const data = await event.request.formData();
    const client = await self.clients.get(event.resultingClientId || event.clientId);
    // Get the data from the named element 'file'
    const file = data.get('file');

    console.log('Excel file', file);
    client.postMessage({ file, action: 'load-excel-insumos' });
  }());
});

/* Share Audio handler */
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'POST') return;
  // Es POST
  if (event.request.url.includes('shared-audio') === false) return;
  // Es shared-audio

  /* This is to fix the issue Jake found */
  event.respondWith(Response.redirect('/index.html'));
  
  event.waitUntil(async function () {
    const data = await event.request.formData();
    const client = await self.clients.get(event.resultingClientId || event.clientId);
    // Get the data from the named element 'file'
    const file = data.get('file');

    console.log('Audio file', file);
    client.postMessage({ file, action: 'load-audio' });
  }());
});

self.addEventListener('fetch', (event) => {


  if (event.request.url.endsWith('.json')) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new strategies.NetworkFirst();
    event.respondWith(cacheFirst.handle({request: event.request, event}));
  }

  if (event.request.url.endsWith('.html')) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new strategies.NetworkFirst();
    event.respondWith(cacheFirst.handle({request: event.request, event}));
  }

  if (event.request.url.endsWith('.js') || event.request.url.endsWith('.css')) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new strategies.NetworkFirst();
    event.respondWith(cacheFirst.handle({request: event.request, event}));
  }

  if (event.request.url.endsWith('.svg') || event.request.url.endsWith('.png')) {
    // Using the previously-initialized strategies will work as expected.
    const cacheFirst = new strategies.StaleWhileRevalidate();
    event.respondWith(cacheFirst.handle({request: event.request, event}));
  }

  if (event.request.url.includes("https://events.mapbox.com/")) {
    event.respondWith(new Response('<h1>Service Unavailable</h1>', {status: 200,statusText: 'Fake Unavailable', headers: new Headers({'Content-Type': 'text/html'})}));
  }

   if (event.request.url.includes("https://api.mapbox.com/map-sessions/v1")) {
    event.respondWith(new Response('<h1>Service Unavailable</h1>', {status: 200,statusText: 'Fake Unavailable', headers: new Headers({'Content-Type': 'text/html'})}));
  }

});