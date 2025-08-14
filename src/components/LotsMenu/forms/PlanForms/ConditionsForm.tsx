import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  // Utility function to validate numeric input
  const handleNumericInput = (value, fieldId) => {
    if (value === '') return '';
    
    // Temperature fields can be negative, others cannot
    const allowNegative = fieldId.includes('temperatura');
    const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    
    return pattern.test(value) ? value : '';
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    
    // Validate input before processing
    const validatedValue = handleNumericInput(value, id);
    if (validatedValue === '' && value !== '') {
      // Invalid input, prevent the change
      return;
    }
    
    const numericValue = validatedValue === "" ? "" : Number(validatedValue);
    setFormData({
      ...formData,
      condiciones: {
        ...(formData.condiciones || {}),
        [id]: numericValue
      }
    });
  };

  // Prevent invalid characters on keypress
  const handleKeyPress = (event, fieldId) => {
    const { key } = event;
    const allowNegative = fieldId.includes('temperatura');
    
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (key.length > 1) return;
    
    // Allow numbers and decimal point
    if (/[0-9.]/.test(key)) return;
    
    // Allow minus sign only for temperature fields and only at the beginning
    if (key === '-' && allowNegative && event.target.selectionStart === 0) return;
    
    // Prevent all other characters
    event.preventDefault();
  };

  return (
    <CustomPaper elevation={3}>
      <Title>{t("conditionsTitle")}</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Temperature Min */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="temperatura_min"
              label={t("minTemperature")}
              fullWidth
              value={formData.condiciones?.temperatura_min || ""}
              onChange={handleInputChange}
              onKeyPress={(e) => handleKeyPress(e, "temperatura_min")}
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
              label={t("minHumidity")}
              fullWidth
              value={formData.condiciones?.humedad_min || ""}
              onChange={handleInputChange}
              onKeyPress={(e) => handleKeyPress(e, "humedad_min")}
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
              label={t("minWind")}
              fullWidth
              value={formData.condiciones?.velocidad_min || ""}
              onChange={handleInputChange}
              onKeyPress={(e) => handleKeyPress(e, "velocidad_min")}
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
              label={t("maxTemperature")}
              fullWidth
              value={formData.condiciones?.temperatura_max || ""}
              onChange={handleInputChange}
              onKeyPress={(e) => handleKeyPress(e, "temperatura_max")}
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
              label={t("maxHumidity")}
              fullWidth
              value={formData.condiciones?.humedad_max || ""}
              onChange={handleInputChange}
              onKeyPress={(e) => handleKeyPress(e, "humedad_max")}
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
              label={t("maxWind")}
              fullWidth
              value={formData.condiciones?.velocidad_max || ""}
              onChange={handleInputChange}
              onKeyPress={(e) => handleKeyPress(e, "velocidad_max")}
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
