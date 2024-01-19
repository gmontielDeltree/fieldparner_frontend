import { useEffect } from "react";
import { useAuthStore } from "../hooks";
import { PublicRoutes } from "./PublicRoutes";
import { OverviewRoutes } from "./OverviewRoutes";
import { Loading } from "../components";
import { useLocation, useNavigate } from "react-router-dom";

export const InitRouter = () => {
  let navigate = useNavigate();
  let location = useLocation();

  const { status, checkAuthToken } = useAuthStore();

  useEffect(() => {
    checkAuthToken();
  }, []);

  useEffect(() => {
    if(status === "authenticated"){
      navigate(-1);
    }
  }, [status]);


  if (status === "checking") {
    return <Loading key="loading-auth" loading />;
  }

  return (
    <>
      {status === "not-authenticated" ? <PublicRoutes /> : <OverviewRoutes />}
    </>
  );
};
