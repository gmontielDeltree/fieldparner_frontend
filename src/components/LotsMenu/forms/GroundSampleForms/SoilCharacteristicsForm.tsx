import React, { useEffect } from "react";
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

function SoilCharacteristicsForm({ formData, setFormData }) {
  const onFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Características del Suelo</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Caracterización 1 */}
          <Grid item xs={12} md={6}>
            <TextField
              id="caracterizacion1"
              label="Caracterización 1"
              fullWidth
              value={formData.caracterizacion1 || ""}
              onChange={(e) =>
                onFieldChange("caracterizacion1", e.target.value)
              }
            />
          </Grid>

          {/* Caracterización 2 */}
          <Grid item xs={12} md={6}>
            <TextField
              id="caracterizacion2"
              label="Caracterización 2"
              fullWidth
              value={formData.caracterizacion2 || ""}
              onChange={(e) =>
                onFieldChange("caracterizacion2", e.target.value)
              }
            />
          </Grid>

          {/* Profundidad */}
          <Grid item xs={12} md={6}>
            <TextField
              id="profundidad"
              label="Profundidad (cm)"
              fullWidth
              type="number"
              value={formData.profundidad || ""}
              onChange={(e) =>
                onFieldChange("profundidad", parseInt(e.target.value, 10))
              }
              inputProps={{ step: "1", min: "0" }}
            />
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default SoilCharacteristicsForm;
