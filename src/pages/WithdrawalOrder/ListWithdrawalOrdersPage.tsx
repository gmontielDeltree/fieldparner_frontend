import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useOrder } from '../../hooks';
import { IconButton } from '@mui/material';
import {
  PendingActions as PendingActionsIcon,
  CheckCircle as CheckCircleIcon,
  MoreHoriz as MoreHorizIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { DisplayModals, OrderStatus, WithdrawalOrderItem } from '../../types';
import { setWithdrawalOrderActive } from '../../redux/withdrawalOrder';
import { useTranslation } from 'react-i18next';
import { uiOpenModal } from '../../redux/ui';
import { HistoryWithdrawOrderModal, GenericListPage } from '../../components';

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
  };

  const onClickHistory = (row: WithdrawalOrderItem) => {
    console.log('row selected', row);
    dispatch(setWithdrawalOrderActive(row));
    dispatch(uiOpenModal(DisplayModals.HistoryWithdrawOrder));
    // navigate(`/init/overview/order/${row.order}/history`);
  };

   //TODO: Zafra, Cultivo ?"
   
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'order', headerName: "Nro", width: 120 },
      { field: 'type', headerName: t('type'), width: 120 },
      { field: 'creationDate', headerName: t('date'), width: 150 },
      {
        field: 'campaign',
        headerName: t('_campaign'),
        width: 150,
        valueGetter: params => params.row.campaign.name,
      },
      { field: 'labor', headerName: t('labor'), width: 200 },
      {
        field: 'withdraw',
        headerName: t('withdrawal_fem'),
        width: 150,
        valueGetter: params =>
          params.row.withdraw?.nombreCompleto || params.row.withdraw?.razonSocial,
      },
      {
        field: 'state',
        headerName: t('status'),
        width: 120,
        renderCell: params => (
          <IconButton onClick={() => onClickStatus(params.row)}>
            {params.row.state === OrderStatus.Completed ? (
              <CheckCircleIcon color='success' fontSize='medium' />
            ) : params.row.state === OrderStatus.Pending ? (
              <PendingActionsIcon color='warning' fontSize='medium' />
            ) : (
              <MoreHorizIcon color='action' fontSize='medium' />
            )}
          </IconButton>
        ),
      },
      {
        field: 'actions',
        headerName: t('Actions'),
        width: 120,
        renderCell: params => (
          <>
            <IconButton onClick={() => onClickHistory(params.row)} sx={{ fontSize: '1.5rem' }}>
              <HistoryIcon />
            </IconButton>
            {/* <Tooltip title={t('Edit')}>
                        <IconButton onClick={() => onClickEdit(params.row)}>
                            <EditIcon fontSize='medium' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Download')}>
                        <IconButton sx={{ fontSize: '1.5rem' }}>
                            <Icon name="file pdf outline" />
                        </IconButton>
                    </Tooltip> */}
          </>
        ),
      },
    ],
    [t],
  );

  return (
    <>
      <HistoryWithdrawOrderModal key='history-withdrawal-order' />
      <GenericListPage
        moduleRoute='/init/overview/order'
        data={listWithdrawal}
        columns={columns}
        getData={getWithdrawalOrders}
        deleteData={() => {}}
        setActiveItem={() => {}}
        newItemPath='/init/overview/order'
        editItemPath={id => `/init/overview/order/${id}`}
        isLoading={false}
      />
    </>
  );
};
