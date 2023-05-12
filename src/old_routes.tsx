import React from "react";
import "../owncomponents/loader";

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
];
