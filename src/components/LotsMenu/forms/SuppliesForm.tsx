import React from "react";
import { TextField, FormControl, Grid } from "@mui/material";
import DateTimePicker from "@mui/lab/DateTimePicker";

function SuppliesForm({ contractor, date, hectares, onFieldChange }) {
  return (
    <div>
      <FormControl>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <TextField
              style={{ width: "100%" }}
              id="Todo"
              label="todo - connect to api"
              fullWidth
              value={contractor}
              onChange={(e) =>
                onFieldChange("todo - connect to api", e.target.value)
              }
            />
          </Grid>
        </Grid>
      </FormControl>
    </div>
  );
}

export default SuppliesForm;
