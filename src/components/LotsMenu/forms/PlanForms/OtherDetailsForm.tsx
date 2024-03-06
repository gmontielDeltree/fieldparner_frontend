import React from "react";
import {
  TextField,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { NumberFieldWithUnits } from "../../components/NumberField";

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7"
});

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px"
});

interface OtherDetailsFormProps {
  lot: any;
  formData: any;
  setFormData: (formData: any) => void;
}

const OtherDetailsForm: React.FC<OtherDetailsFormProps> = ({
  lot,
  formData,
  setFormData
}) => {
  console.log("Tipo siembra: ", formData.detalles.tipo_siembra);
  console.log("densidad siembra: ", formData.detalles.densidad);
  console.log("distancia siembra: ", formData.detalles.distancia);
  console.log("profundidad siembra: ", formData.detalles.profundidad);

  const handleInputChange = (field) => (event) => {
    const { value } = event.target;
    console.log("FormData inside : ", field);

    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        [field]: value
      }
    });
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Otros Datos</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              style={{ width: "100%" }}
              select
              id="tipo_siembra"
              label="Tipo de Siembra"
              value={formData.detalles.tipo_siembra || ""}
              onChange={handleInputChange("tipo_siembra")}
            >
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
            <NumberFieldWithUnits 
              value={formData.detalles.densidad_objetivo}
              onChange={handleInputChange("densidad_objetivo")}
              unit="plantas/ha"
              label="Densidad Objetivo" />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              id="profundidad"
              label="Profundidad"
              type="number"
              value={formData.detalles.profundidad || ""}
              onChange={handleInputChange("profundidad")}
              fullWidth
              unit="cm"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              id="distancia"
              label="Distancia entre surcos"
              type="number"
              value={formData.detalles.distancia}
              onChange={handleInputChange("distancia")}
              fullWidth
              unit="cm"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              id="peso_1000"
              label="Peso 1000 semillas"
              type="number"
              value={formData.detalles.peso_1000}
              onChange={handleInputChange("peso_1000")}
              unit="grs"
              fullWidth
            />
          </Grid>
         
        </Grid>
      </FormControl>
    </CustomPaper>
  );
};

export default OtherDetailsForm;
