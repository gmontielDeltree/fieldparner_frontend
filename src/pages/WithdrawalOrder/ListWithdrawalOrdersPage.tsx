import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useOrder } from '../../hooks';
import {
    IconButton,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    PendingActions as PendingActionsIcon,
    CheckCircle as CheckCircleIcon,
    MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { OrderStatus, WithdrawalOrderItem } from '../../types';
import { setWithdrawalOrderActive } from '../../redux/withdrawalOrder';
import { GenericListPage } from '../GenericListPage';
import { useTranslation } from 'react-i18next';

export const ListWithdrawalOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { orders: listWithdrawal, getWithdrawalOrders } = useOrder();
    const { t } = useTranslation();

    // const onClickEdit = (row: WithdrawalOrder) => {
    //     console.log('row', row)
    // }

    const onClickStatus = (row: WithdrawalOrderItem) => {
        if (row.state !== OrderStatus.Completed) {
            dispatch(setWithdrawalOrderActive(row));
            navigate(`/init/overview/order/${row.order}`);
        }
    }

    const columns: GridColDef[] = useMemo(() => [
        { field: 'type', headerName: t('type'), width: 120 },
        { field: 'creationDate', headerName: t('date'), width: 150 },
        { field: 'order', headerName: t('order'), width: 120 },
        { field: 'reason', headerName: t('_reason'), width: 200 },
        { field: 'withdraw', headerName: t('withdrawal_fem'), width: 150, 
            valueGetter: (params) => params.row.withdraw?.nombreCompleto || params.row.withdraw?.razonSocial },
        { field: 'campaign', headerName: t('_campaign'), width: 150, valueGetter: (params) => params.row.campaign.name },
        {
            field: 'state',
            headerName: t('status'),
            width: 120,
            renderCell: (params) => (
                <IconButton onClick={() => onClickStatus(params.row)}>
                    {params.row.state === OrderStatus.Completed ? (
                        <CheckCircleIcon color='success' fontSize='medium' />
                    ) : params.row.state === OrderStatus.Pending ? (
                        <PendingActionsIcon color='warning' fontSize='medium' />
                    ) : (
                        <MoreHorizIcon color="action" fontSize='medium' />
                    )}
                </IconButton>
            )
        },
        // {
        //     field: 'actions',
        //     headerName: t('Actions'),
        //     width: 150,
        //     renderCell: (params) => (
        //         <>
        //             <Tooltip title={t('Delete')}>
        //                 <IconButton sx={{ fontSize: '1.5rem' }}>
        //                     <DeleteIcon />
        //                 </IconButton>
        //             </Tooltip>
        //             <Tooltip title={t('Edit')}>
        //                 <IconButton onClick={() => onClickEdit(params.row)}>
        //                     <EditIcon fontSize='medium' />
        //                 </IconButton>
        //             </Tooltip>
        //             <Tooltip title={t('Download')}>
        //                 <IconButton sx={{ fontSize: '1.5rem' }}>
        //                     <Icon name="file pdf outline" />
        //                 </IconButton>
        //             </Tooltip>
        //         </>
        //     )
        // }
    ], [t]);
    
    return (
        <GenericListPage
            title={t('withdrawal_orders')}
            icon={<AssignmentIcon />}
            data={listWithdrawal}
            columns={columns}
            getData={getWithdrawalOrders}
            deleteData={() => { }}
            setActiveItem={() => { }}
            newItemPath="/init/overview/order"
            editItemPath={(id) => `/init/overview/order/${id}`}
            isLoading={false}
        />
    );
}