importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');

const version = "0004"

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



  // const bgSyncAudioPlugin = new backgroundSync.BackgroundSyncPlugin('audioQueue', {
  // maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
  // callbacks: {
  //     queueDidReplay: showNotification
  //     // other types of callbacks could go here
  //   }
  // });


  // const networkWithBackgroundSync =  routing.registerRoute(
  //                                       /\/phpiot20\/apiv0\/observaciones\.php/,
  //                                       new strategies.NetworkOnly({
  //                                         plugins: [bgSyncPlugin],
  //                                       }),

  //                                       'POST'
  //                                     );


  // const networkAudioWithBackgroundSync = routing.registerRoute(
  //   /\/phpiot20\/apiv0\/upload_audio\.php/,
  //   new strategies.NetworkOnly({
  //     plugins: [bgSyncAudioPlugin],
  //   }),

  //   'POST'
  // );

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

// routing.registerRoute(
//   ({url}) => url.pathname.includes('/posiciones_devices.php'),
//   new strategies.NetworkFirst()
// );


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