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

  const onFieldChange = (fieldName: any, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
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
              id="contratista."
              value={formData.contratista || ""}
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
                value={formData.fecha || new Date()}
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
