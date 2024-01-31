import React, { useEffect } from "react";
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
} from "@mui/material";
import { useBusiness } from "../../../hooks";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { styled } from "@mui/material/styles";
import uuid4 from "uuid4";
import { formatISO, parseISO } from "date-fns";
import { TTipoActividadPlanificada } from "../../../interfaces/planification";

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

function PlanPersonalForm({ formData, setFormData, tipo }) {
  const { businesses, getBusinesses } = useBusiness();

  useEffect(() => {
    getBusinesses();
    console.log("businesses", businesses);
  }, []);

  const onFieldChange = (fieldName, value) => {
    if (fieldName === "contratista") {
      const selectedBusiness = businesses.find(
        (business) => business._id === value
      );
      console.log("selectedBusiness", selectedBusiness);

      setFormData({
        ...formData,
        contratistaId: selectedBusiness?._id,
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
      setFormData({
        ...formData,
        rindeEstimado: value,
      });
    }else if (fieldName === "precioEstimadoCosecha") {
      setFormData({
        ...formData,
        precioEstimadoCosecha: value,
      });
    }
  };

  return (
    <CustomPaper elevation={3}>
      {/* <Title>Datos Generales</Title> */}
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha"
                value={parseISO(formData.fecha) || new Date()}
                onChange={(newValue) => onFieldChange("fecha", newValue)}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="contratista-label">Contratista</InputLabel>
              <Select
                labelId="contratista-label"
                id="contratista"
                value={formData.contratistaId || ""}
                label="Contratista"
                fullWidth
                onChange={(e) => onFieldChange("contratista", e.target.value)}
              >
                {businesses.map((business) => (
                  <MenuItem key={business._id} value={business._id}>
                    {business.razonSocial || business.nombreCompleto}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <TextField
              id="hectareas"
              label="Hectáreas"
              type="number"
              inputProps={{min: 0, style: { textAlign: 'right' }}}
              InputProps={{
                endAdornment: <InputAdornment position="end">has</InputAdornment>,
              }}
              value={formData.area || 0}
              onChange={(e) => onFieldChange("area", +e.target.value)}
            />
          </Grid>

          {(formData.tipo === TTipoActividadPlanificada.COSECHA) && (
            <Grid item container xs={8} spacing={1}>
              <Grid item xs={4}>
              <TextField
                id="rendimiento"
                label="Rinde estimado"
                inputProps={{min: 0, style: { textAlign: 'right' }}}
                InputProps={{
                 
                  endAdornment: <InputAdornment position="end">tn/has</InputAdornment>,
                }}
                value={formData.rindeEstimado || 0}
                onChange={(e) => onFieldChange("rindeEstimado", +e.target.value)}
              />
              </Grid>

                <Grid item xs={4}>
            <TextField
                label="Rinde Total"
                disabled
                inputProps={{min: 0, style: { textAlign: 'right' }}}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">tn</InputAdornment>,
                }}
                value={formData.rindeEstimado * formData.area || 0}
                onChange={(e) => onFieldChange("rindeEstimado", +e.target.value)}
              />
              </Grid>
              <Grid item xs={4}>
            <TextField
                label="Precio Estimado"
                disabled
                inputProps={{min: 0, style: { textAlign: 'right' }}}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">USD/tn</InputAdornment>,
                }}
                value={formData.precioEstimadoCosecha || 0}
                onChange={(e) => onFieldChange("precioEstimadoCosecha", +e.target.value)}
              />
              </Grid>
            </Grid>
          )}
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default PlanPersonalForm;
