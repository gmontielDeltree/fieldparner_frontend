import React from "react";
import { TextField, FormControl, Grid, Paper, Typography } from "@mui/material";
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

function VariablesForm({ formData, setFormData }) {
  const onFieldChange = (fieldName, value) => {
    const updatedSoilVariables = {
      ...formData.soilVariables,
      [fieldName]: parseInt(value, 10) || 0
    };
    setFormData({ ...formData, soilVariables: updatedSoilVariables });
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Variables</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {[
            "carbono_organico",
            "materia_organica",
            "fosforo_bray",
            "fosforo_ii",
            "fosforo_iii",
            "calcio",
            "potasio",
            "sodio",
            "azufre",
            "zinc_zn",
            "nitratos_no3",
            "sulfatos_s_so4",
            "nitratos_n_n03",
            "nitrogeno_total",
            "humedad",
            "conductividad_electrica"
          ].map((field) => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              <TextField
                id={field}
                label={field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                fullWidth
                type="number"
                value={formData.soilVariables?.[field] || 0}
                onChange={(e) => onFieldChange(field, e.target.value)}
                inputProps={{ step: "1", min: "0" }}
              />
            </Grid>
          ))}
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default VariablesForm;
