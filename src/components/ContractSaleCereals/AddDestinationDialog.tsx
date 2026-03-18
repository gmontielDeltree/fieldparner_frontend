import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Marker } from 'mapbox-gl';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import { useTranslation } from 'react-i18next';
import MapComponent from '../Map';
import { Geolocation } from '../../types';
import { getBoundaries } from '../../utils/geolocation';
import { useAppSelector } from '../../hooks';

const DEFAULT_GEO: Geolocation = { lat: -34, lng: -59 };

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, geolocation: Geolocation) => Promise<void>;
}

export const AddDestinationDialog: React.FC<Props> = ({ open, onClose, onSave }) => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const boundaries = getBoundaries(user?.country || 'AR');

  const [name, setName] = useState('');
  const [geolocation, setGeolocation] = useState<Geolocation>(DEFAULT_GEO);
  const [map, setMap] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const markerRef = useRef<Marker | null>(null);

  // Update or create marker when geolocation/map changes
  useEffect(() => {
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setLngLat([geolocation.lng, geolocation.lat]);
    } else {
      markerRef.current = new Marker({ color: '#1976d2', draggable: true })
        .setLngLat([geolocation.lng, geolocation.lat])
        .addTo(map);
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat();
        setGeolocation({ lat: lngLat.lat, lng: lngLat.lng });
        setLocationSet(true);
      });
    }
  }, [geolocation.lat, geolocation.lng, map]);

  // Map click handler
  useEffect(() => {
    if (!map) return;
    const handleClick = (e: any) => {
      setGeolocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setLocationSet(true);
    };
    map.getCanvas().style.cursor = 'crosshair';
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
      if (map.getCanvas()) map.getCanvas().style.cursor = '';
    };
  }, [map]);

  const handleMapLoad = (e: any) => {
    setMap(e.target);
  };

  const handleCenterMap = () => {
    if (map) {
      map.flyTo({ center: [geolocation.lng, geolocation.lat], zoom: 12, duration: 800, essential: true });
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newGeo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGeolocation(newGeo);
        setLocationSet(true);
        if (map) map.flyTo({ center: [newGeo.lng, newGeo.lat], zoom: 14, duration: 800, essential: true });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await onSave(name, geolocation);
    setIsSaving(false);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setGeolocation(DEFAULT_GEO);
    setLocationSet(false);
    setMap(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t('_add')} {t('_destination')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Nombre */}
          <Grid item xs={12}>
            <TextField
              autoFocus
              label={t('_description')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              fullWidth
            />
          </Grid>

          {/* Banner de instrucción */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
                color: 'white',
              }}
            >
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2">
                {locationSet ? t('location_set_click_again_to_update') : t('click_on_map_to_set_location')}
              </Typography>
              <Box
                sx={{
                  ml: 'auto',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: locationSet ? 'success.light' : 'warning.light',
                }}
              />
            </Box>
          </Grid>

          {/* Mapa */}
          <Grid item xs={12}>
            <Box sx={{ position: 'relative', height: 300, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
              <MapComponent onMapLoad={handleMapLoad} />
            </Box>
          </Grid>

          {/* Lat / Lng inputs + botones */}
          <Grid item xs={12} sm={4.5}>
            <TextField
              label={t('_latitude') || 'Latitud'}
              type="number"
              size="small"
              value={geolocation.lat.toFixed(5)}
              onChange={(e) =>
                setGeolocation((prev) => ({ ...prev, lat: +e.target.value }))
              }
              inputProps={{ min: boundaries.minLat, max: boundaries.maxLat, step: '0.00001', style: { textAlign: 'right' } }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4.5}>
            <TextField
              label={t('_longitude') || 'Longitud'}
              type="number"
              size="small"
              value={geolocation.lng.toFixed(5)}
              onChange={(e) =>
                setGeolocation((prev) => ({ ...prev, lng: +e.target.value }))
              }
              inputProps={{ min: boundaries.minLng, max: boundaries.maxLng, step: '0.00001', style: { textAlign: 'right' } }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={1.5} display="flex" justifyContent="center">
            <Tooltip title={t('center_map_on_location')}>
              <IconButton
                color="primary"
                onClick={handleCenterMap}
                sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: '8px' }}
              >
                <ZoomInMapIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={6} sm={1.5} display="flex" justifyContent="center">
            <Tooltip title={t('use_my_current_location')}>
              <IconButton
                color="primary"
                onClick={handleMyLocation}
                sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: '8px' }}
              >
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          {t('id_cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="success"
          disabled={!name.trim() || isSaving}
        >
          {t('_add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
