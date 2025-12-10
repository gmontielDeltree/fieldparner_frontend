import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useZones } from '../hooks';
import { useTranslation } from 'react-i18next';
//import { setZoneActive } from '../redux/zones';
import { Zones } from '../types';
import { GenericListPage } from '../components';
import { setZoneActive } from '../redux/zones';

export const ListZonesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isLoading } = useAppSelector(state => state.ui);
  const { zones, getZones, removeZone } = useZones();

  // useEffect(() => {
  //   getZones();
  // }, []);

  const columns = [
    { field: 'zone', headerName: t('_zone'), flex: 1 },
    { field: 'description', headerName: t('description'), flex: 1 },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Box display='flex' justifyContent='center'>
          <Tooltip title={t('icon_edit')}>
            <IconButton
              aria-label={t('icon_edit')}
              onClick={() => onClickUpdateZone(params.row)}
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
              onClick={() => handleDeleteZone(params.row)}
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

  // const onClickAddZone = () => navigate('/init/overview/zones/new');

  const handleDeleteZone = (item: Zones) => {
    if (item._id && item._rev) {
      removeZone(item._id, item._rev);
      getZones();
    }
  };

  const onClickUpdateZone = (item: Zones): void => {
    dispatch(setZoneActive(item));
    navigate(`/init/overview/zones/${item._id}`);
  };



  return (
    <GenericListPage
      moduleRoute='/init/overview/zones'
      isLoading={isLoading}
      data={zones}
      columns={columns}
      getData={getZones}
      deleteData={removeZone}
      setActiveItem={setZoneActive}
      newItemPath='/init/overview/zones/new'
      editItemPath={id => `/init/overview/zones/${id}`}
    />
  );
};
