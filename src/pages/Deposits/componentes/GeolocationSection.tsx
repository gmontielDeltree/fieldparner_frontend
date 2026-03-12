import React, { useEffect, useState, useRef } from "react";
import { Grid, TextField, Button, Box, Typography, Paper, Tooltip, IconButton } from "@mui/material";
import { FormSection } from "../../../components";
import { useTranslation } from "react-i18next";
import { GeolocationSectionProps } from "./types";
import { getBoundaries } from "../../../utils/geolocation";
import { useMapContext } from "../../../components/TemplateLayout";
import { Marker } from "mapbox-gl";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import WarehouseIcon from "@mui/icons-material/Warehouse";

export const GeolocationSection: React.FC<GeolocationSectionProps> = ({
  formulario,
  setFormulario,
}) => {
  const { t } = useTranslation();
  const { map, setSelectedLocation } = useMapContext();
  const boundaries = getBoundaries(formulario.country);
  const [localMarker, setLocalMarker] = useState(null);
  const [isMapClicked, setIsMapClicked] = useState(
    formulario.geolocation && formulario.geolocation.lat !== -35 && formulario.geolocation.lng !== -34
  );
  const markerElementRef = useRef(null);

  const createCustomMarkerElement = () => {
    if (markerElementRef.current) return markerElementRef.current;

    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.position = 'relative';

    const markerMain = document.createElement('div');
    markerMain.style.width = '40px';
    markerMain.style.height = '40px';
    markerMain.style.borderRadius = '50%';
    markerMain.style.backgroundColor = '#1976d2';
    markerMain.style.display = 'flex';
    markerMain.style.alignItems = 'center';
    markerMain.style.justifyContent = 'center';
    markerMain.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    markerMain.style.border = '2px solid white';
    markerMain.style.position = 'absolute';
    markerMain.style.top = '0';
    markerMain.style.left = '5px';
    markerMain.style.zIndex = '2';
    markerMain.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('width', '24');
    iconSvg.setAttribute('height', '24');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('fill', 'white');

    const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    iconPath.setAttribute('d', 'M12 3L2 12h3v8h14v-8h3L12 3zm0 13h-5v-4h5v4zm5 0h-3v-4h3v4z');

    iconSvg.appendChild(iconPath);
    markerMain.appendChild(iconSvg);

    // Crear efecto de sombra/reflejo
    const reflectionEffect = document.createElement('div');
    reflectionEffect.style.width = '30px';
    reflectionEffect.style.height = '10px';
    reflectionEffect.style.borderRadius = '50%';
    reflectionEffect.style.backgroundColor = 'rgba(0,0,0,0.2)';
    reflectionEffect.style.position = 'absolute';
    reflectionEffect.style.bottom = '0';
    reflectionEffect.style.left = '10px';
    reflectionEffect.style.filter = 'blur(2px)';
    reflectionEffect.style.zIndex = '1';
    reflectionEffect.style.transform = 'scale(1, 0.3)';

    // Agregar elementos al contenedor principal
    el.appendChild(reflectionEffect);
    el.appendChild(markerMain);

    // Agregar efecto pulsante
    const pulse = document.createElement('div');
    pulse.style.width = '40px';
    pulse.style.height = '40px';
    pulse.style.borderRadius = '50%';
    pulse.style.backgroundColor = 'rgba(25, 118, 210, 0.4)';
    pulse.style.position = 'absolute';
    pulse.style.top = '0';
    pulse.style.left = '5px';
    pulse.style.zIndex = '0';
    pulse.style.animation = 'pulse-animation 2s infinite';

    // Definir la animación de pulso
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-animation {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
      
      .custom-marker:hover > div:first-of-type {
        transform: scale(1.1);
        box-shadow: 0 6px 12px rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(style);

    el.appendChild(pulse);

    markerElementRef.current = el;

    return el;
  };

  const updateMarkerOnMap = () => {
    if (!map) return;

    // Remove existing marker if present
    if (localMarker) {
      localMarker.remove();
    }

    const markerElement = createCustomMarkerElement();

    const newMarker = new Marker({
      element: markerElement,
      draggable: true,
      anchor: 'bottom'
    })
      .setLngLat([formulario.geolocation.lng, formulario.geolocation.lat])
      .addTo(map);

    newMarker.on('dragend', () => {
      const lngLat = newMarker.getLngLat();
      handleGeolocationChange({
        lat: lngLat.lat,
        lng: lngLat.lng
      });
      setIsMapClicked(true);
    });

    setLocalMarker(newMarker);
  };

  useEffect(() => {
    if (map && formulario.geolocation) {
      updateMarkerOnMap();
      setSelectedLocation(formulario.geolocation);
    }
  }, [formulario.geolocation.lat, formulario.geolocation.lng, map]);

  useEffect(() => {
    if (!map) return;

    const clickHandler = (e) => {
      const newLocation = {
        lat: e.lngLat.lat,
        lng: e.lngLat.lng
      };

      setFormulario(prev => ({
        ...prev,
        geolocation: newLocation
      }));

      setSelectedLocation(newLocation);

      setIsMapClicked(true);
    };

    map.getCanvas().style.cursor = 'pointer';

    // Add click event listener to map
    map.on('click', clickHandler);

    return () => {
      // Clean up event listener when component unmounts
      map.off('click', clickHandler);
      map.getCanvas().style.cursor = '';
    };
  }, [map, setFormulario, setSelectedLocation]);

  const handleGeolocationChange = (newLocation) => {
    setFormulario(prev => ({
      ...prev,
      geolocation: newLocation
    }));
    setSelectedLocation(newLocation);
    setIsMapClicked(true);
  };

  const handleCenterMap = () => {
    if (map && formulario.geolocation) {
      // In Mapbox, flyTo expects [lng, lat] not [lat, lng]
      map.flyTo({
        center: [formulario.geolocation.lng, formulario.geolocation.lat],
        zoom: 14,
        duration: 1000, // Animación más suave
        essential: true
      });
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          handleGeolocationChange(newLocation);

          if (map) {
            map.flyTo({
              center: [newLocation.lng, newLocation.lat],
              zoom: 14,
              duration: 1000,
              essential: true
            });
          }
        },
        (error) => {
          console.error("Error getting location", error);
          // Mostrar un mensaje de error al usuario
          alert(t("geolocation_error"));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  return (
    <FormSection title={t("geolocation")}>
      {/* Map Interaction Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box display="flex" alignItems="center">
          <LocationOnIcon sx={{ mr: 1 }} />
          <Typography variant="body1">
            {isMapClicked
              ? t("location_set_click_again_to_update")
              : t("click_on_map_to_set_location")}
          </Typography>
        </Box>

        <Tooltip title={t("location_selection_help")}>
          <IconButton size="small" sx={{ color: 'white' }}>
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Coordenadas y controles */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#2193b0',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#2193b0',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={6} sm={1}>
          <Tooltip title={t("center_map_on_location")}>
            <IconButton
              color="primary"
              onClick={handleCenterMap}
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              <ZoomInMapIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={6} sm={1}>
          <Tooltip title={t("use_my_current_location")}>
            <IconButton
              color="primary"
              onClick={handleMyLocation}
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Indicación adicional sobre arrastrabilidad del marcador */}
      <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
        <WarehouseIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {t("marker_drag_hint")}
        </Typography>
      </Box>

      {/* Status indicators */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isMapClicked ? 'success.main' : 'warning.main',
            mr: 1
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {isMapClicked
            ? t("location_selected")
            : t("waiting_for_location_selection")}
        </Typography>
      </Box>
    </FormSection>
  );
};