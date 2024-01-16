import React, { useEffect, useState } from "react";
import { Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { DeviceSidebar } from "../../owncomponents/sensores/react-port/sensores-offcanvas-component";
import { selectMap } from "../redux/map/mapSlice";
import { Splash } from "../components/Satellite/Splash";
import { DailyTelemetryCard } from "../interfaces/sensores";
import { Devices } from "../../owncomponents/sensores/sensores";
import { useSelector } from "react-redux";

export const DevicePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [deviceCard, setDeviceCard] = useState<DailyTelemetryCard>();
  const map = useSelector(selectMap);
  const navigate = useNavigate();

  let { deviceId } = useParams();
  let { date } = useParams();

  useEffect(() => {
    if (deviceId) {
      let d = new Devices();
      d.get_device_daily_card(deviceId, date).then((d) => {
        setDeviceCard(d);

        console.log("Device Card Loaded", d);
        setLoading(false);
      });
    }
  }, [deviceId]);

  return (
    <>
      <div id="device-sidebar-container" style={{position: "relative", width:"25%"}}>
        {loading ? (
          <Splash />
        ) : (
          <DeviceSidebar
            onClose={()=>navigate("/init/overview/fields")}
            map={map}
            uuid={deviceId}
            _selected_device_card={deviceCard}
          />
        )}
      </div>
    </>
  );
};
