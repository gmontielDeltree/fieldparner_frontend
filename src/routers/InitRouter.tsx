import { useEffect, useState } from "react";
import { useAuthStore } from "../hooks";
import { PublicRoutes } from "./PublicRoutes";
import { OverviewRoutes } from "./OverviewRoutes";
import { Loading } from "../components";
// import { useLocation, useNavigate } from "react-router-dom";

export const InitRouter = () => {
  // const navigate = useNavigate();
  // const { pathname, search } = useLocation();
  // const lastPath = pathname + search;
  // console.log('lastPath', lastPath);
  // localStorage.setItem('lastPath', lastPath);

  // Original URL
  const [from, setFrom] = useState<string>(
    "/" + (window.location.pathname + window.location.search).substr(1)
  );

  const { status, checkAuthToken } = useAuthStore();

  useEffect(() => {
    // anotar la url original
    console.log("WINDOW LOCATION HREF PRE AUTH", from);
    checkAuthToken();
  }, []);

  // useEffect(() => {
  //   if(status === "authenticated"){
  //     // Despues de autenticar hay que volver atras
  //     // para recuperar la url antes del login. Ej.:
  //     // 1 - /init/overview/deposits (request original)
  //     // 2 - /login (por checkAuthToken)
  //     // 3 - /init/overview/fields (por el render de mas abajo)
  //     // 4 - navigate(from) vuelve a /init/overview/deposits

  //     console.log("WINDOW LOCATION HREF POST AUTH", window.location.href)
  //     navigate(from);
  //   }
  // }, [status]);

  if (status === "checking") {
    return <Loading key="loading-auth" loading />;
  }
  //  {/* <OverviewRoutes /> */}
  return (
    <>
    
      {status !== "not-authenticated" ? <PublicRoutes /> : <OverviewRoutes />}
    </>
  );
};
