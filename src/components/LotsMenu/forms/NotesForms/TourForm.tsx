import React, { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Paper,
  Typography,
  Button
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import PointForm from "./PointForm";

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7"
});

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px"
});

const containerVariants = {
  hidden: { opacity: 0, x: "-100vw" },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "tween",
      ease: "anticipate",
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    x: "100vw",
    transition: {
      type: "tween",
      ease: "anticipate",
      duration: 0.5
    }
  }
};

function TourForm({ formData, setFormData }) {
  const [isPointMode, setIsPointMode] = useState(false);
  const [point, setPoint] = useState({ properties: { nombre: "", notas: "" } });

  const onFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handlePointChange = (field, value) => {
    setPoint({ ...point, properties: { ...point.properties, [field]: value } });
  };

  const handleAddPoint = () => {
    setIsPointMode(true);
  };

  const handleSavePoint = () => {
    const newFeatures = [...(formData.features || []), point];
    setFormData({ ...formData, features: newFeatures });
    setIsPointMode(false);
  };

  return (
    <CustomPaper elevation={3}>
      <AnimatePresence mode="wait">
        {isPointMode ? (
          <motion.div
            key="pointForm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <PointForm
              formData={formData}
              setFormData={setFormData}
              setIsPointMode={setIsPointMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="mainForm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Title>Nota</Title>
            <FormControl fullWidth>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Nombre"
                    fullWidth
                    value={formData.nombre || ""}
                    onChange={(e) => onFieldChange("nombre", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Fecha"
                      value={formData.fecha || new Date()}
                      onChange={(newValue) => onFieldChange("fecha", newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Hora"
                      value={formData.fecha || new Date()}
                      onChange={(newValue) => onFieldChange("fecha", newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Próxima Visita"
                      value={formData.proxima_visita || new Date()}
                      onChange={(newValue) =>
                        onFieldChange("proxima_visita", newValue)
                      }
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </FormControl>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleAddPoint}
                style={{ marginTop: "15px" }}
              >
                Nuevo Punto
              </Button>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </CustomPaper>
  );
}

export default TourForm;
