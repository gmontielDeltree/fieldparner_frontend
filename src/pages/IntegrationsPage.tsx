import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../components/Integrations/integraciones.module.css";
import { Box, Button, Typography } from "@mui/material";
import { CloseButtonPage } from "../components";

export const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.container}>
        <Box
          component="div"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2, pr: 2 , padding:"0px"}}
        >
          <Box display="flex" alignItems="center">
            <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
              Integraciones Disponibles
            </Typography>
          </Box>
          <CloseButtonPage />
        </Box>

        <div
          className={styles.deere}
          onClick={() => navigate("../john-deere")}
        ></div>
        <div
          className={styles.magris}
          onClick={() => navigate("../magris")}
        ></div>
      </div>
    </>
  );
};
