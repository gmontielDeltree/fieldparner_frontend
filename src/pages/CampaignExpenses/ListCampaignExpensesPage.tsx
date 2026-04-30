import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

import { GenericListPage } from '../../components';
import { useCampaign, useCampaingExpenses, useCompany, useField } from '../../hooks';
import {
    CampaingExpenses,
    isCampaignExpenseClosed,
} from '../../interfaces/campaignExpenses';
import {
    formatAmount,
    getCampaignDisplayName,
    getCompanyDisplayName,
    getExpenseItemsCount,
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
    const { t } = useTranslation();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = useCallback(
        async (id: string, rev: string) => {
            const item = campaingExpenses.find(c => c._id === id);
            if (isCampaignExpenseClosed(item)) {
                Swal.fire(
                    t('warning') || 'Advertencia',
                    t('campaign_expense_closed_no_delete') ||
                        'No se puede eliminar: la campaña está cerrada.',
                    'warning',
                );
                return;
            }
            const result = await Swal.fire({
                icon: 'warning',
                title: t('confirm_delete_title') || 'Eliminar gasto de campaña',
                text:
                    t('confirm_delete_campaign_expense') ||
                    'Esta acción eliminará el registro completo con todos sus ítems.',
                showCancelButton: true,
                confirmButtonText: t('delete') || 'Eliminar',
                cancelButtonText: t('cancel') || 'Cancelar',
            });
            if (result.isConfirmed) {
                await removeCampingExpeses(id, rev);
            }
        },
        [campaingExpenses, removeCampingExpeses, t],
    );

    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: 'campaign',
                headerName: t('campaign') || 'Campaña',
                flex: 1,
                minWidth: 160,
                renderCell: params =>
                    (params.row as CampaingExpenses).campaignName ||
                    getCampaignDisplayName(campaigns, (params.row as CampaingExpenses).campaign) ||
                    '-',
            },
            {
                field: 'zafra',
                headerName: t('harvest') || 'Zafra',
                flex: 0.7,
                minWidth: 110,
                renderCell: params => (params.row as CampaingExpenses).zafra || '-',
            },
            {
                field: 'field',
                headerName: t('field') || 'Campo',
                flex: 1,
                minWidth: 160,
                renderCell: params =>
                    (params.row as CampaingExpenses).fieldName ||
                    getFieldDisplayName(fields, (params.row as CampaingExpenses).field) ||
                    '-',
            },
            {
                field: 'lot',
                headerName: t('lot') || 'Lote',
                flex: 0.9,
                minWidth: 140,
                renderCell: params => {
                    const row = params.row as CampaingExpenses;
                    return (
                        row.lotName ||
                        getLotDisplayName(fields, row.field, row.lot) ||
                        '-'
                    );
                },
            },
            {
                field: 'hectares',
                headerName: t('hectares') || 'Has',
                flex: 0.6,
                minWidth: 90,
                renderCell: params => {
                    const row = params.row as CampaingExpenses;
                    if (typeof row.hectareas === 'number' && row.hectareas > 0) {
                        return row.hectareas.toFixed(2);
                    }
                    return row.hectares || '-';
                },
            },
            {
                field: 'cropName',
                headerName: t('crop') || 'Cultivo',
                flex: 0.8,
                minWidth: 110,
                renderCell: params => (params.row as CampaingExpenses).cropName || '-',
            },
            {
                field: 'detailsCount',
                headerName: t('items') || 'Ítems',
                flex: 0.5,
                minWidth: 80,
                sortable: false,
                renderCell: params => `${getExpenseItemsCount(params.row as CampaingExpenses)}`,
            },
            {
                field: 'totalAmount',
                headerName: t('total') || 'Total',
                flex: 0.8,
                minWidth: 130,
                sortable: false,
                renderCell: params =>
                    `$ ${formatAmount(getExpenseTotalAmount(params.row as CampaingExpenses))}`,
            },
            {
                field: 'lastCompany',
                headerName: t('last_company') || 'Última sociedad',
                flex: 1,
                minWidth: 180,
                sortable: false,
                renderCell: params => {
                    const row = params.row as CampaingExpenses;
                    const lastDetalle = row.detalleGastos?.[row.detalleGastos.length - 1];
                    if (lastDetalle?.sociedadNombre) return lastDetalle.sociedadNombre;
                    const legacy = (row.listCamapingExpeses || [])[
                        (row.listCamapingExpeses || []).length - 1
                    ];
                    return getCompanyDisplayName(companies, legacy?.company) || '-';
                },
            },
            {
                field: 'updatedAt',
                headerName: t('updated_at') || 'Actualizado',
                flex: 0.8,
                minWidth: 120,
                renderCell: params => {
                    const row = params.row as CampaingExpenses;
                    return formatDate(row.updatedAt || row.createdAt);
                },
            },
            {
                field: 'actions',
                headerName: t('actions') || 'Acciones',
                width: 170,
                sortable: false,
                filterable: false,
                renderCell: params => {
                    const row = params.row as CampaingExpenses;
                    const closed = isCampaignExpenseClosed(row);
                    return (
                        <Box display="flex" justifyContent="center" gap={0.5}>
                            <Tooltip title={t('view') || 'Ver'}>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() =>
                                        navigate(`/init/overview/campaign-expenses/${row._id}/view`)
                                    }
                                >
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title={
                                    closed
                                        ? t('campaign_expense_closed_no_edit') || 'Campaña cerrada'
                                        : t('icon_edit') || 'Editar'
                                }
                            >
                                <span>
                                    <IconButton
                                        size="small"
                                        disabled={closed}
                                        onClick={() =>
                                            navigate(`/init/overview/campaign-expenses/${row._id}`)
                                        }
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip
                                title={
                                    closed
                                        ? t('campaign_expense_closed_no_delete') || 'Campaña cerrada'
                                        : t('icon_delete') || 'Eliminar'
                                }
                            >
                                <span>
                                    <IconButton
                                        size="small"
                                        disabled={closed}
                                        color="error"
                                        onClick={() =>
                                            handleDelete(row._id || '', row._rev || '')
                                        }
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    );
                },
            },
        ],
        [campaigns, companies, fields, handleDelete, navigate, t],
    );

    return (
        <GenericListPage<CampaingExpenses>
            title={t('campaign_expenses_title') || 'Gastos de Campaña'}
            data={campaingExpenses}
            columns={columns}
            getData={getCampaingExpenses}
            deleteData={handleDelete}
            setActiveItem={() => undefined}
            newItemPath="/init/overview/campaign-expenses/new"
            editItemPath={id => `/init/overview/campaign-expenses/${id}`}
            isLoading={isLoading}
            showAddButton
            moduleRoute="/init/overview/campaign-expenses"
        />
    );
};

export default ListCampaignExpensesPage;
