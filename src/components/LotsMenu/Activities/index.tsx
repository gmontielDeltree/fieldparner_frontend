import React, { useRef, useState, useEffect } from "react";
import Activity from "./Activity";
import SowingIcon from "../../../images/icons/sembradora_act.webp";
import HarvestIcon from "../../../images/icons/cosechadora_act.webp";
import NoteIcon from "../../../images/icons/iconodenotas_act.webp";
import SoilAnalysisIcon from "../../../images/icons/suelo_act.webp";
import ApplicationIcon from "../../../images/icons/pulverizadora_act.webp";
import PreparadoIcon from "../../../images/icons/IconodePlanificaciondesuelo.png";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "./Activities.css";
import { styled } from "@mui/material/styles";
import { mapboxStaticImg } from "../../../utils/mapboxStaticImg";
import { googleMapsLinkGoTo } from "../../../utils/googleMapsLink";
import ordenDefinition from "../../../utils/ordenDefinition";
import { dbContext } from "../../../services";

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

export const Activities = ({
  activitiesData,
  setActivitiesData,
  fieldDoc,
  lotDoc,
  handleEditActivity
}) => {
  const [userMessage, setUserMessage] = useState("");
  const db = dbContext.fields;
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event: any, reason: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDeleteActivity = (activityId) => {
    db.get(activityId)
      .then((doc) => {
        return db.remove(doc);
      })
      .then(() => {
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

  const updateActivityStateToCompleted = (activityId) => {
    db.get(activityId)
      .then((doc) => {
        doc.estado = "completada";
        return db.put(doc);
      })
      .then(() => {
        console.log("Activity state updated to completed successfully.");
        setOpenSnackbar(true);
        setSnackbarSeverity("success");
      })
      .catch((error) => {
        console.error("Error updating activity state:", error);
        setUserMessage("Error al actualizar el estado de la actividad.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });
  };

  const handleConfirmExecution = (activity) => {
    let executionDetails = {
      detalles: {
        fecha_ejecucion: new Date().toISOString()
      },
      actividad_uuid: activity.uuid,
      estado: "ejecutada"
    };

    executionDetails._id =
      "ejecucion:" +
      executionDetails.detalles.fecha_ejecucion +
      ":" +
      executionDetails.actividad_uuid;

    db.get(executionDetails._id)
      .then((doc) => {
        executionDetails._rev = doc._rev;
        return db.put(executionDetails);
      })
      .catch((error) => {
        if (error.name === "not_found") {
          delete executionDetails._rev;
          db.put(executionDetails)
            .then(() => {
              setUserMessage("Actividad confirmada exitosamente.");
              setOpenSnackbar(true);
              setSnackbarSeverity("success");
            })
            .then(() => {
              console.log("updating activity state to completed", activity._id);
              updateActivityStateToCompleted(activity._id);
            })
            .catch((err) => {
              console.error("Error creating new document:", err);
              setUserMessage("Error al confirmar la actividad.");
              setSnackbarSeverity("error");
            });
        } else {
          console.error("Error saving execution details:", error);
          setUserMessage("Error al confirmar la actividad.");
          setSnackbarSeverity("error");
        }
      });
  };

  const handleDownloadPDF = (activity) => {
    // TODO: Cambiar esto a un POST a server de informes

    let campos_url = mapboxStaticImg(fieldDoc, lotDoc);

    let google_map_link = googleMapsLinkGoTo(lotDoc);

    let dd = ordenDefinition(
      activity,
      fieldDoc.nombre,
      lotDoc.properties.nombre,
      campos_url,
      google_map_link
    );

    const pdf_fonts = {
      Roboto: {
        normal:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
        bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
        italics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
        bolditalics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf"
      }
    };

    import("pdfmake/build/pdfmake.min.js")
      .then(({ default: pdfMake }) => {
        pdfMake.fonts = pdf_fonts;
        pdfMake.createPdf(dd).open();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "preparado":
        return PreparadoIcon;
      case "siembra":
        return SowingIcon;
      case "cosecha":
        return HarvestIcon;
      case "nota":
        return NoteIcon;
      case "aplicacion":
        return ApplicationIcon;
      case "analisis_suelo":
        return SoilAnalysisIcon;
      default:
        return null;
    }
  };

  const getComplementaryColor = (tipo) => {
    switch (tipo) {
      case "preparado":
        return "#67FFC7";
      case "siembra":
        return "#FF7E67";
      case "cosecha":
        return "#FFD567";
      case "nota":
        return "#FFAB67";
      case "aplicacion":
        return "#67D3FF";
      case "analisis_suelo":
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

        return (
          <div key={index}>
            <Activity
              activity={activityData}
              fieldDoc={fieldDoc}
              lotDoc={lotDoc}
              complementaryColor={complementaryColor}
              icon={Icon}
              handleDeleteActivity={handleDeleteActivity}
              handleEditActivity={handleEditActivity}
              handleDownloadPDF={handleDownloadPDF}
              handleConfirmExecution={handleConfirmExecution}
            />
          </div>
        );
      })}
    </div>
  );
};
