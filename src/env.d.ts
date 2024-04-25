/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AUTH_API: string;
    readonly VITE_COUCHDB_URL: string;
    readonly VITE_COGS_SERVER_URL: string;
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }