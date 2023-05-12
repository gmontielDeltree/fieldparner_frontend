import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../owncomponents/loader";
import ReactComponentTEST from "./components/ReactComponentTEST";
import { old_routes } from "./old_routes";

// Aca pueden ir agregando nuevos routes.

const router = createBrowserRouter([
  ...old_routes, // old_routes es la parte "vieja" de la app
  // todo lo nuevo de aca para abajo
  { path: "/react-test", element: <ReactComponentTEST></ReactComponentTEST> },
]);

/* Supongo que esto hay que wrappearlo con algún componente de Auth */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
