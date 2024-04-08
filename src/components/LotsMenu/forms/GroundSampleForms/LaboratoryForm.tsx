import React, { useEffect } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Typography
} from "@mui/material";
import { useBusiness } from "../../../../hooks";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { styled } from "@mui/material/styles";
import { v4 as uuidv4 } from "uuid";

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

function LaboratoryForm({ lot, formData, setFormData }) {
  const { businesses, getBusinesses } = useBusiness();

  useEffect(() => {
    getBusinesses();
    if (!formData.id) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        id: uuidv4()
      }));
    }
  }, [getBusinesses, formData.id, setFormData]);

  const onFieldChange = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value
    }));
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Laboratorio</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* ID Input - Now unmodifiable */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="id"
              label="ID"
              fullWidth
              value={formData.id || ""}
              InputProps={{
                readOnly: true
              }}
            />
          </Grid>

          {/* Fecha Input */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha"
                value={formData.fecha || new Date()}
                onChange={(newValue) => onFieldChange("fecha", newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          {/* Laboratorio Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="laboratorio"
              label="Laboratorio"
              fullWidth
              value={formData.laboratorio || ""}
              onChange={(e) => onFieldChange("laboratorio", e.target.value)}
            />
          </Grid>

          {/* Referencia Doc Laboratorio Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="refDocLab"
              label="Referencia Doc Laboratorio"
              fullWidth
              value={formData.refDocLab || ""}
              onChange={(e) => onFieldChange("refDocLab", e.target.value)}
            />
          </Grid>

          {/* Responsable Técnico Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="responsableTecnico"
              label="Responsable Técnico"
              fullWidth
              value={formData.responsableTecnico || ""}
              onChange={(e) =>
                onFieldChange("responsableTecnico", e.target.value)
              }
            />
          </Grid>

          {/* Matrícula Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="matricula"
              label="Matrícula"
              fullWidth
              value={formData.matricula || ""}
              onChange={(e) => onFieldChange("matricula", e.target.value)}
            />
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default LaboratoryForm;
