import React, { useState } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  FormControlLabel,
  Card,
  CardContent
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { styled } from "@mui/material/styles";
import { es } from 'date-fns/locale';
import { NumberFieldWithUnits } from "../../components/NumberField";
import { AutocompleteCultivo } from "../../components/AutocompleteCultivo";
import { AutocompleteContratista } from "../../components/AutocompleteContratista";

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: `${theme.spacing(2)} 0`,
  backgroundColor: theme.palette.background.paper,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "bold",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

function PersonalForm({ formData, setFormData }) {
  const [fertilizacionChecked, setFertilizacionChecked] = useState(false);
  const [fitosanitariaChecked, setFitosanitariaChecked] = useState(false);

  const onFieldChange = (fieldName, value) => {
    setFormData(prevData => ({
      ...prevData,
      detalles: {
        ...prevData.detalles,
        [fieldName]: value
      }
    }));
  };

  const handleCheckboxChange = (field) => (event) => {
    if (field === 'fertilizacion') {
      setFertilizacionChecked(event.target.checked);
    } else {
      setFitosanitariaChecked(event.target.checked);
    }
  };

  return (
    <CustomPaper elevation={3}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SectionTitle>Información General</SectionTitle>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="ing-agronomo-label">Ing. Agrónomo</InputLabel>
            <Select
              labelId="ing-agronomo-label"
              id="ing-agronomo"
              value={formData.detalles.ingAgronomo || ""}
              label="Ing. Agrónomo"
              onChange={(e) => onFieldChange("ingAgronomo", e.target.value)}
            >
              <MenuItem value="Ing Agronomo 1">Ing. Agrónomo 1</MenuItem>
              <MenuItem value="Ing Agronomo 2">Ing. Agrónomo 2</MenuItem>
              <MenuItem value="Ing Agronomo 3">Ing. Agrónomo 3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <AutocompleteCultivo 
            value={formData.detalles.cultivo || ""} 
            onChange={(value) => onFieldChange("cultivo", value)}
          />
        </Grid>

        <Grid item xs={12}>
          <SectionTitle>Detalles de la Actividad</SectionTitle>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Tipo de Actividad:
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={fertilizacionChecked}
                    onChange={handleCheckboxChange('fertilizacion')}
                    color="primary"
                  />
                }
                label="Fertilización"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={fitosanitariaChecked}
                    onChange={handleCheckboxChange('fitosanitaria')}
                    color="primary"
                  />
                }
                label="Fitosanitaria"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <AutocompleteContratista
            value={formData.contratista || ""}
            onChange={(value) => onFieldChange("contratista", value)}
          />
        </Grid>

        <Grid item xs={12}>
          <SectionTitle>Programación y Área</SectionTitle>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Ejecución"
              value={formData.detalles.fecha_ejecucion_tentativa ? new Date(formData.detalles.fecha_ejecucion_tentativa) : null}
              onChange={(newValue) => onFieldChange("fecha_ejecucion_tentativa", newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberFieldWithUnits
            label="Hectáreas a tratar"
            unit="ha"
            value={formData.detalles.hectareas || 0}
            onChange={(e) => onFieldChange("hectareas", e.target.value)}
          />
        </Grid>
      </Grid>
    </CustomPaper>
  );
}

export default PersonalForm;