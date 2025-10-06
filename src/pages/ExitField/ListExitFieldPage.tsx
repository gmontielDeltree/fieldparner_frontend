import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericListPage } from '../../components';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useExitField } from '../../hooks';
import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ExitFieldItem } from '../../types';
import i18n from '../../i18n';

export const ListExitFieldPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, exitFields, getExitFields } = useExitField();
  const { t } = useTranslation();

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'creationDate',
      headerName: t('_date'),
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'fieldName',
      headerName: t('_field'),
      width: 150,
      align: 'center',
      headerAlign: 'center',
      valueGetter: params => params.row.field?.nombre || '',
    },
    {
      field: 'loteName',
      headerName: t('_batch'),
      width: 150,
      align: 'center',
      headerAlign: 'center',
      valueGetter: params => {
        const lote = params.row.field?.lotes.find(l => l._id === params.row.lotId);
        return lote?.properties?.nombre || '';
      },
    },
    {
      field: 'campaignId',
      headerName: t('_campaign'),
      width: 180,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'cropName',
      headerName: t('_crop'),
      width: 150,
      align: 'center',
      headerAlign: 'center',
      valueGetter: params => {
        if (!params.row.crop) return '';
        return i18n.language === 'es'
          ? params.row.crop.descriptionES
          : i18n.language === 'en'
          ? params.row.crop.descriptionEN
          : params.row.crop.descriptionPT;
      },
    },
    {
      field: 'transportName',
      headerName: t('_transport'),
      width: 180,
      align: 'center',
      headerAlign: 'center',
      valueGetter: params => params.row.transport?.nombreCompleto || '',
    },
    {
      field: 'kgNet',
      headerName: t('net_kg'),
      width: 120,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: t('actions'),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Tooltip title={t('icon_edit')}>
          <IconButton aria-label={t('icon_edit')} onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Handle edit button click
  const handleEdit = (item: ExitFieldItem) => {
    navigate(`/init/overview/exit-field/edit/${item._id}`);
  };

  // Mock delete function (you'll need to implement this)
  const handleDelete = (id: string, rev: string) => {
    console.log(`Deleting item with id: ${id} and rev: ${rev}`);
    // Implement your delete logic here
  };



  return (
    <GenericListPage
      moduleRoute='/init/overview/exit-field'
      data={exitFields}
      columns={columns}
      getData={getExitFields}
      deleteData={handleDelete}
      setActiveItem={item => console.log('Item selected:', item)}
      newItemPath='/init/overview/exit-field/new'
      editItemPath={id => `/init/overview/exit-field/edit/${id}`}
      isLoading={isLoading}
    />
  );
};
