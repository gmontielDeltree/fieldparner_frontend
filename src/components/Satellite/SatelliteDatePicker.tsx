import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React from "react";

export const SatelliteDatePicker: React.FC = ({value, onChange}) => {
  return (
    <React.Fragment>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Fecha"
          value={value}
          onChange={onChange}
        />
      </LocalizationProvider>
    </React.Fragment>
  );
};
