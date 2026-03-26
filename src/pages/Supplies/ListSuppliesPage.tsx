import React from 'react';
import { useSupply } from '../../hooks';
import { useAppDispatch } from '../../hooks'; // Asegúrate de que esta importación existe
import { setSupplyActive } from '../../redux/supply'; // Importa la acción del slice
import { GenericListPage } from '../../components';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const ListSuppliesPage: React.FC = () => {
  const { supplies, getSupplies, deleteSupply } = useSupply();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const columns = [
    { field: 'type', headerName: t('_type'), flex: 1 },
    { field: 'name', headerName: t('_supply'), flex: 1 },
    { field: 'unitMeasurement', headerName: t('unit_of_measure'), flex: 1 },
    { field: 'brand', headerName: t('brand'), flex: 1 },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display='flex' justifyContent='center'>
          <Tooltip title={t('edit')}>
            <IconButton
              aria-label={t('edit')}
              onClick={() => {
                dispatch(setSupplyActive(params.row));
                navigate(`/init/overview/supply/${params.row._id}`);
              }}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton
              aria-label={t('delete')}
              onClick={async () => {
                await deleteSupply(params.row._id, params.row._rev);
                getSupplies();
              }}
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

  return (
    <GenericListPage
      moduleRoute='/init/overview/supply'
      isLoading={false}
      data={supplies}
      columns={columns}
      getData={getSupplies}
      deleteData={deleteSupply}
      setActiveItem={item => dispatch(setSupplyActive(item))} // Actualiza esto también
      newItemPath='/init/overview/supply/new'
      editItemPath={id => `/init/overview/supply/${id}`}
    />
  );
};
