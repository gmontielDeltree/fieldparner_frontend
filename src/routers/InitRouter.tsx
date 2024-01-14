import { useEffect } from "react";
import { useAuthStore } from "../hooks";
import { PublicRoutes } from "./PublicRoutes";
import { OverviewRoutes } from "./OverviewRoutes";
import { Loading } from "../components";

export const InitRouter = () => {
  const { status, checkAuthToken } = useAuthStore();

  useEffect(() => {
    checkAuthToken();
  }, []);

  if (status === "checking") {
    return <Loading key="loading-auth" loading />;
  }

  return (
    <>
      {status !== "not-authenticated" ? <PublicRoutes /> : <OverviewRoutes />}
    </>
  );
};
