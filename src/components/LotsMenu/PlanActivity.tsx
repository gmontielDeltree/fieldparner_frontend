import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography
} from "@mui/material";
import PersonalForm from "./forms/PlanForms/PersonalForm";
import SuppliesForm from "./forms/PlanForms/SuppliesForm";
import OtherDetailsForm from "./forms/PlanForms/OtherDetailsForm";
import TasksForm from "./forms/PlanForms/TasksForm";
import ConditionsForm from "./forms/PlanForms/ConditionsForm";
import ObservationsForm from "./forms/PlanForms/ObservationsForm";
import { getEmptyActivity } from "../../interfaces/activity";
import { format, parse } from "date-fns";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import GrassIcon from "@mui/icons-material/Grass"; // Replace with actual import
import AgricultureIcon from "@mui/icons-material/Agriculture"; // Replace with actual import

import Badge from "@mui/material/Badge";

const activityTypeTranslations = {
  sowing: "Siembra",
  harvesting: "Cosecha",
  application: "Aplicacion"
};

const activityIcons = {
  sowing: <LocalFloristIcon sx={{ fontSize: 50, color: "green" }} />,
  application: <GrassIcon sx={{ fontSize: 50, color: "green" }} />,
  harvesting: <AgricultureIcon sx={{ fontSize: 50, color: "green" }} />
};

interface PlanActivityProps {
  activityType: string;
  lot: any;
  db: any;
  backToActivites: () => void;
}

const PlanActivity: React.FC<PlanActivityProps> = ({
  activityType,
  lot,
  db,
  backToActivites
}) => {
  if (!lot) return null;
  console.log("Lot: ", lot);
  const [formData, setFormData] = useState(getEmptyActivity());
  const [activeStep, setActiveStep] = useState(0);
  const translatedActivityType =
    activityTypeTranslations[activityType] || activityType;
  const [maxStepReached, setMaxStepReached] = useState(0);
  const steps = [
    "Personal",
    "Insumos",
    "Otros Datos",
    "Labores",
    "Condiciones",
    "Observaciones"
  ];

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      lote_uuid: lot.id,
      ts_generacion: 0,
      tipo: translatedActivityType.toLowerCase(),
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas
      }
    }));
  }, []);

  const countMissingFields = (formData, step) => {
    let missingFields = 0;

    switch (step) {
      case 0: // PersonalForm
        if (!formData.detalles.fecha_ejecucion_tentativa) {
          missingFields++;
        }
        if (!formData.contratista) {
          missingFields++;
        }
        if (!formData.detalles || !formData.detalles.hectareas) {
          missingFields++;
        }
        break;
      case 1: // SuppliesForm (Insumos)
        if (
          !formData.detalles ||
          !formData.detalles.dosis ||
          formData.detalles.dosis.length === 0
        ) {
          missingFields++;
        }
        break;
      case 2: // OtherDetailsForm
        const details = formData.detalles || {};
        if (!details.densidad_objetivo) {
          missingFields++;
        }
        if (!details.formacion_inoculado) {
          missingFields++;
        }
        if (!details.marca_inoculado) {
          missingFields++;
        }
        if (!details.peso_1000) {
          missingFields++;
        }
        if (!details.profundidad) {
          missingFields++;
        }
        if (!details.tipo_siembra) {
          missingFields++;
        }
        if (!details.distancia) {
          missingFields++;
        }
        break;
      case 3: // TasksForm (Labores)
        if (
          !formData.detalles ||
          !formData.detalles.dosis ||
          formData.detalles.costo_labor.length === 0
        ) {
          missingFields++;
        }
        break;
      case 4: // ConditionsForm
        const condiciones = formData.condiciones || {};
        if (condiciones.humedad_max === undefined) {
          missingFields++;
        }
        if (condiciones.humedad_min === undefined) {
          missingFields++;
        }
        if (condiciones.temperatura_max === undefined) {
          missingFields++;
        }
        if (condiciones.temperatura_min === undefined) {
          missingFields++;
        }
        if (condiciones.velocidad_max === undefined) {
          missingFields++;
        }
        if (condiciones.velocidad_min === undefined) {
          missingFields++;
        }
        break;
      default:
        break;
    }

    return missingFields;
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PersonalForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 1:
        return (
          <SuppliesForm
            lot={lot}
            db={db}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <OtherDetailsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <TasksForm lot={lot} formData={formData} setFormData={setFormData} />
        );
      case 4:
        return (
          <ConditionsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 5:
        return (
          <ObservationsForm
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
    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep + 1;
      setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, nextStep));
      return nextStep;
    });
  };

  const handleBack = () => {
    if (activeStep === 0) {
      backToActivites();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
    setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, step));
  };
  const handleSave = () => {
    let actividad = formData;
    try {
      const fechaEjecucion = actividad.detalles.fecha_ejecucion_tentativa;
      console.log("FECHA EJECUCION: ", fechaEjecucion);

      // Parse the ISO string into a Date object
      const parsedDate = new Date(fechaEjecucion);

      // Format the Date object into 'yyyy-MM-dd' format
      const formattedDate = format(parsedDate, "yyyy-MM-dd");
      actividad._id = "actividad:" + formattedDate + ":" + actividad.uuid;
    } catch (error) {
      console.error("Error in handleSave:", error);
    }

    console.log("ACTIVIDAD ID: ", actividad._id);
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

  const ActivityIcon = activityIcons[activityType] || LocalFloristIcon; // Default icon if not found

  return (
    <div>
      <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
        {ActivityIcon}{" "}
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
          Planificar {translatedActivityType}
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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  position: "relative"
                }
              }}
            >
              {label}
              {index <= maxStepReached && (
                <Badge
                  badgeContent={countMissingFields(formData, index)}
                  color="error"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: -9,
                    transform: "scale(1) translate(50%, -50%)"
                  }}
                />
              )}
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
        {activeStep === steps.length - 1 && (
          <Button
            color="success"
            onClick={() => {
              handleSave();
            }}
          >
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanActivity;
