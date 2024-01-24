import { useEffect, useState } from "react";
import { useAuthStore } from "../hooks";
import { PublicRoutes } from "./PublicRoutes";
import { OverviewRoutes } from "./OverviewRoutes";
import { Loading } from "../components";
import { useLocation, useNavigate } from "react-router-dom";

export const InitRouter = () => {
  let navigate = useNavigate();
  let location = useLocation();
  const [from, setFrom] = useState()

  const { status, checkAuthToken } = useAuthStore();

  useEffect(() => {
    checkAuthToken();
  }, []);

  
  // useEffect(() => {
  //   if(status === "authenticated"){
  //     // Despues de autenticar hay que volver a -2 
  //     // para recuperar la url antes del login. Ej.:
  //     // 1 - /init/overview/deposits
  //     // 2 - /login (por checkAuthToken)
  //     // 3 - /init/overview/fields (por el render de mas abajo)
  //     // 4 - navigate(-2) vuelve a /init/overview/deposits 
  //     navigate(-2);
  //   }
  // }, [status]);


  if (status === "checking") {
    return <Loading key="loading-auth" loading />;
  }

  return (
    // <>
      //   {status === "not-authenticated" ? <PublicRoutes /> : <OverviewRoutes />}
    // </>
<OverviewRoutes />
  );
};
