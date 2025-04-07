import React from "react";
import { Grid, TextField } from "@mui/material";
import { FormSection } from "../../../components";
import { MapPickerReact } from "../../../../owncomponents/map-picker/react-port/MapPicker";
import { useTranslation } from "react-i18next";
import { GeolocationSectionProps } from "./types";
import { getBoundaries } from "../../../utils/geolocation";



export const GeolocationSection: React.FC<GeolocationSectionProps> = ({
  formulario,
  setFormulario,
}) => {
  const { t } = useTranslation();


  const boundaries = getBoundaries(formulario.country);

  const handleGeolocationChange = (newLocation: { lat: number; lng: number }) => {
    setFormulario(prev => ({
      ...prev,
      geolocation: newLocation,
    }));
  };

  return (
    <FormSection title={t("geolocation")}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            label="Latitud"
            type="number"
            size="small"
            value={formulario.geolocation.lat?.toFixed(5) || ""}
            onChange={(e) =>
              handleGeolocationChange({ 
                ...formulario.geolocation, 
                lat: +e.target.value 
              })
            }
            fullWidth
            inputProps={{ 
              min: boundaries.minLat, 
              max: boundaries.maxLat, 
              step: "0.00001" 
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Longitud"
            type="number"
            size="small"
            value={formulario.geolocation.lng?.toFixed(5) || ""}
            onChange={(e) =>
              handleGeolocationChange({ 
                ...formulario.geolocation, 
                lng: +e.target.value 
              })
            }
            fullWidth
            inputProps={{ 
              min: boundaries.minLng, 
              max: boundaries.maxLng, 
              step: "0.00001" 
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MapPickerReact
            posicion={formulario.geolocation}
            onPicked={({ detail }: any) => handleGeolocationChange(detail)}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};