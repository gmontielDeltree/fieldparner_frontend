import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography
} from "@mui/material";
import PersonalExecutionForm from "./forms/PlanForms/PersonalExecutionForm";
import SuppliesExecutionForm from "./forms/PlanForms/SuppliesExecutionForm";
import OtherDetailsForm from "./forms/PlanForms/OtherDetailsForm";
import ServicesForm from "./forms/PlanForms/ServicesForm";
import ConditionsForm from "./forms/PlanForms/ConditionsForm";
import ObservationsForm from "./forms/PlanForms/ObservationsForm";
import { getEmptyActivity, getEmptyExecution } from "../../interfaces/activity";
import { format, parse } from "date-fns";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import GrassIcon from "@mui/icons-material/Grass";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import EditIcon from "@mui/icons-material/Edit";
import { keyframes } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import { Ejecucion, Actividad } from "../../interfaces/activity";
import uuid4 from "uuid4";
import { HarvestType, StockMovement, TypeMovement } from "../../types";
import { useAppSelector, useStockMovement, useSupply } from "../../hooks";

const activityTypeTranslations = {
  preparation: "Preparado",
  sowing: "Siembra",
  harvesting: "Cosecha",
  application: "Aplicacion"
};

const activityIcons = {
  sowing: <LocalFloristIcon sx={{ fontSize: 50, color: "green" }} />,
  application: <GrassIcon sx={{ fontSize: 50, color: "green" }} />,
  harvesting: <AgricultureIcon sx={{ fontSize: 50, color: "green" }} />
};

interface ExecuteActivityProps {
  activityType: string;
  lot: any;
  db: any;
  fieldName: string;
  backToActivites: () => void;
  existingActivity: Actividad;
}

