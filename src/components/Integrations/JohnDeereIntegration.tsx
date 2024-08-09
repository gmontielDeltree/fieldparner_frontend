import React, { useEffect, useState } from "react";
import { JohnDeereIntegracionReact } from "../../../owncomponents/john-deere/john-deere-integracion-react";
import { useSelector } from "react-redux";
import { selectMap } from "../../redux/map";
import { useLocation, useNavigate } from "react-router-dom";
import { dbContext } from "../../services";
import { Map } from "mapbox-gl";

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const JohnDeereIntegration: React.FC = () => {
  // const query = window.location.search;
  //     if (
  //       query.includes("token_type=") &&
  //       query.includes("expires_in=") &&
  //       query.includes("access_token=")
  //     ) {
  //       // Save token?
  //       let qp = new URLSearchParams(query);
  //       let ijd = { access_token: "", expires_in: 0 };
  //       ijd.access_token = qp.get("access_token") ?? "";
  //       ijd.expires_in = +(qp.get("expires_in") ?? 0);
  //       gbl_state.jd_integracion = ijd;
  //       console.log("State", gbl_state.jd_integracion, qp);
  //       window.history.replaceState(
  //         {},
  //         document.title,
  //         window.location.pathname
  //       );
  //     }

  let query = useQuery();
  const map : Map = useSelector(selectMap);

  const [token, setToken] = useState({});
  const navigate = useNavigate();


  useEffect(() => {
    if(token?.access_token){
      localStorage.setItem("jdtoken", JSON.stringify(token));
    }
  }, [token]);

  useEffect(() => {
    const item = localStorage.getItem("jdtoken")
    
    if (item) {
      // console.log("TOKEN form LS", item)
      setToken(JSON.parse(item));
    }
  }, []);

  useEffect(() => {
    if (
      query.get("token_type") &&
      query.get("expires_in") &&
      query.get("access_token")
    ) {
      // Save token?
      let qp = new URLSearchParams(query);
      let ijd = { access_token: "", expires_in: 0 };
      ijd.access_token = query.get("access_token") ?? "";
      ijd.expires_in = +(query.get("expires_in") ?? 0);

      setToken(ijd);

      // gbl_state.jd_integracion = ijd;
      console.log("State", ijd, qp);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  
  return (
    <div
      id="device-sidebar-container"
      style={{ position: "relative", width: "25%" }}
    >

      <JohnDeereIntegracionReact
        map={map}
        token={token.access_token}
        onImportarCampo={(e : CustomEvent)=> dbContext.Fields.put(e.detail)}
        onClose={()=>{
          navigate("/init/overview/fields")
          map.resize()
        }}
      ></JohnDeereIntegracionReact>
    </div>
  );
};
