import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useForm, useOrder } from '../hooks';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Edit as EditIcon,
    PendingActions as PendingActionsIcon,
    CheckCircle as CheckCircleIcon,
    MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { OrderStatus, WithdrawalOrder } from '../types';
import { Icon } from 'semantic-ui-react';
import { setWithdrawalOrderActive } from '../redux/withdrawalOrder';
import { GenericListPage } from './GenericListPage';
import { useTranslation } from 'react-i18next';

export const ListWithdrawalOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, orders: listWithdrawal, getWithdrawalOrders } = useOrder();
    const { t } = useTranslation();

    const onClickEdit = (row: WithdrawalOrder) => {
        console.log('row', row)
    }

    const onClickStatus = (row: WithdrawalOrder) => {
        if (row.state !== OrderStatus.Completed) {
            dispatch(setWithdrawalOrderActive(row));
            navigate(`/init/overview/order/${row.order}`);
        }
    }

    const columns: GridColDef[] = useMemo(() => [
        { field: 'type', headerName: t('Type'), width: 120 },
        { field: 'creationDate', headerName: t('Date'), width: 150 },
        { field: 'order', headerName: t('Order'), width: 120 },
        { field: 'reason', headerName: t('Reason'), width: 200 },
        { field: 'withdraw', headerName: t('Withdraws'), width: 150, valueGetter: (params) => params.row.withdraw?.nombreCompleto },
        { field: 'campaign', headerName: t('Campaign'), width: 120, valueGetter: (params) => params.row.campaign.campaignId },
        { 
            field: 'state', 
            headerName: t('Status'), 
            width: 120,
            renderCell: (params) => (
                <IconButton onClick={() => onClickStatus(params.row)}>
                    {params.row.state === OrderStatus.Completed ? (
                        <CheckCircleIcon color='success' fontSize='medium' />
                    ) : params.row.state === OrderStatus.Parcial ? (
                        <PendingActionsIcon color='warning' fontSize='medium' />
                    ) : (
                        <MoreHorizIcon color="action" fontSize='medium' />
                    )}
                </IconButton>
            )
        },
        {
            field: 'actions',
            headerName: t('Actions'),
            width: 150,
            renderCell: (params) => (
                <>
                    <Tooltip title={t('Delete')}>
                        <IconButton sx={{ fontSize: '1.5rem' }}>
                            <Icon name="trash alternate" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Edit')}>
                        <IconButton onClick={() => onClickEdit(params.row)}>
                            <EditIcon fontSize='medium' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Download')}>
                        <IconButton sx={{ fontSize: '1.5rem' }}>
                            <Icon name="file pdf outline" />
                        </IconButton>
                    </Tooltip>
                </>
            )
        }
    ], [t]);

    return (
        <GenericListPage
            title={t('Withdrawal Orders')}
            icon={<AssignmentIcon />}
            data={listWithdrawal}
            columns={columns}
            getData={getWithdrawalOrders}
            deleteData={() => {}} 
            setActiveItem={() => {}} 
            newItemPath="/init/overview/order"
            editItemPath={(id) => `/init/overview/order/${id}`}
            isLoading={isLoading}
        />
    );
}