import React, { useRef, useState, useEffect } from "react";
import Activity from "./Activity";
import SowingIcon from "../../../images/icons/sembradora_act.webp";
import HarvestIcon from "../../../images/icons/cosechadora_act.webp";
import NoteIcon from "../../../images/icons/iconodenotas_act.webp";
import SoilAnalysisIcon from "../../../images/icons/suelo_act.webp";
import ApplicationIcon from "../../../images/icons/pulverizadora_act.webp";
import PouchDB from "pouchdb";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "./Activities.css";
import { styled } from "@mui/material/styles";
import PlanActivity from "../PlanActivity";

const Alert = styled(MuiAlert)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[5],
  "& .MuiAlert-icon": {
    fontSize: "1.5em"
  },
  "& .MuiAlert-message": {
    fontSize: "1em",
    fontWeight: "bold"
  },
  "& .MuiAlert-action": {
    alignItems: "center"
  }
}));

export const Activities = ({ activitiesData, setActivitiesData }) => {
  console.log("ACTIVITIES DATA: ", activitiesData);
  const [userMessage, setUserMessage] = useState("");
  const db = new PouchDB("campos_randyv7");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event: any, reason: string) => {
    console.log("Snackbar closing, reason:", reason);
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDeleteActivity = (activityId) => {
    console.log("DELETE ACTIVITY: ", activityId);

    db.get(activityId)
      .then((doc) => {
        return db.remove(doc);
      })
      .then(() => {
        console.log("Actividad eliminada", "success");
        setActivitiesData(
          activitiesData.filter(
            (activity) => activity.actividad._id !== activityId
          )
        );
        setUserMessage("Actividad eliminada exitosamente.");
        setOpenSnackbar(true);
        setSnackbarSeverity("success");
      })
      .catch((error) => {
        console.error("Error deleting actividad:", error);
        setUserMessage("Error al eliminar la actividad.");
        setSnackbarSeverity("error");
      });
  };

  const handleEditActivity = (activityId) => {
    console.log("EDIT ACTIVITY: ", activityId);
  };

  const getIcon = (tipo: string) => {
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
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {userMessage}
        </Alert>
      </Snackbar>
      {activitiesData.map((activityData, index) => {
        const Icon = getIcon(activityData.actividad.tipo);
        const complementaryColor = getComplementaryColor(
          activityData.actividad.tipo
        );
        const isFirst = index === 0;

        return (
          <div key={index}>
            <Activity
              activity={activityData}
              complementaryColor={complementaryColor}
              icon={Icon}
              isFirst={isFirst}
              handleDeleteActivity={handleDeleteActivity}
              handleEditActivity={handleEditActivity}
            />
          </div>
        );
      })}
    </div>
  );
};
