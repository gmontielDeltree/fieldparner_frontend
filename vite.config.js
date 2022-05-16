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
            pdfmake: ['pdfmake','node_modules/pdfmake/build/vfs_fonts.js'],

            "agrotools_logo_b64.js": ['./owncomponents/lote-offcanvas/agrotools_logo_b64.js']
          }
        }
      }
  }