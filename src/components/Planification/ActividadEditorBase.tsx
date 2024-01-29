import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PlanPersonalForm from "./forms/PlanPersonalForm";
import {
  IActividadPlanificacion,
  IInsumosPlanificacion,
} from "../../interfaces/planification";
import PlanTasksForm from "./forms/PlanTasksForm";
import { PlanSuppliesTableForm } from "./forms/PlanSuppliesTableForm";
import PlanSuppliesForm from "./forms/PlanSuppliesForm";
import { usePlanActividad } from "../../hooks/usePlanifications";
import { ILaboresPlanificacion } from "../../interfaces/planification";

const steps = ["Fecha", "Insumos", "Labores"];

export const ActividadEditorBase = ({
  tipo,
  actividadDoc,
  onSave,
  onClose,
}: {
  actividadDoc: IActividadPlanificacion;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [rows, setRows] = useState<IInsumosPlanificacion[]>([]);
  const [rowsLab, setRowsLab] = useState<ILaboresPlanificacion[]>([]);

  const [actividad, setActividad] =
    useState<IActividadPlanificacion>(actividadDoc);

  const { saveActividad } = usePlanActividad();

  useEffect(() => {
    setActividad(actividadDoc);
    // Reset rows
    setRows([]);
    setRowsLab([]);
    setActiveStep(0);
  }, [actividadDoc]);

  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<{
    [k: number]: boolean;
  }>({});

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper alternativeLabel nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={handleStep(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        {
          <React.Fragment>
            {activeStep === 0 && (
              <PlanPersonalForm
                formData={actividad}
                setFormData={setActividad}
              />
            )}
            {activeStep === 1 && (
              <PlanSuppliesForm
                formData={actividad}
                setFormData={setActividad}
                {...{ rows, setRows }}
              />
            )}
            {activeStep === 2 && (
              <PlanTasksForm
                formData={actividad}
                setFormData={setActividad}
                rows={rowsLab}
                setRows={setRowsLab}
              />
            )}
            <Typography sx={{ mt: 2, mb: 1, py: 1 }}></Typography>

            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleNext} sx={{ mr: 1 }}>
                Next
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={onClose}
                sx={{ mr: 1 }}
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  //
                  let newIds = rows.map((f) => f.id);
                  let newLineasDocs: IInsumosPlanificacion[] = rows.map((f) => {
                    return {
                      _id: f.id,
                      insumoId: f.insumo._id,
                      dosis: f.dosis,
                      totalCantidad: f.totalCantidad,
                      hectareas: f.hectareas,
                      precioUnitario: f.precioUnitario,
                      totalCosto: f.totalCosto,
                    };
                  });

                  console.log("new insumos lists id", newIds, newLineasDocs);
                  setActividad({ ...actividad, insumosLineasIds: newIds });

                  let newLaboresIds = rowsLab.map((f) => f.id);
                  let newLabLinDocs: ILaboresPlanificacion[] = rowsLab.map(
                    (f) => {
                      return {
                        _id: f.id,
                        laborId: f.labor.id,
                        costoPorHectarea: f.costoPorHectarea,
                        hectareas: f.hectareas,
                        totalCosto: f.totalCosto,
                      };
                    }
                  );

                  console.log("update actividad");
                  saveActividad(
                    {
                      ...actividad,
                      insumosLineasIds: newIds,
                      laboresLineasIds: newLaboresIds,
                    },
                    newLineasDocs,
                    newLabLinDocs
                  ).then(onSave);

                }}
                sx={{ mr: 1 }}
              >
                Guardar
              </Button>
            </Box>
          </React.Fragment>
        }
      </div>
    </Box>
  );
};
