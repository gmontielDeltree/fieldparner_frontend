import React, { useState } from "react";
import { TextField, FormControl, Grid, MenuItem } from "@mui/material";

const OtherDetailsForm = () => {
  const [formData, setFormData] = useState({
    tipoSiembra: "",
    densidadObjetivo: "",
    marcaInoculado: "",
    profundidad: "",
    distanciaEntreSurcos: "",
    pesoMilSemillas: "",
    formacionInoculado: ""
  });

  const handleFieldChange = (field, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
  };

  return (
    <div>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              style={{ width: "100%" }}
              select
              label="Tipo de Siembra"
              value={formData.tipoSiembra}
              onChange={(e) => handleFieldChange("tipoSiembra", e.target.value)}
            >
              <MenuItem value="">Sin Especificar</MenuItem>
              <MenuItem value="Siembra Directa">Siembra Directa</MenuItem>
              <MenuItem value="Siembra Tradicional">
                Siembra Tradicional
              </MenuItem>
              <MenuItem value="Al voleo">Al voleo</MenuItem>
              <MenuItem value="Siembra por fila/surcos">
                Siembra por fila/surcos
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="densidad-objetivo"
              label="Densidad Objetivo"
              type="number"
              value={formData.densidadObjetivo}
              onChange={(e) =>
                onFieldChange("densidadObjetivo", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="marca-inoculado"
              label="Marca Inoculado"
              value={formData.marcaInoculado}
              onChange={(e) => onFieldChange("marcaInoculado", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="profundidad"
              label="Profundidad"
              type="number"
              value={formData.profundidad}
              onChange={(e) => onFieldChange("profundidad", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="distancia-entre-surcos"
              label="Distancia entre surcos"
              type="number"
              value={formData.distanciaEntreSurcos}
              onChange={(e) =>
                onFieldChange("distanciaEntreSurcos", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="peso-1000-semillas"
              label="Peso 1000 semillas"
              type="number"
              value={formData.pesoMilSemillas}
              onChange={(e) => onFieldChange("pesoMilSemillas", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="formacion-inoculado"
              label="Formacion Inoculado"
              value={formData.formacionInoculado}
              onChange={(e) =>
                onFieldChange("formacionInoculado", e.target.value)
              }
              fullWidth
            />
          </Grid>
        </Grid>
      </FormControl>
    </div>
  );
};

export default OtherDetailsForm;
