import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Progress,
  Alert,
  Container,
  Row,
  Col
} from "reactstrap";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  MapIcon,
  MapPin,
  Beaker
} from "lucide-react";
import GrassIcon from "@mui/icons-material/Science";
import LaboratoryForm from "./forms/GroundSampleForms/LaboratoryForm";
import SoilCharacteristicsForm from "./forms/GroundSampleForms/SoilCharacteristicsForm";
import VariablesForm from "./forms/GroundSampleForms/VariablesForm";
import AttachmentsForm from "./forms/GroundSampleForms/AttachmentsForm";
import ValidationAlert from "./ValidationAlert";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

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
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showValidationNotification, setShowValidationNotification] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);

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
    const newActiveStep = activeStep + 1;
    setActiveStep(newActiveStep);
    if (newActiveStep > maxStepReached) {
      setMaxStepReached(newActiveStep);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep > 0 ? prevActiveStep - 1 : 0
    );
  };

  const handleStep = (step: number) => {
    setActiveStep(step);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleStepClick = (index) => {
    if (index <= maxStepReached) {
      const currentStepValidation = getStepValidationStatus(activeStep);

      if (!currentStepValidation.isValid) {
        const missingFields = getMissingFieldsMessages(activeStep);
        setMissingFieldsList(missingFields);
        setShowValidationNotification(true);
        return;
      }

      handleStep(index);
    }
  };

  const getMissingFieldsMessages = (step) => {
    const fields = [];

    const currentStepName = steps[step];

    switch (currentStepName) {
      case "Laboratorio":
        if (!formData.fecha) fields.push("Fecha de muestra");
        if (!formData.laboratorio) fields.push("Laboratorio");
        break;

      case "Características del Suelo":
        const characteristics = formData.characteristics || {};
        if (!characteristics.profundidad) fields.push("Profundidad");
        break;

      case "Variables":
        const soilVariables = formData.soilVariables || {};
        const hasSomeValue = Object.values(soilVariables).some(val => val > 0);

        if (!hasSomeValue) {
          fields.push("Al menos una variable medida");
        }
        break;

      case "Adjuntos":
        // No validations needed for attachments as they are optional
        break;
    }

    return fields;
  };

  const countMissingFields = (formData, step) => {
    let missingFields = 0;
    const currentStepName = steps[step];

    switch (currentStepName) {
      case "Laboratorio":
        if (!formData.fecha) missingFields++;
        if (!formData.laboratorio) missingFields++;
        break;

      case "Características del Suelo":
        const characteristics = formData.characteristics || {};
        if (!characteristics.profundidad) missingFields++;
        break;

      case "Variables":
        const soilVariables = formData.soilVariables || {};
        const hasSomeValue = Object.values(soilVariables).some(val => val > 0);

        if (!hasSomeValue) {
          missingFields++;
        }
        break;

      case "Adjuntos":
        // No required fields in Attachments typically
        break;

      default:
        break;
    }

    return missingFields;
  };

  const getStepValidationStatus = (stepIndex) => {
    const missingFields = countMissingFields(formData, stepIndex);
    return {
      isValid: missingFields === 0,
      missingCount: missingFields,
    };
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex === activeStep) return "current";
    if (stepIndex < activeStep) {
      const { isValid } = getStepValidationStatus(stepIndex);
      return isValid ? "complete" : "invalid";
    }
    if (stepIndex <= maxStepReached) return "available";
    return "upcoming";
  };

  const getActivityColor = () => {
    return "#10b981"; // Green color for soil sample
  };

  const getProgressColor = () => {
    return "success"; // Bootstrap success color
  };

  const getStepStyle = (status) => {
    switch (status) {
      case "complete":
        return {
          background: getActivityColor(),
          color: "white",
          border: "none",
        };
      case "current":
        return {
          background: "white",
          color: getActivityColor(),
          border: `2px solid ${getActivityColor()}`,
        };
      case "invalid":
        return {
          background: "#ef4444",
          color: "white",
          border: "none",
        };
      case "upcoming":
        return {
          background: "#f3f4f6",
          color: "#6b7280",
          border: "none",
        };
      default:
        return {
          background: "#e5e7eb",
          color: "#6b7280",
          border: "none",
        };
    }
  };

  const handleSave = () => {
    for (let step = 0; step < steps.length; step++) {
      const missingFields = countMissingFields(formData, step);
      if (missingFields > 0) {
        setSnackbarMessage(
          `Por favor completa todos los campos requeridos en el paso: ${steps[step]}`
        );
        setOpenSnackbar(true);
        setActiveStep(step);
        return;
      }
    }

    // Crear estructura compatible con ActivityContent
    let actividad = {
      ...formData,
      tipo: "analisis_suelo",
      lote_uuid: lot.id,
      ts_generacion: Date.now(),
      uuid: formData.id || uuidv4(), // Asegurar que haya un UUID
      actividad: {  // Añadir estructura anidada que ActivityContent espera
        tipo: "analisis_suelo",
        uuid: formData.id || uuidv4(),
        detalles: {
          hectareas: lot.properties.hectareas,
          fecha_ejecucion_tentativa: formData.fecha ? new Date(formData.fecha).toISOString() : new Date().toISOString()
        }
      }
    };

    try {
      const fechaEjecucion = formData.fecha || new Date();
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

  return (
    <Container className="py-6">
      <Card className="shadow-lg">
        {/* Header */}
        <CardHeader
          style={{
            background: getActivityColor(),
            borderTopLeftRadius: "0.5rem",
            borderTopRightRadius: "0.5rem",
            padding: "2rem",
          }}
        >
          <Row className="align-items-center">
            <Col>
              <h1
                className="text-white mb-4"
                style={{ fontSize: "2rem", fontWeight: "bold" }}
              >
                Muestra de suelo
              </h1>

              <div className="d-flex gap-4">
                <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                  <MapIcon className="text-white" size={20} />
                  <div>
                    <div
                      className="text-white-50 mb-0"
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Campo
                    </div>
                    <div className="text-white fw-semibold">{fieldName}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                  <MapPin className="text-white" size={20} />
                  <div>
                    <div
                      className="text-white-50 mb-0"
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Lote
                    </div>
                    <div className="text-white fw-semibold">
                      {lot.properties.nombre}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div
                className="rounded-circle p-3"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
                  backdropFilter: "blur(2px)"
                }}
              >
                <GrassIcon sx={{ fontSize: 50, color: "white" }} />
              </div>
            </Col>
          </Row>
        </CardHeader>

        {/* Stepper */}
        <div className="px-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const { isValid, missingCount } = getStepValidationStatus(index);
              const tooltipText =
                !isValid && index < activeStep
                  ? `Faltan ${missingCount} campos requeridos en ${step}`
                  : "";

              return (
                <div
                  key={step}
                  className="text-center position-relative"
                  style={{ flex: 1 }}
                >
                  <div
                    onClick={() => handleStepClick(index)}
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      cursor: index <= maxStepReached ? "pointer" : "default",
                      transition: "all 0.2s",
                      ...getStepStyle(status),
                    }}
                    title={tooltipText}
                  >
                    {status === "complete" ? (
                      <Check size={20} />
                    ) : status === "invalid" ? (
                      <AlertCircle size={20} />
                    ) : (
                      <span style={{ fontWeight: "600" }}>{index + 1}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <small
                      className={
                        status === "invalid" ? "text-danger" : "text-muted"
                      }
                      style={{
                        fontWeight: status === "current" ? "600" : "400",
                      }}
                    >
                      {step}
                    </small>
                  </div>

                  {index < steps.length - 1 && (
                    <Progress
                      value={index < activeStep ? 100 : 0}
                      color={
                        status === "invalid" ? "danger" : getProgressColor()
                      }
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "50%",
                        width: "100%",
                        height: "2px",
                        zIndex: -1,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <CardBody className="p-4">
          {getStepContent(activeStep)}
        </CardBody>

        {/* Actions */}
        <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
          <Button
            color="light"
            onClick={backToActivites}
            className="d-flex align-items-center gap-2"
          >
            <ChevronLeft size={16} />
            Volver
          </Button>

          <div className="d-flex gap-2">
            {activeStep > 0 && (
              <Button
                color="light"
                onClick={handleBack}
                className="d-flex align-items-center gap-2"
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button color={getProgressColor()} onClick={handleSave}>
                Guardar
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => {
                  const currentStepValidation = getStepValidationStatus(
                    activeStep
                  );
                  if (!currentStepValidation.isValid) {
                    const missingFields = getMissingFieldsMessages(activeStep);
                    setMissingFieldsList(missingFields);
                    setShowValidationNotification(true);
                    return;
                  }
                  handleNext();
                }}
                className="d-flex align-items-center gap-2"
              >
                Siguiente
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Alert */}
      {openSnackbar && (
        <Alert
          color="warning"
          className="position-fixed bottom-0 end-0 m-4 d-flex align-items-center justify-content-between"
          style={{
            maxWidth: "400px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            animation: "slideUp 0.3s ease-out",
            zIndex: 1050,
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <span>{snackbarMessage}</span>
          </div>
          <Button close onClick={handleCloseSnackbar} />
        </Alert>
      )}

      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}
      </style>

      {showValidationNotification && (
        <ValidationAlert
          isOpen={showValidationNotification}
          onClose={() => setShowValidationNotification(false)}
          currentStep={steps[activeStep]}
          requiredFields={missingFieldsList}
        />
      )}
    </Container>
  );
};

export default GroundSample;