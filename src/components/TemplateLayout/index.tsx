import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { Box, Paper, Typography, Fade, Tooltip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAppSelector } from '../../hooks';
import MapComponent from '../Map';
import { addFieldsToMapSingleLayer } from '../../helpers/mapHelpers';
import { useField, useDeposit } from '../../hooks';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTranslation } from 'react-i18next';

export const MapContext = createContext({
  map: null,
  fields: [],
  deposits: [],
  selectedLocation: { lat: 0, lng: 0 },
  setSelectedLocation: (_loc: { lat: number; lng: number }) => {},
});

export const useMapContext = () => useContext(MapContext);

export interface TemplateLayoutProps {
  viewMap?: boolean;
  children: React.ReactNode;
  initialLocation?: { lat: number; lng: number };
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  formWidth?: number;
  viewSelector?: boolean; // <-- NUEVA PROPIEDAD
}

const drawerWidth = 245;

export const TemplateLayout: React.FC<TemplateLayoutProps> = ({
  viewMap = false,
  children,
  initialLocation,
  onLocationChange,
  formWidth = 50,
  viewSelector = true, // <-- DEFAULT TRUE
}) => {
  const { t } = useTranslation();
  const { openSideBar } = useAppSelector(s => s.ui);

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const { fields, getFields } = useField();
  const { deposits, getDeposits } = useDeposit();
  const [showMapHelper, setShowMapHelper] = useState(true);
  const [mapHovered, setMapHovered] = useState(false);
  const [mapActive, setMapActive] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation ?? { lat: -35.1923, lng: -59.2965 },
  );
  const prevLocation = useRef(selectedLocation);

  const isLocationSet = useRef(
    initialLocation && initialLocation.lat !== -35 && initialLocation.lng !== -34,
  );

  const [allowMapMovement, setAllowMapMovement] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAllowMapMovement(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleMapLoad = useCallback((e: mapboxgl.MapboxEvent) => {
    const mapInstance = e.target as mapboxgl.Map;
    setMap(mapInstance);

    // Añadir pulsación visual cuando el mapa se clickea
    mapInstance.on('mousedown', () => setMapActive(true));
    mapInstance.on('mouseup', () => setMapActive(false));
    mapInstance.on('mouseleave', () => setMapActive(false));
  }, []);

  const handleMapHover = useCallback(isHovering => {
    setMapHovered(isHovering);
  }, []);

  useEffect(() => {
    const diff =
      prevLocation.current.lat !== selectedLocation.lat ||
      prevLocation.current.lng !== selectedLocation.lng;

    if (diff && onLocationChange) {
      onLocationChange(selectedLocation);

      if (selectedLocation.lat !== -35 && selectedLocation.lng !== -34) {
        isLocationSet.current = true;
        setTimeout(() => setShowMapHelper(false), 3000);
      }
    }

    if (diff) prevLocation.current = selectedLocation;
  }, [selectedLocation, onLocationChange]);

  useEffect(() => {
    if (
      map &&
      allowMapMovement &&
      initialLocation &&
      (Math.abs(initialLocation.lat - selectedLocation.lat) > 0.0001 ||
        Math.abs(initialLocation.lng - selectedLocation.lng) > 0.0001)
    ) {
      map.flyTo({
        center: [initialLocation.lng, initialLocation.lat],
        zoom: 14,
        duration: 1000,
        essential: true,
      });
    }
  }, [initialLocation, map, allowMapMovement, selectedLocation]);

  useEffect(() => {
    if (viewMap) {
      getFields();
      getDeposits();
    }
  }, [viewMap, getFields, getDeposits]);

  useEffect(() => {
    if (map && fields.length) {
      addFieldsToMapSingleLayer(map, fields);

      if (deposits.length) {
        import('../../../owncomponents/mapa-principal/depositos-layer').then(
          ({ addDepositosToMap }) =>
            addDepositosToMap(map, deposits, (e: any) => {
              if (e?.latlng) {
                setSelectedLocation({
                  lat: e.latlng.lat,
                  lng: e.latlng.lng,
                });
                isLocationSet.current = true;
              }
            }),
        );
      }
    }
  }, [map, fields, deposits]);

  useEffect(() => {
    if (map) {
      map.getCanvas().addEventListener('mouseenter', () => {
        if (map) map.getCanvas().style.cursor = 'pointer';
        handleMapHover(true);
      });

      map.getCanvas().addEventListener('mouseleave', () => {
        if (map) map.getCanvas().style.cursor = '';
        handleMapHover(false);
        setMapActive(false);
      });

      return () => {
        if (map) {
          map.getCanvas().removeEventListener('mouseenter', () => {});
          map.getCanvas().removeEventListener('mouseleave', () => {});
          map.off('mousedown', () => {});
          map.off('mouseup', () => {});
          map.off('mouseleave', () => {});
        }
      };
    }
  }, [map, handleMapHover]);

  useEffect(() => {
    if (!mapHovered && isLocationSet.current) {
      const timer = setTimeout(() => {
        setShowMapHelper(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [mapHovered]);

  const ctxValue = {
    map,
    fields,
    deposits,
    selectedLocation,
    setSelectedLocation,
  };

  const sidebarOffset = openSideBar ? 0 : drawerWidth;

  // Calcular el ancho del mapa como complemento del ancho del formulario
  const mapWidth = 100 - formWidth;

  return (
    <MapContext.Provider value={ctxValue}>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 64px)',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: viewMap ? `${formWidth}%` : '100%',
            maxWidth: viewMap ? `${formWidth}%` : '100%',
            overflowY: 'auto',
            p: 2,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
        </Box>

        {/* MAPA ***************************************************************/}
        {viewMap && (
          <Box
            sx={{
              flexBasis: `calc(${mapWidth}% + ${sidebarOffset}px)`,
              flexGrow: 0,
              flexShrink: 0,
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <MapComponent onMapLoad={handleMapLoad} />

            {/* SOLO MUESTRA EL SELECTOR SI viewSelector ES TRUE */}
            {viewSelector && (
              <>
                <Fade in={showMapHelper || mapHovered}>
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 999,
                      p: 2,
                      borderRadius: 2,
                      maxWidth: '80%',
                      backgroundColor: 'rgba(25, 118, 210, 0.9)',
                      color: 'white',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 1)',
                      },
                    }}
                  >
                    <LocationOnIcon />
                    <Typography variant='body2' fontWeight='medium'>
                      {isLocationSet.current
                        ? t('click_to_update_warehouse_location')
                        : t('click_anywhere_on_map_to_set_warehouse_location')}
                    </Typography>
                  </Paper>
                </Fade>

                {!isLocationSet.current && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 995,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pointerEvents: 'none',
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    <Box
                      component='span'
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(0,0,0,0.2)',
                        marginBottom: 1,
                        '@keyframes pulse': {
                          '0%': {
                            transform: 'scale(0.95)',
                            boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                          },
                          '70%': {
                            transform: 'scale(1)',
                            boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                          },
                          '100%': {
                            transform: 'scale(0.95)',
                            boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
                          },
                        },
                      }}
                    >
                      <LocationOnIcon
                        sx={{
                          fontSize: 30,
                          color: '#1976d2',
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {t('click_here')}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: mapHovered ? '3px solid #1976d2' : '3px solid transparent',
                pointerEvents: 'none',
                zIndex: 990,
                transition: 'border-color 0.3s ease',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: mapActive ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                pointerEvents: 'none',
                zIndex: 989,
                transition: 'background-color 0.1s ease',
              }}
            />
          </Box>
        )}
      </Box>
    </MapContext.Provider>
  );
};
