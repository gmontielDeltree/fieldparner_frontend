import React from "react";
import ReactDOM from "react-dom/client";
import "../owncomponents/loader";
import { AppRouter } from "./routers/AppRouter";
import store from './redux/store';
import { Provider } from 'react-redux';
import PouchDBComponent from "./components/PouchDB";

/* Supongo que esto hay que wrappearlo con algún componente de Auth */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <PouchDBComponent>
    <Provider store={store}>
      <React.StrictMode>
        <AppRouter />
      </React.StrictMode>
    </Provider>
  </PouchDBComponent>
);
