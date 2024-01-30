// Se inyecta bootstrap https://vitejs.dev/guide/features.html#css
import "bootstrap/dist/css/bootstrap.min.css";
//import "./owncomponents/loader.ts";
import "./owncomponents/pwa-update.ts";
import '@shoelace-style/shoelace/dist/themes/light.css';

// if (import.meta.env.DEV) {
//   //await import("./owncomponents/devel_loader.ts");
//   await import("./owncomponents/loader.ts");
// } else {
//   await import("./owncomponents/loader.ts");
// }

// if ('serviceWorker' in navigator) {
//         navigator.serviceWorker.register(
//           import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw',
//           { type: import.meta.env.MODE === 'production' ? 'classic' : 'module' }
//         )
//       }
      
console.log("main.js loaded");
