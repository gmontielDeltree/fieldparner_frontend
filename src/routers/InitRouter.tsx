import { useEffect, useState } from "react";
import { useAuthStore } from "../hooks";
import { PublicRoutes } from "./PublicRoutes";
import { OverviewRoutes } from "./OverviewRoutes";
import { Loading } from "../components";
import { useLocation, useNavigate } from "react-router-dom";

export const InitRouter = () => {
  let navigate = useNavigate();
  let location = useLocation();

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

  useEffect(() => {
    if (status === "authenticated") {
      

      console.log("WINDOW LOCATION HREF POST AUTH", window.location.href);
      if (from !== "/init/auth/login") {
        navigate(from);
      }
    }
  }, [status]);

  if (status === "checking") {
    return <Loading key="loading-auth" loading />;
  }
//  {/* <OverviewRoutes /> */}
  return (
    <>
      {/* {status === "not-authenticated" ? <PublicRoutes /> : <OverviewRoutes />} */}
      
      <OverviewRoutes />
     +
    </>
  );
};
