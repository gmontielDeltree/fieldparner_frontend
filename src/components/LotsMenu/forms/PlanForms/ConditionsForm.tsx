import React, { useEffect } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Paper,
  styled,
  Typography,
  InputAdornment
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import AirIcon from "@mui/icons-material/Air";

interface ConditionsFormProps {
  lot: any;
  formData: any;
  setFormData: (formData: any) => void;
}

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

const ConditionsForm: React.FC<ConditionsFormProps> = ({
  lot,
  formData,
  setFormData
}) => {
  const handleInputChange = (event) => {
    const { id, value } = event.target;
    const numericValue = value === "" ? "" : Number(value);
    setFormData({
      ...formData,
      condiciones: {
        ...formData.condiciones,
        [id]: numericValue
      }
    });
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Condiciones</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Temperature Min */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="temperatura_min"
              label="Temperatura Min"
              fullWidth
              value={formData.condiciones.temperatura_min}
              onChange={handleInputChange}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ThermostatIcon /> °C
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {/* Humidity Min */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="humedad_min"
              label="Humedad Min"
              fullWidth
              value={formData.condiciones.humedad_min || ""}
              onChange={handleInputChange}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <OpacityIcon /> %
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {/* Wind Min */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="velocidad_min"
              label="Viento Min"
              fullWidth
              value={formData.condiciones.velocidad_min || ""}
              onChange={handleInputChange}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AirIcon /> km/h
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {/* Temperature Max */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="temperatura_max"
              label="Temperatura Max"
              fullWidth
              value={formData.condiciones.temperatura_max || ""}
              onChange={handleInputChange}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ThermostatIcon /> °C
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {/* Humidity Max */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="humedad_max"
              label="Humedad Max"
              fullWidth
              value={formData.condiciones.humedad_max || ""}
              onChange={handleInputChange}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <OpacityIcon /> %
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {/* Wind Max */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="velocidad_max"
              label="Viento Max"
              fullWidth
              value={formData.condiciones.velocidad_max || ""}
              onChange={handleInputChange}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AirIcon /> km/h
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  );
};

export default ConditionsForm;