const ExecuteActivity: React.FC<ExecuteActivityProps> = ({
  activityType,
  lot,
  db,
  fieldName,
  backToActivites,
  existingActivity
}) => {
  console.log("ACTIVITY TYPE: ", activityType);
  if (!lot) return null;
  const lotName = lot.properties.name;
  const [formData, setFormData] = useState(
    existingActivity || getEmptyExecution()
  );
  const { addNewStockMovement } = useStockMovement();
  const { removeReservedStock, getSupplies } = useSupply();
  const [activeStep, setActiveStep] = useState(0);
  const translatedActivityType = activityTypeTranslations[activityType];
  const [maxStepReached, setMaxStepReached] = useState(0);
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const isEditing =
    existingActivity && Object.keys(existingActivity).length > 0;

  const floating = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

  const titleBg = isEditing
    ? `linear-gradient(60deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`
    : `linear-gradient(45deg, #a0a0a0, #626262)`;
  const steps =
    activityType === "sowing"
      ? [
        "General",
        "Insumos",
        "Otros Datos",
        "Servicios",
        "Condiciones",
        "Observaciones"
      ]
      : ["General", "Insumos", "Servicios", "Condiciones", "Observaciones"];

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      actividad_uuid: existingActivity.uuid,
      ts_generacion: 0,
      tipo: translatedActivityType.toLowerCase(),
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas
      }
    }));
  }, []);

  useEffect(() => {
    if (existingActivity) {
      setFormData(existingActivity);
    } else {
      setFormData(getEmptyActivity());
    }
  }, [existingActivity]);

  useEffect(() => {
    getSupplies();
  }, []);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      uuid: uuid4(),
      actividad_uuid: existingActivity.uuid,
      ts_generacion: 0,
      tipo: translatedActivityType.toLowerCase(),
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas
      }
    }));
  }, [lot, translatedActivityType, existingActivity]);

  const countMissingFields = (formData, step) => {
    let missingFields = 0;
    if (activityType !== "sowing" && step > 1) {
      step = step + 1;
    }
    switch (step) {
      case 0: // PersonalExecutionForm
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
      case 1: // SuppliesExecutionForm (Insumos)
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
        // if (!details.formacion_inoculado) {
        //   missingFields++;
        // }
        // if (!details.marca_inoculado) {
        //   missingFields++;
        // }
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
      case 3: // ServicesForm (Labores)
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
    if (activityType !== "sowing" && step > 1) {
      step = step + 1;
    }
    switch (step) {
      case 0:
        return (
          <PersonalExecutionForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 1:
        return (
          <SuppliesExecutionForm
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
          <ServicesForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
            isExecution={true}
          />
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

  const updateActivityStateToCompleted = (activityId) => {
    return db
      .get(activityId)
      .then((activityDoc) => {
        activityDoc.estado = "completada";
        return db.put(activityDoc);
      })
      .then(() => {
        console.log("Activity state updated to completed successfully");
      })
      .catch((error) => {
        console.error("Error updating activity state to completed:", error);
      });
  };
  const processHarvestStockMovements = async (executionDetails) => {
    for (const dosis of executionDetails.detalles.dosis) {
      const newMovement = {
        movement: "Ingreso por cosecha",
        accountId: user?.accountId,
        supplyId: dosis.insumo._id,
        userId: user?.id,
        depositId: dosis.deposito._id,
        location: "",
        nroLot: "",
        creationDate: new Date().toISOString(),
        dueDate: "",
        typeMovement: TypeMovement.Labores,
        isIncome: true,
        detail: "Ingreso por cosecha",
        operationDate: new Date().toISOString(),
        amount: Number(dosis.rinde_obtenido),
        voucher: "",
        currency: "ARS",
        totalValue: 0,
        hours: "0",
        campaignId: executionDetails.campaña.campaignId
      };

      try {
        await addNewStockMovement(newMovement, dosis.insumo, dosis.deposito);
      } catch (error) {
        console.error(`Error al realizar movimiento de stock para el insumo ${dosis.insumo.name}:`, error);
        throw error;
      }
    }
  };


  const handleSave = async () => {
    let executionDetails = { ...formData };
    executionDetails.detalles.fecha_ejecucion = new Date().toISOString();
    executionDetails.estado = "completada";

    console.log("EXECUTION DETAILS: ", executionDetails);

    // Generate new stock movement (out) for each of the supplies used in the execution
    if (executionDetails.detalles.dosis) {
      for (const dosis of executionDetails.detalles.dosis) {
        console.log("DOSIS: ", dosis);

        const newMovement = {
          movement: "Salida por ejecución",
          accountId: user?.accountId,
          supplyId: dosis.insumo._id,
          userId: user?.id,
          depositId: dosis.deposito._id,
          location: "",
          nroLot: "",
          creationDate: new Date().toISOString(),
          dueDate: "",
          typeMovement: TypeMovement.Labores,
          isIncome: false,
          detail: "Salida por ejecución",
          operationDate: new Date().toISOString(),
          amount: Number(dosis.dosis),
          voucher: "",
          currency: "ARS",
          totalValue: 0,
          hours: "0",
          campaignId: executionDetails.campaña.campaignId
        };

        try {
          console.log("New stock movement (out) for supply:", newMovement);
          await addNewStockMovement(newMovement, dosis.insumo, dosis.deposito);
          await removeReservedStock(dosis.insumo._id, Number(dosis.dosis));
        } catch (error) {
          console.error(`Error al realizar movimiento de stock para el insumo ${dosis.insumo.name}:`, error);
          return;
        }
      }
    }

    if (executionDetails.tipo === HarvestType) {
      try {
        await processHarvestStockMovements(executionDetails);
      } catch (error) {
        console.error("Error procesando movimientos de stock para cosecha:", error);
        return;
      }
    }

    try {
      const formattedDate = format(
        new Date(executionDetails.detalles.fecha_ejecucion_tentativa),
        "yyyy-MM-dd"
      );
      executionDetails._id =
        "ejecucion:" + formattedDate + ":" + executionDetails.uuid;
    } catch (error) {
      console.error("Error generating new ID for execution:", error);
      return;
    }

    db.get(executionDetails._id)
      .then(() => {
        return updateActivityStateToCompleted(executionDetails.actividad_uuid);
      })
      .then((doc) => {
        executionDetails._rev = doc._rev;
        return db.put(executionDetails);
      })
      .catch((error) => {
        if (error.name === "conflict") {
          console.error("Conflict detected, saving execution details:", error);
        } else if (error.name === "not_found") {
          delete executionDetails._rev;
          db.put(executionDetails)
            .then(() => {
              console.log("New document created", "success");
              backToActivites();
            })
            .catch((err) => {
              console.error("Error creating new document:", err);
            });
        } else {
          console.error("Error saving execution details:", error);
        }
      });
  };

  const ActivityIcon = activityIcons["sowing"];

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
            background: titleBg,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "1px 1px 4px rgba(0,0,0,0.15)",
            animation: isEditing
              ? `${floating} 3s ease-in-out infinite`
              : "none"
          }}
        >
          Ejecutar {translatedActivityType}
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
            Ejecutar actividad
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExecuteActivity;
