import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { GridColDef } from '@mui/x-data-grid';
import { GenericListPage } from '../../components';
import { CampaingExpenses } from '../../interfaces/campaignExpenses';
import { useCampaign, useCampaingExpenses, useCompany, useField } from '../../hooks';
import {
  formatAmount,
  getCampaignDisplayName,
  getCompanyDisplayName,
  getExpenseTotalAmount,
  getFieldDisplayName,
  getLotDisplayName,
} from './helpers';

const formatDate = (value?: string) => {
  if (!value) return '-';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleDateString('es-AR');
};

export const ListCampaignExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, getCampaigns } = useCampaign();
  const { fields, getFields } = useField();
  const { companies, getCompanies } = useCompany();
  const {
    campaingExpenses,
    getCampaingExpenses,
    removeCampingExpeses,
    isLoading,
  } = useCampaingExpenses();

  useEffect(() => {
    const loadPage = async () => {
      await Promise.all([
        getCampaigns(),
        getFields(),
        getCompanies(),
        getCampaingExpenses(),
      ]);
    };

    loadPage();
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'campaign',
        headerName: 'Campaña',
        flex: 1,
        minWidth: 180,
        renderCell: params => getCampaignDisplayName(campaigns, params.row.campaign),
      },
      {
        field: 'zafra',
        headerName: 'Zafra',
        flex: 0.7,
        minWidth: 110,
        renderCell: params => params.row.zafra || '-',
      },
      {
        field: 'field',
        headerName: 'Campo',
        flex: 1,
        minWidth: 160,
        renderCell: params => getFieldDisplayName(fields, params.row.field),
      },
      {
        field: 'lot',
        headerName: 'Lote',
        flex: 0.9,
        minWidth: 140,
        renderCell: params => getLotDisplayName(fields, params.row.field, params.row.lot),
      },
      {
        field: 'hectares',
        headerName: 'Hectáreas',
        flex: 0.7,
        minWidth: 110,
        renderCell: params => params.row.hectares || '-',
      },
      {
        field: 'detailsCount',
        headerName: 'Ítems',
        flex: 0.6,
        minWidth: 90,
        sortable: false,
        renderCell: params => `${params.row.listCamapingExpeses?.length || 0}`,
      },
      {
        field: 'totalAmount',
        headerName: 'Total',
        flex: 0.8,
        minWidth: 130,
        sortable: false,
        renderCell: params => `$ ${formatAmount(getExpenseTotalAmount(params.row as CampaingExpenses))}`,
      },
      {
        field: 'lastCompany',
        headerName: 'Última sociedad',
        flex: 1,
        minWidth: 180,
        sortable: false,
        renderCell: params => {
          const details = params.row.listCamapingExpeses || [];
          const lastDetail = details[details.length - 1];
          return getCompanyDisplayName(companies, lastDetail?.company) || '-';
        },
      },
      {
        field: 'updatedAt',
        headerName: 'Actualizado',
        flex: 0.8,
        minWidth: 120,
        renderCell: params => formatDate(params.row.updatedAt || params.row.createdAt),
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        flex: 0.9,
        minWidth: 150,
        sortable: false,
        filterable: false,
        renderCell: params => {
          const row = params.row as CampaingExpenses;

          return (
            <Box display='flex' justifyContent='center'>
              <Tooltip title='Ver'>
                <IconButton onClick={() => navigate(`/init/overview/campaign-expenses/${row._id}/view`)}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Editar'>
                <IconButton onClick={() => navigate(`/init/overview/campaign-expenses/${row._id}`)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Eliminar'>
                <IconButton
                  color='error'
                  onClick={async () => {
                    if (!row._id || !row._rev) return;

                    const result = await Swal.fire({
                      icon: 'warning',
                      title: 'Eliminar gasto de campaña',
                      text: 'Esta acción eliminará el registro completo con todos sus ítems.',
                      showCancelButton: true,
                      confirmButtonText: 'Eliminar',
                      cancelButtonText: 'Cancelar',
                    });

                    if (!result.isConfirmed) return;

                    const deleted = await removeCampingExpeses(row._id, row._rev);
                    if (deleted) {
                      await getCampaingExpenses();
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [campaigns, companies, fields, getCampaingExpenses, navigate, removeCampingExpeses],
  );

  return (
    <GenericListPage
      title='Gastos de Campaña'
      moduleRoute='/init/overview/campaign-expenses'
      data={campaingExpenses}
      columns={columns}
      getData={getCampaingExpenses}
      deleteData={(_id: string, _rev: string) => {}}
      setActiveItem={(_item: CampaingExpenses) => {}}
      newItemPath='/init/overview/campaign-expenses/new'
      editItemPath={id => `/init/overview/campaign-expenses/${id}`}
      isLoading={isLoading}
      showAddButton
    />
  );
};
