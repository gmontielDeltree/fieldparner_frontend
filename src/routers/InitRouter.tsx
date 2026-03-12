import { useEffect } from "react";
import { useAuthStore } from "../hooks";
import { PublicRoutes } from "./PublicRoutes";
import { OverviewRoutes } from "./OverviewRoutes";
import { Loading } from "../components";
// import { useLocation, useNavigate } from "react-router-dom";

export const InitRouter = () => {

  const { status, checkAuthToken } = useAuthStore();

  useEffect(() => {
    // anotar la url original
    // console.log("WINDOW LOCATION HREF PRE AUTH", from);
    checkAuthToken();
  }, []);

  if (status === "checking") {
    return <Loading key="loading-auth" loading />;
  }
  {/* <OverviewRoutes /> */ }
  return (
    <>
      {status === "not-authenticated" ? <PublicRoutes /> : <OverviewRoutes />}
    </>
  );
};
