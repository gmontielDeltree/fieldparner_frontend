import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../owncomponents/loader";
import ReactComponentTEST from "./ReactComponentTEST";
import("../owncomponents/routes");
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "app-loader": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "lista-de-campos": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const router = createBrowserRouter([
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
  { path: "/react-test", element: <ReactComponentTEST></ReactComponentTEST> },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
