import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericListPage } from '../../components';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContractSaleCereals } from '../../hooks';
import { formatNumber } from '../../helpers/helper';


//TODO: calcular los kg entregados y el valor cobrado
//TODO: permitir editar solo si ninguna carta de porte tiene el nro de contrato
export const ListSalesCerealsPage: React.FC = () => {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { getContractsSaleCereals, contractsSaleCerealsFull } = useContractSaleCereals();
  const [zafraFilter, setZafraFilter] = React.useState<string>("");

  const columns = [
    {
      field: 'contractSaleNumber',
      headerName: t('contract_sale_number'),
      flex: 1,
    },
    {
      field: 'dateCreated',
      headerName: t('date_created'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date
          .toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .replace(/\//g, '/');
      },
    },
    {
      field: 'companyId',
      headerName: t('society'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => params.row?.company?.socialReason || '-',
    },
    {
      field: 'campaignId',
      headerName: t('_campaign'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => params.row?.campaign?.name || '-',
    },
    {
      field: 'zafra',
      headerName: t('zafra'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const z = (params.row?.campaign && (params.row.campaign as any).zafra) || null;
        if (!z) return '-';
        return Array.isArray(z) ? z.join(', ') : String(z);
      }
    },
    {
      field: 'cropId',
      headerName: t('cultive'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => params.row?.crop?.descriptionES || '-',
    },
    {
      field: 'kg',
      headerName: t('kilograms'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => formatNumber(params.value),
    },
    {
      field: 'currency',
      headerName: t('currency'),
      flex: 1,
    },
    {
      field: 'amountValue',
      headerName: t('amount_value'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => formatNumber(params.value),
    },
    {
      field: 'kgDelivered',
      headerName: t('kg_delivered'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => formatNumber(params.value),
    },
    {
      field: 'valueCollected',
      headerName: t('value_collected'),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => formatNumber(params.value),
    },
    {
      field: 'status',
      headerName: t('status'),
      flex: 1,
    },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sorteable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display='flex' justifyContent='center'>
          <Tooltip title={t('icon_edit')}>
            <IconButton
              aria-label={t('icon_edit')}
              onClick={() => {
                console.log('edit', params.row._id);
              }}
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
      moduleRoute='/init/overview/sales-cereals'
      isLoading={false}
      data={zafraFilter ? contractsSaleCerealsFull.filter(c => {
        const z = (c.campaign as any)?.zafra;
        return Array.isArray(z) ? z.includes(zafraFilter) : z === zafraFilter;
      }) : contractsSaleCerealsFull}
      columns={columns}
      getData={getContractsSaleCereals}
      deleteData={() => console.log('delete')}
      setActiveItem={item => console.log('setActiveItem', item)}
      newItemPath='/init/overview/sales-cereals/new'
      editItemPath={id => `/init/overview/sales-cereals/edit/${id}`}
      headerContent={
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t('zafra')}</InputLabel>
          <Select label={t('zafra')} value={zafraFilter} onChange={(e) => setZafraFilter(e.target.value)}>
            <MenuItem value="">{t('_all')}</MenuItem>
            {Array.from(new Set(contractsSaleCerealsFull
              .map(c => (c.campaign as any)?.zafra)
              .flatMap((z: any) => Array.isArray(z) ? z : (z ? [z] : []))
            )).map((z: any) => (
              <MenuItem key={z} value={z}>{z}</MenuItem>
            ))}
          </Select>
        </FormControl>
      }
    />
  );
};
