import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from 'semantic-ui-react';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  AddLocationAlt as AddLocationAltIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useForm, useAppDispatch, useAppSelector, useOriginDestinations } from '../hooks';
import { setOriginsDestinationsActive } from '../redux/originsdestinatons/originDestiantionsSlice';
import { useTranslation } from 'react-i18next';
import { OriginDestinations } from '../types';
import { GenericListPage } from '../components';

export const ListOriginsDestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.ui);
  const {
    originsDestinations,
    getOriginDestinations,
    removeOriginDestinations,
    searchOriginDestinations,
  } = useOriginDestinations();
  const { filterText, handleInputChange } = useForm({ filterText: '' });
  const { t } = useTranslation();

  // Función para formatear la geolocalización
  const formatGeolocation = (geolocation: any): string => {
    // Si es un string, devolverlo directamente (datos antiguos)
    if (typeof geolocation === 'string') {
      return geolocation;
    }

    // Si es un objeto con lat y lng, formatear como coordenadas
    if (geolocation && typeof geolocation === 'object') {
      if ('lat' in geolocation && 'lng' in geolocation) {
        // Verificar si son coordenadas por defecto
        if (geolocation.lat === -34 && geolocation.lng === -35) {
          return t('no_coordinates');
        }

        // Formatear las coordenadas con precisión de 5 decimales
        return `${geolocation.lat.toFixed(5)}, ${geolocation.lng.toFixed(5)}`;
      }
    }

    // Para cualquier otro caso
    return t('no_coordinates');
  };

  const columns = [
    {
      field: 'type',
      headerName: t('_type'),
      flex: 1,
      renderCell: (params: { row: { destino: any; procedencia: any } }) =>
        params.row.destino ? t('destination') : params.row.procedencia ? t('origin') : '',
    },
    { field: 'name', headerName: t('_description'), flex: 1 },
    {
      field: 'geolocation',
      headerName: t('_geolocation'),
      flex: 1,
      renderCell: (params: { row: { geolocation: any } }) => {
        // Renderizar la geolocalización con icono y formato adecuado
        const geoText = formatGeolocation(params.row.geolocation);

        return (
          <Box display='flex' alignItems='center'>
            <LocationOnIcon fontSize='small' color='primary' sx={{ mr: 0.5 }} />
            <Typography variant='body2'>{geoText}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: (params: { row: OriginDestinations }) => (
        <Box display='flex' justifyContent='center'>
          <Tooltip title={t('icon_edit')}>
            <IconButton
              aria-label={t('icon_edit')}
              onClick={() => onClickUpdateOriginsDestinations(params.row)}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('icon_delete')}>
            <IconButton
              aria-label={t('icon_delete')}
              onClick={() => handleDeleteOriginsDestinations(params.row)}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const onClickAddOriginsDestinations = () => {
    // Limpiar el estado activo antes de navegar a la página de creación
    dispatch(setOriginsDestinationsActive(null));
    navigate('/init/overview/origins-destinations/new');
  };

  const onClickUpdateOriginsDestinations = (item: OriginDestinations): void => {
    dispatch(setOriginsDestinationsActive(item));
    navigate(`/init/overview/origins-destinations/${item._id}`);
  };

  const handleDeleteOriginsDestinations = (item: OriginDestinations) => {
    if (item._id && item._rev) {
      removeOriginDestinations(item._id, item._rev);
      getOriginDestinations();
    }
  };

  const onClickSearch = () => {
    if (filterText === '') {
      alert(t('please_enter_search_term'));
      return;
    }
    searchOriginDestinations(filterText);
  };

  return (
    <GenericListPage
      moduleRoute='/init/overview/origins-destinations'
      isLoading={false}

      data={originsDestinations}
      columns={columns}
      getData={getOriginDestinations}
      deleteData={removeOriginDestinations}
      setActiveItem={setOriginsDestinationsActive}
      newItemPath='/init/overview/origins-destinations/new'
      editItemPath={id => `/init/overview/origins-destinations/${id}`}
      onNewItem={() => {
        // Asegurarnos de limpiar el estado activo antes de crear un nuevo ítem
        dispatch(setOriginsDestinationsActive(null));
        navigate('/init/overview/origins-destinations/new');
      }}
    />
  );
};
