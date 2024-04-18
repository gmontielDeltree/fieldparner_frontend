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
import { uuidv7 } from "uuidv7";
import { useSupply } from "../../hooks";

const steps = ["Fecha", "Insumos", "Servicios"];

const tasksList = [
  { name: "Siembra", id: "1" },
  { name: "Cosecha", id: "3" },
  { name: "Aplicación Aerea", id: "4" },
  { name: "Aplicación Terrestre", id: "5" },
  { name: "Cincel", id: "6" },
  { name: "Disco", id: "7" },
  { name: "Fertilización al Voleo", id: "8" },
  { name: "Riego", id: "9" },
];

export const ActividadEditorBase = ({
  tipo,
  actividadDoc,
  onSave,
  onClose,
  editing,
}: {
  actividadDoc: IActividadPlanificacion;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [rows, setRows] = useState<IInsumosPlanificacion[]>([]);
  const [rowsLab, setRowsLab] = useState<ILaboresPlanificacion[]>([]);

  const { supplies, getSupplies } = useSupply();

  useEffect(() => {
    getSupplies();
  }, []);

  const [actividad, setActividad] =
    useState<IActividadPlanificacion>(actividadDoc);

  const { saveActividad, getLineasServicios, getLineasInsumos } =
    usePlanActividad();

  useEffect(() => {
    setActividad(actividadDoc);
    // Reset rows
    setRows([]);

    if (!editing) {
      let default_activity = {
        id: "lineaLabor:" + uuidv7(),
        labor: { name: "Siembra", id: "1" },
        costoPorHectarea: 0,
        hectareas: 0,
        totalCosto: 0,
        comentario: "string",
      };

      if (actividadDoc.tipo === "siembra") {
        default_activity.labor = { name: "Siembra", id: "1" };
      } else if (actividadDoc.tipo === "cosecha") {
        default_activity.labor = { name: "Cosecha", id: "3" };
      } else if (actividadDoc.tipo === "aplicacion") {
        default_activity.labor = { name: "Aplicación Aerea", id: "4" };
      }

      setRowsLab([default_activity]);
    } else {
      if (supplies) {
        // Nuevo
        getLineasServicios(actividadDoc.laboresLineasIds).then((lineas) => {
          let rows = lineas.map((linea) => {
            return {
              ...linea,
              id: linea._id,
              labor: tasksList.find((f) => f.id === linea.laborId),
            };
          });
          setRowsLab(rows);
        });

        getLineasInsumos(actividadDoc.insumosLineasIds).then((lineas) => {
          let rows = lineas.map((linea) => {
            return {
              ...linea,
              id: linea._id,
              insumo: supplies.find((f) => f._id === linea.insumoId),
            };
          });
          setRows(rows);
        });
      }
    }

    setActiveStep(0);
  }, [actividadDoc, supplies]);

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

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                pt: 2,
                justifyContent: "flex-end",
              }}
            >
              {/* <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Atras
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleNext} sx={{ mr: 1 }}>
                Siguiente
              </Button> */}

              {/* <Button
                variant="contained"
                color="error"
                onClick={onClose}
                sx={{ mr: 1 }}
              >
                Cancelar
              </Button> */}

              <Button
                variant="contained"
                onClick={() => {
                  //
                  let newIds = rows.map((f) => f.id);
                  let newLineasDocs: IInsumosPlanificacion[] = rows.map((f) => {
                    let a= {
                      _id: f.id,
                      insumoId: f.insumo._id,
                      dosis: f.dosis,
                      totalCantidad: f.totalCantidad,
                      hectareas: f.hectareas,
                      precioUnitario: f.precioUnitario,
                      totalCosto: f.totalCosto,
                    };
                    if(f._rev){
                      a._rev = f._rev
                    }
                    return a
                  });

                  console.log("new insumos lists id", newIds, newLineasDocs);
                  setActividad({ ...actividad, insumosLineasIds: newIds });

                  let newLaboresIds = rowsLab.map((f) => f.id);
                  let newLabLinDocs: ILaboresPlanificacion[] = rowsLab.map(
                    (f) => {


                      let a = {
                        _id: f.id,
                        laborId: f.labor.id,
                        costoPorHectarea: f.costoPorHectarea,
                        hectareas: f.hectareas,
                        totalCosto: f.totalCosto,
                      };

                      if(f._rev){
                        a._rev = f._rev
                      }
                      return a
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
