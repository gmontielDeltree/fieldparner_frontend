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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      <Title>{t("laboratory")}</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>

          {/* Fecha Input */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t("date")}
                value={formData.fecha || null}
                onChange={(newValue) => onFieldChange("fecha", newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ width: '100%' }} />}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Laboratorio Input */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="laboratorio-select-label">{t("laboratory")}</InputLabel>
              <Select
                labelId="laboratorio-select-label"
                id="laboratorio-select"
                value={formData.laboratorio?._id || formData.laboratorio || ""}
                label={t("laboratory")}
                onChange={(e) => {
                  const selectedBusiness = businesses.find(b => b._id === e.target.value);
                  onFieldChange("laboratorio", selectedBusiness || e.target.value);
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar laboratorio</em>
                </MenuItem>
                {businesses.map((business) => (
                  <MenuItem key={business._id} value={business._id}>
                    {business.razonSocial || business.nombreComercial || business.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Referencia Doc Laboratorio Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="refDocLab"
              label={t("laboratoryDocReference")}
              fullWidth
              value={formData.refDocLab || ""}
              onChange={(e) => onFieldChange("refDocLab", e.target.value)}
            />
          </Grid>

          {/* Responsable Técnico Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="responsableTecnico"
              label={t("technicalResponsible")}
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
              label={t("registration")}
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