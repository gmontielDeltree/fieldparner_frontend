import { useEffect } from "react";
import {
  TextField,
  FormControl,
  Grid, Paper,
  Typography
} from "@mui/material";
import { useBusiness } from "../../../../hooks";
import { useCrops } from "../../../../hooks/useCrops";
import "../../../../classes/Crops";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { styled } from "@mui/material/styles";
import { AutocompleteCultivo } from "../../components/AutocompleteCultivo";
import { AutocompleteContratista } from "../../components/AutocompleteContratista";

import { es } from 'date-fns/locale';
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

function PersonalForm({ lot, formData, setFormData }) {
  const { businesses, getBusinesses } = useBusiness();
  const { crops } = useCrops();

  useEffect(() => {
    getBusinesses();
  }, []);

  const onFieldChange = (fieldName, value) => {
    if (fieldName === "contratista") {
      //console.log("contratista",value)
      // Set 
      setFormData({
        ...formData,
        contratista: value
      });
    } else if (fieldName === "fecha") {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          fecha_ejecucion_tentativa: value
        }
      });
    } else if (fieldName === "cultivo") {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          cultivo: value
        }
      });
    } else {
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          hectareas: value
        }
      });
    }
  };
  return (
    <CustomPaper elevation={3}>
      <Title>General</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
         
              <AutocompleteCultivo value={formData.detalles.cultivo || ""} 
              onChange={(value) => onFieldChange("cultivo", value)}
              />
       
          </Grid>

         <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha"
                sx={{width:"100%"}}
                value={
                  formData.detalles.fecha_ejecucion_tentativa
                    ? new Date(formData.detalles.fecha_ejecucion_tentativa)
                    : new Date()
                }
                onChange={(newValue) => onFieldChange("fecha", newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={10} sm={6}>
              <AutocompleteContratista
              value={formData.contratista || ""}
              onChange={(value) => onFieldChange("contratista", value)}
              />
          </Grid>

          <Grid item xs={4}>
            <NumberFieldWithUnits
              label="Hectáreas"
              unit="ha"
              value={formData.detalles.hectareas || 0}
              onChange={(e) => onFieldChange("hectareas", e.target.value)}
            />
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default PersonalForm;
