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
import uuid4 from "uuid4";

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

function PersonalForm({ lot, formData, setFormData }) {
  const { businesses, getBusinesses } = useBusiness();

  useEffect(() => {
    getBusinesses();
    console.log("businesses", businesses);
  }, []);

  const onFieldChange = (fieldName, value) => {
    if (fieldName === "contratista") {
      const selectedBusiness = businesses.find(
        (business) =>
          business.nombreCompleto === value || business.razonSocial === value
      );
      console.log("selectedBusiness", selectedBusiness);
      setFormData({
        ...formData,
        contratista: {
          labores: [],
          uuid: uuid4(),
          nombre: selectedBusiness?.razonSocial,
          cuit: selectedBusiness?.cuit,
          datos_generales: {
            email: selectedBusiness?.email,
            direccion: selectedBusiness?.domicilio,
            telefono: selectedBusiness?.contactoPrincipal
          },
          _id: selectedBusiness?._id,
          _rev: selectedBusiness?._rev
        }
      });
    } else if (fieldName === "fecha") {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          fecha_ejecucion_tentativa: value
        }
      });
    } else {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          hectareas: value
        }
      });
    }
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Personal</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel id="contratista-label">Contratista</InputLabel>
            <Select
              labelId="contratista-label"
              id="contratista"
              value={formData.contratista.nombre || ""}
              label="Contratista"
              fullWidth
              onChange={(e) => onFieldChange("contratista", e.target.value)}
            >
              {businesses.map((business) => (
                <MenuItem
                  key={business._id}
                  value={business.razonSocial || business.nombreCompleto}
                >
                  {business.razonSocial || business.nombreCompleto}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha"
                value={
                  formData.detalles.fecha_ejecucion_tentativa || new Date()
                }
                onChange={(newValue) => onFieldChange("fecha", newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              id="hectareas"
              label="Hectáreas"
              fullWidth
              type="number"
              value={formData.detalles.hectareas || 0}
              onChange={(e) => onFieldChange("hectareas", e.target.value)}
            />
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default PersonalForm;
