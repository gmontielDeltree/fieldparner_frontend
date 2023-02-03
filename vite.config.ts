import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from "vite";
import Compression from "vite-compression-plugin";
import { VitePWA } from "vite-plugin-pwa";
import manifest_json from "./src/manifest.json"

export default {
  // config options para pouch
  optimizeDeps: {
    allowNodeBuiltins: ["pouchdb-browser", "pouchdb-utils",'pouchdb'],
    esbuildOptions: {
            // Node.js global to browser globalThis
            //https://gist.github.com/FbN/0e651105937c8000f10fefdf9ec9af3d
            // indispensable para poder importar pouchdb en el service worker
            // 
            define: {
                global: 'globalThis' 
            },}
  },
  plugins: [
    visualizer(),
    Compression(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: manifest_json,
      injectRegister: null, // Registrar 'a mano' en index.html
      strategies: "injectManifest",
      injectManifest: {
        injectionPoint: undefined
      },
      srcDir: "src",
      filename: "sw.ts",
    }),
  ],
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
      manualChunks: {
        // pdfmake: ['pdfmake','node_modules/pdfmake/build/vfs_fonts.js'],
        mapboxgl: ["mapbox-gl", "node_modules/mapbox-gl/dist/mapbox-gl.js"],
        geoblaze: [
          "geoblaze",
          "node_modules/geoblaze/dist/geoblaze.web.min.js",
        ],
        xlsx: ["xlsx", "node_modules/xlsx/xlsx.mjs"],
        apexcharts: [
          "apexcharts",
          "node_modules/apexcharts/dist/apexcharts.common.js",
        ],
        vaadiniconset: [
          "@vaadin/icons",
          "node_modules/@vaadin/icons/vaadin-iconset.js",
        ],

      },
    },
  },
};
