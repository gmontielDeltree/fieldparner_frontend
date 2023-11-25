import React from "react";
import { TextField, FormControl, Grid } from "@mui/material";
import DateTimePicker from "@mui/lab/DateTimePicker";

function ObservationsForm({ contractor, date, hectares, onFieldChange }) {
  return (
    <div>
      <FormControl>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              id="todo"
              label="Todo"
              fullWidth
              value={contractor}
              onChange={(e) => onFieldChange("todo", e.target.value)}
            />
          </Grid>
        </Grid>
      </FormControl>
    </div>
  );
}

export default ObservationsForm;
