import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockMovement } from '../hooks';
import { useTranslation } from 'react-i18next';
import { GenericListPage } from '../components';


interface RowStockMovementItem {
  _id: string;
  _rev: string;
  date: string;
  movement: string;
  supply: string;
  deposit: string;
  movementType: string;
  isIncome: string;
  um: string;
  amount: number;
}

export const StockMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    stockMovements,
    getStockMovements,
    deleteStockMovement,
    setActiveStockMovement,
  } = useStockMovement();
  const { t } = useTranslation();

  const columns = [
    { field: 'date', headerName: t('_date'), width: 150 },
    { field: 'movement', headerName: t('_movement'), width: 120 },
    { field: 'supply', headerName: t('type_supply'), width: 200 },
    { field: 'deposit', headerName: t('_warehouse'), width: 200 },
    { field: 'movementType', headerName: t('movement_type'), width: 150 },
    { field: 'isIncome', headerName: t('income_outcome'), width: 120 },
    { field: 'um', headerName: 'UM', width: 150 },
    { field: 'amount', headerName: t('_quantity'), width: 150 },
  ];

  const data = stockMovements.map(sm => ({
    _id: sm._id,
    _rev: sm._rev,
    date: sm.creationDate,
    movement: sm.movement,
    supply: `${sm.supply?.type}/${sm.supply?.name}`,
    deposit: sm.deposit?.description,
    movementType: sm.typeMovement,
    isIncome: sm.isIncome ? t('_income') : t('_outcome'),
    um: sm.supply?.unitMeasurement,
    amount: sm.amount,
  }));

  useEffect(() => {
    getStockMovements();
  }, [getStockMovements]);

  return (
    <GenericListPage<RowStockMovementItem>
      moduleRoute='/init/overview/stock-movements'
      data={data}
      columns={columns}
      getData={getStockMovements}
      deleteData={deleteStockMovement}
      setActiveItem={setActiveStockMovement}
      newItemPath='/init/overview/stock-movements/new'
      editItemPath={(id: string) => `/init/overview/stock-movements/${id}/edit`}
    />
  );
};
