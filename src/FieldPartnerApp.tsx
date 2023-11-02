import React from "react";
import { AppTheme } from "./themes";
import { AppRouter } from "./routers/AppRouter";
import { LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const FieldPartnerApp: React.FC = () => {
  return (
    <AppTheme>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AppRouter />
      </LocalizationProvider>
    </AppTheme>
  );
};

export default FieldPartnerApp;
