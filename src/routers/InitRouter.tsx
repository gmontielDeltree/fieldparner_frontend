import { useEffect } from "react";
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

  // // Original URL
  // const [from, setFrom] = useState<string>(
  //   "/" + (window.location.pathname + window.location.search).substr(1)
  // );

  const { status, checkAuthToken } = useAuthStore();

  useEffect(() => {
    // anotar la url original
    // console.log("WINDOW LOCATION HREF PRE AUTH", from);
    checkAuthToken();
  }, []);

  if (status === "checking") {
    return <Loading key="loading-auth" loading />;
  }
   {/* <OverviewRoutes /> */}
  return (
    <>
      {status === "not-authenticated" ? <PublicRoutes /> : <OverviewRoutes />}
    </>
  );
};
