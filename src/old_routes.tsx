import React from "react";
import "../owncomponents/loader";
import { ListaVehiculoPage } from "./pages";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "app-loader": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

// Con estas configs simplemente hacemos que react-router renderize el wrapper de
// la app "vieja" en las rutas que la app "vieja" usa.
// Por ahora ruteo "interno" de la parte existente de la app lo sigue haciendo Vaadin Router.
// Por esa la razon usamos los '*' para matchear las subrutas.

export const old_routes = [
  {
    path: "/",
    element: <app-loader></app-loader>,
  },
  {
    path: "/campos",
    element: <app-loader></app-loader>,
  },
  {
    path: "/insumos",
    element: <app-loader></app-loader>,
  },
  {
    path: "/magris/*",
    element: <app-loader></app-loader>,
  },
  {
    path: "/campo/*",
    element: <app-loader></app-loader>,
  },

  { path: "/prices/*", element: <app-loader></app-loader> },
  { path: "/equipos/*", element: <app-loader></app-loader> },
  { path: "/analisissuelo/*", element: <app-loader></app-loader> },
  { path: "/ejecucion", element: <app-loader></app-loader> },
  { path: "/personal/*", element: <app-loader></app-loader> },
  { path: "/device/*", element: <app-loader></app-loader> },
  { path: "/invite/*", element: <app-loader></app-loader> },
  { path: "/rights/*", element: <app-loader></app-loader> },
  { path: "/transfer/*", element: <app-loader></app-loader> },
  { path: "/proveedores/*", element: <app-loader></app-loader> },
  { path: "/deposito/*", element: <app-loader></app-loader> },
  { path: "/depositos/*", element: <app-loader></app-loader> },
  { path: "/contratistas/*", element: <app-loader></app-loader> },
  { path: "/indices/*", element: <app-loader></app-loader> },
  { path: "/settings/*", element: <app-loader></app-loader> },
  { path: "/integraciones/*", element: <app-loader></app-loader> },
  { path: "/vehiculos/*", element: <app-loader></app-loader>  },
  
];
