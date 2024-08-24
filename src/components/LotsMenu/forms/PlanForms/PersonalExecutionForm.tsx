import React, { useEffect } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  InputLabel
} from "@mui/material";
import { useBusiness } from "../../../../hooks";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { styled } from "@mui/material/styles";
import { es } from "date-fns/locale";
import { NumberFieldWithUnits } from "../../components/NumberField";
import { AutocompleteContratista } from "../../components/AutocompleteContratista";
import { AutocompleteDeposito } from "../../components/AutocompleteDeposito";

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
    setFormData((prevFormData) => ({
      ...prevFormData,
      detalles: {
        ...prevFormData.detalles,
        [fieldName]: value
      }
    }));
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  return (
    <CustomPaper elevation={3}>
      <Title>General</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="ing-agronomo-label">Ing Agronomo</InputLabel>
              <Select
                labelId="ing-agronomo-label"
                id="ing-agronomo"
                value={formData.detalles.ingAgronomo || ""}
                label="Ing Agronomo"
                onChange={(e) => onFieldChange("ingAgronomo", e.target.value)}
              >
                <MenuItem value="Ing Agronomo 1">Ing Agronomo 1</MenuItem>
                <MenuItem value="Ing Agronomo 2">Ing Agronomo 2</MenuItem>
                <MenuItem value="Ing Agronomo 3">Ing Agronomo 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <AutocompleteContratista
              value={formData.contratista}
              onChange={(e) => onFieldChange("contratista", e)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              label="Hectáreas"
              fullWidth
              unit="ha"
              value={formData.detalles.hectareas || 0}
              onChange={(e) => onFieldChange("hectareas", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <AutocompleteDeposito
              value={formData.deposito}
              onChange={(e) => onFieldChange("deposito", e)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
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
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
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
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
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

          <Grid item xs={12}>
            <NumberFieldWithUnits
              size="small"
              fullWidth
              label="Rinde Obtenido (ton/ha)"
              value={+formData.detalles.rinde_obtenido || 0}
              onChange={(e) => onFieldChange("rinde_obtenido", e.target.value)}
              unit="ton/ha"
            />
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default PersonalExecutionForm;
