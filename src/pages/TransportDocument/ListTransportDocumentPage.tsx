import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useTransportDocument } from '../../hooks';


import { GenericListPage } from '../../components';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { urlImg } from '../../config';
import { formatNumber } from '../../helpers/helper';

const renderPdfIcon = (params: GridRenderCellParams) => {
  return (
    <Tooltip title={params.row.archivoCertificado ? 'Ver PDF' : 'PDF no disponible'}>
      <IconButton
        aria-label='View PDF'
        disabled={!params.row.archivoCertificado}
        onClick={() => {
          if (params.row.archivoCertificado) {
            const url = `${urlImg}${params.row.archivoCertificado}`;
            console.log('Abriendo URL del PDF:', url);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
      >
        <PictureAsPdfIcon color={params.row.archivoCertificado ? 'primary' : 'disabled'} />
      </IconButton>
    </Tooltip>
  );
};

export const ListTransportDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();
  // const { t } = useTranslation();
  const { transportDocumentsItem, getTransportDocuments } = useTransportDocument();

  const columns: GridColDef[] = [
    { field: 'nroCartaPorte', headerName: 'Nro Carta Porte', flex: 1 },
    { field: 'fechaEmision', headerName: 'Fecha Emitida', flex: 1 },
    {
      field: 'razonSocial',
      headerName: 'Razon Social',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => params.row?.company?.socialReason || '-',
    },
    {
      field: 'cultive',
      headerName: 'Cultivo',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => params.row?.exitField?.cultive || '-',
    },
    {
      field: 'kgEstimado',
      headerName: 'Kg Estimados',
      flex: 1,
      renderCell: (params) => formatNumber(params?.value)
    }, //salidaCampoId
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'fileName',
      headerName: 'PDF',
      flex: 1,
      renderCell: renderPdfIcon,
    },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display='flex' justifyContent='center'>
          <Tooltip title='Edit'>
            <IconButton
              aria-label='Edit'
              onClick={() => {
                // if (params.row._id) getTransporDocumentById(params.row._id);
                navigate(`/init/overview/transport-documents/edit/${params.row._id}`);
              }}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete'>
            <IconButton
              aria-label='Delete'
              disabled
              onClick={() => console.log(params.row._id, params.row._rev)}
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
      moduleRoute='/init/overview/transport-documents'
      isLoading={false}
      data={transportDocumentsItem}
      columns={columns}
      getData={getTransportDocuments}
      deleteData={() => console.log('delete')}
      setActiveItem={item => console.log('setActiveItem', item)}
      newItemPath='/init/overview/transport-documents/new'
      editItemPath={id => `/init/overview/deposit/${id}`}
    />
  );
};
