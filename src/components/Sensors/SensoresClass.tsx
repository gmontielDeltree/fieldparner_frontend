import React, { useState, useEffect } from 'react';
import { Devices } from './sensores';
import devices_modelos from './devices_modelos';

import TemperaturaCard from './mediciones-cards/temperatura';
import PresionCard from './mediciones-cards/presion';
import HumedadCard from './mediciones-cards/humedad';
import RadiacionCard from './mediciones-cards/radiacion';
import VientoVelocidadCard from './mediciones-cards/viento_velocidad';
import VientoDireccionCard from './mediciones-cards/viento_direccion';
import SensacionTermicaCard from './mediciones-cards/sensacion_termica';
import PuntoDeRocioCard from './mediciones-cards/punto_de_rocio';
import InversionTermicaChacabucoBajaCard from './mediciones-cards/inversion_termica_chacabuco_baja';
import StressTermicoCard from './mediciones-cards/stress_termico';
import PluviometroCard from './mediciones-cards/pluviometro';

import {
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Grid,
  CircularProgress,
  useTheme,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SensorsIcon from '@mui/icons-material/Sensors';

const drawerWidth = 400;

const SensoresClass = ({ onClose, map, uuid, selectedDeviceCard: initialDeviceCard }) => {
  const [selectedDeviceCard, setSelectedDeviceCard] = useState(initialDeviceCard);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [devices] = useState(new Devices());
  const [datapoints, setDatapoints] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (initialDeviceCard) {
      setSelectedDeviceCard(initialDeviceCard);
    }
  }, [initialDeviceCard]);

  useEffect(() => {
    if (selectedDeviceCard) {
      const fetchDetails = async () => {
        const details = await devices.get_details(selectedDeviceCard.device_id);
        setSelectedDetails(details || {});
        loadDataPoints(selectedDeviceCard.device_id);
      };
      fetchDetails();
    }
  }, [selectedDeviceCard]);

  const loadDataPoints = async (deviceId) => {
    const nt = await devices.get_raw_data_for_charts_generic(deviceId);
    setDatapoints(nt);
  };

  const deviceTiene = (sensor) => {
    if (!selectedDetails?.tipo) return false;
    const tipo = selectedDetails.tipo;
    return devices_modelos[tipo]?.sensores.includes(sensor) || false;
  };

  const ifLoadedShow = (nombre_var) => {
    if (!selectedDetails?.tipo) return false;
    return deviceTiene(nombre_var) && !!selectedDeviceCard;
  };

  if (!selectedDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
<Drawer
  variant="persistent"
  anchor="right"
  open={true}
  sx={{
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', margin: 0 }, // Aseguramos que no tenga margen
  }}
>

  
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, marginRight: 1 }}>
            <SensorsIcon />
          </Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Sensores
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        p={2}
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <Grid container spacing={2}>
          {ifLoadedShow('temperatura') && (
            <Grid item xs={12}>
              <TemperaturaCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('humedad') && (
            <Grid item xs={12}>
              <HumedadCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('presion') && (
            <Grid item xs={12}>
              <PresionCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('radiacion_solar') && (
            <Grid item xs={12}>
              <RadiacionCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('viento_velocidad') && (
            <Grid item xs={12}>
              <VientoVelocidadCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('viento_direccion') && (
            <Grid item xs={12}>
              <VientoDireccionCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('pluviometro') && selectedDeviceCard && (
            <Grid item xs={12}>
              <PluviometroCard deveui={selectedDeviceCard.device_id} />
            </Grid>
          )}
          {ifLoadedShow('sensacion_termica') && (
            <Grid item xs={12}>
              <SensacionTermicaCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('punto_de_rocio') && (
            <Grid item xs={12}>
              <PuntoDeRocioCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('inversion_termica_chacabuco_baja') && (
            <Grid item xs={12}>
              <InversionTermicaChacabucoBajaCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
          {ifLoadedShow('stress_termico') && (
            <Grid item xs={12}>
              <StressTermicoCard card={selectedDeviceCard} data={datapoints} />
            </Grid>
          )}
        </Grid>
      </Box>
    </Drawer>
  );
};

export default SensoresClass;
