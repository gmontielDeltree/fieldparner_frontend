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
import { TimePicker } from "@mui/x-date-pickers";

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

function PersonalExecutionForm({ lot, formData, setFormData }) {
  const { businesses, getBusinesses } = useBusiness();

  useEffect(() => {
    getBusinesses();
  }, []);

  const onFieldChange = (fieldName, value) => {
    if (fieldName === "contratista") {
      const selectedBusiness = businesses.find(
        (business) =>
          business.nombreCompleto === value || business.razonSocial === value
      );
      const nombre =
        selectedBusiness?.razonSocial || selectedBusiness?.nombreCompleto;
      setFormData({
        ...formData,
        contratista: {
          labores: [],
          uuid: uuid4(),
          nombre: nombre,
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
    } else if (fieldName === "fecha_ejecucion") {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          fecha_ejecucion: value
        }
      });
    } else if (fieldName === "fecha_hora_inicio") {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          fecha_hora_inicio: value
        }
      });
    } else if (fieldName === "fecha_hora_fin") {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          fecha_hora_fin: value
        }
      });
    } else if (fieldName === "hectareas") {
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
      <Title>General</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12}>
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
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha de Ejecución"
                value={formData.detalles.fecha_ejecucion || new Date()}
                onChange={(newValue) =>
                  onFieldChange("fecha_ejecucion", newValue)
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Hora de Inicio"
                value={formData.detalles.fecha_hora_inicio || new Date()}
                onChange={(newValue) =>
                  onFieldChange("fecha_hora_inicio", newValue)
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Hora de Finalización"
                value={formData.detalles.fecha_hora_fin || new Date()}
                onChange={(newValue) =>
                  onFieldChange("fecha_hora_fin", newValue)
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default PersonalExecutionForm;
