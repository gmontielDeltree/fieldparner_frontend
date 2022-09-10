import { visualizer } from "rollup-plugin-visualizer";
export default {
    // config options para pouch
    optimizeDeps: {
        allowNodeBuiltins: ['pouchdb-browser', 'pouchdb-utils']
    },
    
    plugins: [visualizer()],
    build: {
        rollupOptions: {
          // https://rollupjs.org/guide/en/#big-list-of-options
          manualChunks: {
           // pdfmake: ['pdfmake','node_modules/pdfmake/build/vfs_fonts.js'],
           mapboxgl: ['mapbox-gl','node_modules/mapbox-gl/dist/mapbox-gl.js'],
          }
        }
      }
  }