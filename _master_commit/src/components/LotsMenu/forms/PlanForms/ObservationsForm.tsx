import React, { useState } from "react";
import { TextField, FormControl, Grid, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      comentario: event.target.value
    });

    console.log("Form data:", 
      formData)
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
        {t("observationsTitle")}
      </Typography>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              style={{ fontSize: "1em", color: "#555", marginBottom: "10px" }}
            >
              {t("observationsDescription")}
            </Typography>
            <TextField
              id="comment"
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
