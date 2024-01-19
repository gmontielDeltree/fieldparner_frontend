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

  useEffect(() => {
    if(status === "authenticated"){
      navigate(-2);
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
