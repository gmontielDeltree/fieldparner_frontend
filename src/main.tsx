import ReactDOM from "react-dom/client";
//import "../owncomponents/loader";
// import { AppRouter } from "./routers/AppRouter";
import store from "./redux/store";
import "./i18n"; //TODO: chequear middleware 
import { Provider } from "react-redux";
import FieldPartnerApp from "./FieldPartnerApp";
import { loadCampaignFromLS, saveCampaignToLS } from "./helpers/persistence";
import { setSelectedCampaign } from "./redux/campaign";




/* Supongo que esto hay que wrappearlo con algún componente de Auth */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <PouchDBComponent>
  // </PouchDBComponent>
  <Provider store={store}>
    {/* <React.StrictMode> */}
    {/* <AppRouter /> */}
    <FieldPartnerApp />
    {/* </React.StrictMode> */}
  </Provider>
);
