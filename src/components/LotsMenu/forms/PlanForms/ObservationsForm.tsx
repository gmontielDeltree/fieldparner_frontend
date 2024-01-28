import React, { useState } from "react";
import { TextField, FormControl, Grid, Paper, Typography } from "@mui/material";

interface ObservationsFormProps {
  lot: any;
  formData: any;
  setFormData: (formData: any) => void;
}

const ObservationsForm: React.FC<ObservationsFormProps> = ({
  lot,
  formData,
  setFormData
}) => {
  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      comentario: event.target.value
    });
  };

  return (
    <Paper
      style={{ padding: "20px", margin: "20px 0", backgroundColor: "#f7f7f7" }}
      elevation={3}
    >
      <Typography
        style={{
          fontSize: "1.5em",
          fontWeight: "bold",
          color: "#333",
          marginBottom: "20px"
        }}
      >
        Observaciones
      </Typography>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              style={{ fontSize: "1em", color: "#555", marginBottom: "10px" }}
            >
              Ingrese comentarios, notas o aclaraciones que considere
              necesarias:
            </Typography>
            <TextField
              id="comment"
              label="Observaciones"
              fullWidth
              multiline
              rows={4}
              value={formData.comentario}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </FormControl>
    </Paper>
  );
};

export default ObservationsForm;
