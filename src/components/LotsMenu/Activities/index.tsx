import React, { useRef, useState, useEffect } from "react";
import Activity from "./Activity";
import SowingIcon from "../../../images/icons/sembradora_act.webp";
import HarvestIcon from "../../../images/icons/cosechadora_act.webp";
import NoteIcon from "../../../images/icons/iconodenotas_act.webp";
import SoilAnalysisIcon from "../../../images/icons/suelo_act.webp";
import ApplicationIcon from "../../../images/icons/pulverizadora_act.webp";
import "./Activities.css";

export const Activities = ({ activitiesData }) => {
  console.log("ACTIVITIES DATA: ", activitiesData);
  const [activityHeights, setActivityHeights] = useState([]);
  const activityRefs = useRef([]);

  const [activity] = useState(activitiesData[0]);

  useEffect(() => {
    setActivityHeights(
      activityRefs.current.map((ref) => ref?.offsetHeight || 0)
    );
  }, []);

  const getIcon = (tipo) => {
    switch (tipo) {
      case "siembra":
        return SowingIcon;
      case "cosecha":
        return HarvestIcon;
      case "nota":
        return NoteIcon;
      case "aplicacion":
        return ApplicationIcon;
      case "analisis de suelo":
        return SoilAnalysisIcon;
      default:
        return null;
    }
  };

  const getColor = (tipo) => {
    switch (tipo) {
      case "siembra":
        return "#76B947";
      case "cosecha":
        return "#F2C94C";
      case "nota":
        return "#F2994A";
      case "aplicacion":
        return "#56CCF2";
      case "analisis de suelo":
        return "#9B51E0";
      default:
        return "#333333";
    }
  };

  const getComplementaryColor = (tipo) => {
    switch (tipo) {
      case "siembra":
        return "#FF7E67";
      case "cosecha":
        return "#FFD567";
      case "nota":
        return "#FFAB67";
      case "aplicacion":
        return "#67D3FF";
      case "analisis de suelo":
        return "#C767FF";
      default:
        return "#AAAAAA";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        position: "relative"
      }}
    >
      {activitiesData.map((activityData, index) => {
        const Icon = getIcon(activityData.actividad.tipo);
        const complementaryColor = getComplementaryColor(
          activityData.actividad.tipo
        );
        const isFirst = index === 0;

        return (
          <div key={index} ref={(el) => (activityRefs.current[index] = el)}>
            <Activity
              activity={activityData}
              complementaryColor={complementaryColor}
              icon={Icon}
              isFirst={isFirst}
            />
          </div>
        );
      })}
    </div>
  );
};
