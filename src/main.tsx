import React from "react";
import ReactDOM from "react-dom/client";
import "../owncomponents/loader";
import { AppRouter } from "./routers/AppRouter";


/* Supongo que esto hay que wrappearlo con algún componente de Auth */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
