import React, { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Typography,
  InputAdornment,
  Autocomplete,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from "@mui/material";
import { useBusiness } from "../../../hooks";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { styled } from "@mui/material/styles";
import uuid4 from "uuid4";
import { formatISO, parseISO } from "date-fns";
import { TTipoActividadPlanificada } from "../../../interfaces/planification";
import { es } from "date-fns/locale";
import { AutocompleteContratista } from "../../LotsMenu/components/AutocompleteContratista";

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7",
});

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
});

interface PlanPersonalFormProps {
  formData: any
  setFormData: (data: any) => void
  tipo: string
}

function PlanPersonalForm({ formData, setFormData, tipo }: PlanPersonalFormProps) {
  const { businesses, getBusinesses } = useBusiness();

  const [interPrecio, setInterPrecio] = useState("0");
  const [interRinde, setInterRinde] = useState("0");

  useEffect(() => {
    getBusinesses();
    console.log("businesses", businesses);
  }, []);

  const onFieldChange = (fieldName, value) => {
    if (fieldName === "contratista") {
      // const selectedBusiness = businesses.find(
      //   (business) => business._id === value
      // );
      // console.log("selectedBusiness", selectedBusiness);

      setFormData({
        ...formData,
        contratista: value,
      });
    } else if (fieldName === "fecha") {
      setFormData({
        ...formData,
        fecha: formatISO(value),
      });
    } else if (fieldName === "area") {
      setFormData({
        ...formData,
        area: value,
      });
    } else if (fieldName === "rindeEstimado") {
      if (/^\d*\.?\d*$/.test(value)) {
        setInterRinde(value);
        setFormData({
          ...formData,
          rindeEstimado: +value,
        });
      }
    } else if (fieldName === "precioEstimadoCosecha") {
      if (/^\d*\.?\d*$/.test(value)) {
        setInterPrecio(value);
        setFormData({
          ...formData,
          precioEstimadoCosecha: +value,
        });
      }
    }
  };

  return (
    <CustomPaper elevation={3}>
      {/* <Title>Datos Generales</Title> */}
      <FormControl fullWidth>
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
              <DatePicker
                label="Fecha"
                size="small"
                value={parseISO(formData.fecha) || new Date()}
                onChange={(newValue) => onFieldChange("fecha", newValue)}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <AutocompleteContratista
              value={formData.contratista || ""}
              onChange={(e) => onFieldChange("contratista", e)}
            ></AutocompleteContratista>
          </Grid>

          <Grid item xs={4}>
            <TextField
              id="hectareas"
              label="Hectáreas"
              type="number"
              size="small"
              inputProps={{ min: 0, style: { textAlign: "right" } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">has</InputAdornment>
                ),
              }}
              value={formData.area || 0}
              onChange={(e) => onFieldChange("area", +e.target.value)}
            />
          </Grid>

          {/* Campos específicos para Cosecha */}
          {formData.tipo === TTipoActividadPlanificada.COSECHA && (
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Información de Cosecha
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="rendimiento"
                  label="Rinde Histórico Estimado"
                  size="small"
                  inputProps={{ min: 0, style: { textAlign: "right" } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">tn/ha</InputAdornment>
                    ),
                  }}
                  value={interRinde || 0}
                  onChange={(e) =>
                    onFieldChange("rindeEstimado", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  label="Rinde Histórico Total"
                  disabled
                  size="small"
                  inputProps={{ min: 0, style: { textAlign: "right" } }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">tn</InputAdornment>
                    ),
                  }}
                  value={(formData.rindeEstimado * formData.area || 0).toFixed(2)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Precio Estimado"
                  size="small"
                  inputProps={{ min: 0, style: { textAlign: "right" } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">USD/tn</InputAdornment>
                    ),
                  }}
                  value={interPrecio || 0}
                  onChange={(e) => {
                    onFieldChange("precioEstimadoCosecha", e.target.value);
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Campos específicos para Aplicación */}
          {formData.tipo === TTipoActividadPlanificada.APLICACION && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Detalles de la Actividad:
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.fertilizacion || false}
                        onChange={(e) => onFieldChange('fertilizacion', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Fertilización"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.fitosanitaria || false}
                        onChange={(e) => onFieldChange('fitosanitaria', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Fitosanitaria"
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Campo Zafra para Preparado y Siembra */}
          {(formData.tipo === TTipoActividadPlanificada.PREPARADO ||
            formData.tipo === TTipoActividadPlanificada.SIEMBRA) && (
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Zafra"
                  value={formData.zafra || ''}
                  onChange={(e) => onFieldChange('zafra', e.target.value)}
                  placeholder="Ingrese la zafra"
                  helperText="Información de la zafra correspondiente a la planificación anual"
                />
              </Grid>
            )}
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default PlanPersonalForm;
