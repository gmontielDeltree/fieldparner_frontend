import React, { useState } from "react";
import { Button, Step, StepLabel, Stepper } from "@mui/material";
import PersonalForm from "./forms/PersonalForm";
import SuppliesForm from "./forms/SuppliesForm";
import OtherDetailsForm from "./forms/OtherDetailsForm";
import TasksForm from "./forms/TasksForm";
import ConditionsForm from "./forms/ConditionsForm";
import ObservationsForm from "./forms/ObservationsForm";

interface LotDetailsModalProps {
  lot: any;
}

const LotDetailsModal: React.FC<LotDetailsModalProps> = ({ lot }) => {
  if (!lot) return null;

  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Personal",
    "Insumos",
    "Otros Datos",
    "Laborales",
    "Condiciones",
    "Observaciones"
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <PersonalForm lot={lot} />;
      case 1:
        return <SuppliesForm lot={lot} />;
      case 2:
        return <OtherDetailsForm lot={lot} />;
      case 3:
        return <TasksForm lot={lot} />;
      case 4:
        return <ConditionsForm lot={lot} />;
      case 5:
        return <ObservationsForm lot={lot} />;
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

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  return (
    <div>
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
        {activeStep === steps.length - 1 && (
          <Button
            color="success"
            onClick={() => {
              /* Save logic here */
            }}
          >
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
};

export default LotDetailsModal;
