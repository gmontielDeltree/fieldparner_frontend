import React from "react";
import {
  MagrisIntegracionReact,
  MagrisReporte,
} from "../../../owncomponents/magris/magris-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectMap } from "../../redux/map";

export const MagrisIntegration = () => {
  const navigate = useNavigate();
  return (
    <div>
      <MagrisIntegracionReact
        onNavigateTo={(e) => navigate(e.detail)}
        onClose={() => navigate(-1)}
      ></MagrisIntegracionReact>
    </div>
  );
};

export const MagrisReportIntegration = () => {
  const navigate = useNavigate();

  const map = useSelector(selectMap);
  let { id } = useParams();

  return (
    <div>
      {map && <MagrisReporte onClose={(e) => navigate(-1)} map={map} id={id} />}
    </div>
  );
};
