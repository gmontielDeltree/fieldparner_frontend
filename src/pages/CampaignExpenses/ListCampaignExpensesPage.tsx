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
import { useCampaingExpenses } from '../../hooks/useCampaignExpenses';
import { CampaingExpenses, isCampaignExpenseClosed } from '../../interfaces/campaignExpenses';

export const ListCampaignExpensesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const {
        campaingExpenses,
        getCampaingExpenses,
        removeCampingExpeses,
        isLoading,
    } = useCampaingExpenses();

    useEffect(() => {
        getCampaingExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = useCallback(
        async (id: string, rev: string) => {
            const item = campaingExpenses.find((c) => c._id === id);
            if (isCampaignExpenseClosed(item)) {
                Swal.fire(
                    t('warning') || 'Advertencia',
                    t('campaign_expense_closed_no_delete') || 'No se puede eliminar: la campaña está cerrada.',
                    'warning',
                );
                return;
            }
            const result = await Swal.fire({
                title: t('confirm_delete_title') || '¿Estás seguro?',
                text: t('confirm_delete_campaign_expense') || 'Se eliminará el gasto de campaña',
                icon: 'warning',
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
                field: 'campaignName',
                headerName: t('campaign') || 'Campaña',
                flex: 1,
                minWidth: 120,
                valueGetter: (params) =>
                    params.row?.campaignName || params.row?.campaign || '',
            },
            {
                field: 'zafra',
                headerName: t('harvest') || 'Zafra',
                flex: 1,
                minWidth: 120,
            },
            {
                field: 'fieldName',
                headerName: t('field') || 'Campo',
                flex: 1,
                minWidth: 140,
                valueGetter: (params) =>
                    params.row?.fieldName || params.row?.field || '',
            },
            {
                field: 'lotName',
                headerName: t('lot') || 'Lote',
                flex: 1,
                minWidth: 140,
                valueGetter: (params) =>
                    params.row?.lotName || params.row?.lot || '',
            },
            {
                field: 'hectareas',
                headerName: t('hectares') || 'Has',
                flex: 0.6,
                minWidth: 90,
                type: 'number',
                valueGetter: (params) => {
                    const v = params.row?.hectareas;
                    if (typeof v === 'number') return v;
                    const parsed = Number(params.row?.hectares);
                    return Number.isFinite(parsed) ? parsed : 0;
                },
                valueFormatter: ({ value }) =>
                    typeof value === 'number' ? value.toFixed(2) : '0,00',
            },
            {
                field: 'cropName',
                headerName: t('crop') || 'Cultivo',
                flex: 0.8,
                minWidth: 110,
            },
            {
                field: 'actions',
                headerName: '',
                width: 160,
                sortable: false,
                renderCell: (params) => {
                    const row = params.row as CampaingExpenses;
                    const closed = isCampaignExpenseClosed(row);
                    return (
                        <Box display="flex" gap={0.5}>
                            <Tooltip title={t('view') || 'Ver'}>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() =>
                                        navigate(`/init/overview/campaign-expenses/view/${row._id}`)
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
                                            navigate(`/init/overview/campaign-expenses/edit/${row._id}`)
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
                                        onClick={() => handleDelete(row._id || '', row._rev || '')}
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
        [handleDelete, navigate, t],
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
            editItemPath={(id) => `/init/overview/campaign-expenses/edit/${id}`}
            isLoading={isLoading}
            showAddButton
            moduleRoute="init/overview/campaign-expenses"
        />
    );
};

export default ListCampaignExpensesPage;
