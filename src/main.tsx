import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../owncomponents/loader";
import ReactComponentTEST from "./components/ReactComponentTEST";
import { old_routes } from "./old_routes";


const router = createBrowserRouter([
  ...old_routes,
  { path: "/react-test", element: <ReactComponentTEST></ReactComponentTEST> },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
