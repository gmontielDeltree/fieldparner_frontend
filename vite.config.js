import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from 'vite';
import Compression from 'vite-compression-plugin'

export default {
    // config options para pouch
    optimizeDeps: {
        allowNodeBuiltins: ['pouchdb-browser', 'pouchdb-utils']
    },
    
    plugins: [visualizer(), Compression()],
    build: {
        rollupOptions: {
          // https://rollupjs.org/guide/en/#big-list-of-options
          manualChunks: {
           // pdfmake: ['pdfmake','node_modules/pdfmake/build/vfs_fonts.js'],
           mapboxgl: ['mapbox-gl','node_modules/mapbox-gl/dist/mapbox-gl.js'],
           geoblaze: ['geoblaze','node_modules/geoblaze/dist/geoblaze.web.min.js'],
           xlsx: ['xlsx','node_modules/xlsx/xlsx.mjs'],
           apexcharts: ['apexcharts','node_modules/apexcharts/dist/apexcharts.common.js'],
           vaadiniconset: ['@vaadin/icons','node_modules/@vaadin/icons/vaadin-iconset.js'],
          }
        }
      }
  }