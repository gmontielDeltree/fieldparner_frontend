import React, { useState } from "react";
import { FormControl, Grid, Select, MenuItem, InputLabel } from "@mui/material";

function SuppliesForm({ lot, db }) {
  // State to keep track of the selected option
  const [selectedOption, setSelectedOption] = useState("");

  // List of hardcoded options
  const options = ["Option 1", "Option 2", "Option 3"];

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    // Call onFieldChange or any other handler you need
    // onFieldChange("todo - connect to api", event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <InputLabel id="demo-simple-select-label">Select Option</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedOption}
              label="Insumos"
              onChange={handleSelectChange}
              fullWidth
            >
              {options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </FormControl>
    </div>
  );
}

export default SuppliesForm;
