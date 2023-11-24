import React from "react";
import { TextField, FormControl, Grid } from "@mui/material";
import DateTimePicker from "@mui/lab/DateTimePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

function PersonalForm({ contractor, date, hectares, onFieldChange }) {
  return (
    <div>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              id="contratista"
              label="Contratista"
              fullWidth
              value={contractor}
              onChange={(e) => onFieldChange("contratista", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="fecha"
              label="fecha"
              fullWidth
              value={contractor}
              onChange={(e) => onFieldChange("fecha", e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="hectareas"
              label="Hectáreas"
              fullWidth
              type="number"
              value={hectares}
              onChange={(e) => onFieldChange("hectareas", e.target.value)}
            />
          </Grid>
        </Grid>
      </FormControl>
    </div>
  );
}

export default PersonalForm;
