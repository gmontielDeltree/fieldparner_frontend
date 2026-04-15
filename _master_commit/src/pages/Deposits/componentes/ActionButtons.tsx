import React from "react";
import { Grid, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ActionButtonsProps } from "./types";



export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onSubmit,
  isEditMode,
}) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
      <Grid item xs={12} sm={3}>
        <Button variant="contained" color="inherit" fullWidth onClick={onCancel}>
          {t("id_cancel")}
        </Button>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={onSubmit}
        >
          {isEditMode ? t("id_update") : t("_add")}
        </Button>
      </Grid>
    </Grid>
  );
};