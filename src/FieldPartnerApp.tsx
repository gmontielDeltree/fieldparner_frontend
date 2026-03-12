import React from "react";
import { AppTheme } from "./themes";
import { AppRouter } from "./routers/AppRouter";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { NotificationProvider } from "./contexts/NotificationContext";

const FieldPartnerApp: React.FC = () => {
  return (
    <AppTheme>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </LocalizationProvider>
    </AppTheme>
  );
};

export default FieldPartnerApp;
