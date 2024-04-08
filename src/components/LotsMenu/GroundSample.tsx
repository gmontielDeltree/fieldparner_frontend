import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography
} from "@mui/material";
import { getEmptyActivity } from "../../interfaces/activity";
import { format, parse } from "date-fns";
import GrassIcon from "@mui/icons-material/Science";
import LaboratoryForm from "./forms/GroundSampleForms/LaboratoryForm";
import SoilCharacteristicsForm from "./forms/GroundSampleForms/SoilCharacteristicsForm";
import VariablesForm from "./forms/GroundSampleForms/VariablesForm";
import AttachmentsForm from "./forms/GroundSampleForms/AttachmentsForm";

import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

interface GroundSampleProps {
  lot: any;
  db: any;
  fieldName: string;
  backToActivites: () => void;
}

const GroundSample: React.FC<GroundSampleProps> = ({
  lot,
  db,
  fieldName,
  backToActivites
}) => {
  if (!lot) return null;
  const [formData, setFormData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Laboratorio",
    "Características del Suelo",
    "Variables",
    "Adjuntos"
  ];

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      lote_uuid: lot.id,
      ts_generacion: 0,
      tipo: "analisis_suelo",
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas
      }
    }));
  }, []);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <LaboratoryForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 1:
        return (
          <SoilCharacteristicsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <VariablesForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <AttachmentsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return <div>Unknown Step</div>;
    }
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep > 0 ? prevActiveStep - 1 : 0
    );
  };

  const handleStep = (step: any) => () => {
    setActiveStep(step);
  };

  const handleSave = () => {
    let actividad = formData;
    try {
      const fechaEjecucion = actividad.fecha;

      const parsedDate = new Date(fechaEjecucion);

      const formattedDate = format(parsedDate, "yyyy-MM-dd");
      actividad._id = "actividad:" + formattedDate + ":" + actividad.uuid;
    } catch (error) {
      console.error("Error in handleSave:", error);
    }

    db.get(actividad._id)
      .then((doc) => {
        actividad._rev = doc._rev;
        return db.put(actividad);
      })
      .then(() => {
        console.log("Actividad guardada", "success");
        backToActivites();
      })
      .catch((error) => {
        if (error.name === "not_found") {
          console.log("Actividad not found. Creating a new one.");
          delete actividad._rev;
          db.put(actividad)
            .then(() => {
              console.log("New actividad created", "success");
              backToActivites();
            })
            .catch((err) =>
              console.error("Error creating new actividad:", err)
            );
        } else if (error.name === "conflict") {
          console.error("Conflict detected. Trying to save again.");
          handleSave();
        } else {
          console.error("Error saving actividad:", error);
        }
      });
  };

  useEffect(() => {
    console.log("FORM DATA: ", formData);
  });

  return (
    <div>
      <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
        <GrassIcon sx={{ fontSize: 50, color: "green" }} />
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: "bold",
            mt: 2,
            background: "linear-gradient(45deg, #a0a0a0, #626262)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "1px 1px 4px rgba(0,0,0,0.15)",
            animation: "shine 5s linear infinite",
            "@keyframes shine": {
              "0%": { opacity: 0.8 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.8 }
            }
          }}
        >
          Muestra de suelo
        </Typography>
      </Box>
      <Stepper
        activeStep={activeStep}
        sx={{ pt: 3, pb: 5, backgroundColor: "#f5f5f5", borderRadius: "4px" }}
      >
        {steps.map((label, index) => (
          <Step key={label} onClick={handleStep(index)}>
            <StepLabel
              sx={{
                color: "primary.main",
                "& .MuiStepLabel-label": {
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer"
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <div style={{ marginTop: "10px" }}>{getStepContent(activeStep)}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem"
        }}
      >
        <Button color="secondary" onClick={handleBack}>
          {activeStep === 0 ? "Cancelar" : "Volver"}
        </Button>
        {activeStep < steps.length - 1 && (
          <Button color="primary" onClick={handleNext}>
            Siguiente
          </Button>
        )}

        <Button
          color="success"
          onClick={() => {
            handleSave();
          }}
        >
          Guardar
        </Button>
      </div>
    </div>
  );
};

export default GroundSample;
