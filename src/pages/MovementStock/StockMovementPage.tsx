import React, { useMemo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { SyncAlt as SyncAltIcon } from "@mui/icons-material";
import { useStockMovement } from "../../hooks";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "../GenericListPage";

interface StockMovementItem {
  _id: string;
  _rev: string;
  creationDate: string;
  movement: string;
  supply: {
    type: string;
    name: string;
    unitMeasurement: string;
  };
  deposit: {
    description: string;
  };
  typeMovement: string;
  isIncome: boolean;
  amount: number;
  documentFile: string;
}

export const StockMovementPage: React.FC = () => {
  const { stockMovements, getStockMovements } = useStockMovement();
  const { t } = useTranslation();

  const columns: GridColDef[] = [
    { field: "date", headerName: t("_date"), width: 150 },
    { field: "movement", headerName: t("_movement"), width: 120 },
    { field: "supplyOrCrop", headerName: t("type_supply"), width: 150 },
    { field: "deposit", headerName: t("_warehouse"), width: 150 },
    { field: "movementType", headerName: t("movement_type"), width: 150 },
    { field: "isIncome", headerName: t("income_outcome"), width: 120 },
    { field: "um", headerName: "UM", width: 150 },
    { field: "amount", headerName: t("_quantity"), width: 150 },
    { field: "documentFile", headerName: t("_file"), width: 250 },
  ];

  const rows = useMemo(() => {
    return stockMovements.map((sm) => {
      const isCrop = !!sm.cropId;
      const supplyOrCrop = isCrop ? `${sm.crop?.descriptionEN || "-"}` : `${sm.supply?.type || "-"} / ${sm.supply?.name || "-"}`;
      return {
        _id: sm._id,
        _rev: sm._rev,
        date: sm.creationDate,
        movement: sm.movement,
        supplyOrCrop,
        deposit: sm.deposit?.description,
        movementType: sm.typeMovement,
        isIncome: sm.isIncome ? t("_income") : t("_outcome"),
        um: sm.supply?.unitMeasurement || "-",
        amount: sm.amount,
        documentFile: sm.documentFile
      }
    });
  }, [stockMovements, t]);

  const setActiveItem = (item: StockMovementItem) => {
    // todo if needed
  };

  return (
    <GenericListPage<StockMovementItem>
      title={t("stock_movements")}
      isLoading={false}
      icon={<SyncAltIcon />}
      data={rows}
      columns={columns}
      getData={getStockMovements}
      setActiveItem={setActiveItem}
      newItemPath="/init/overview/stock-movements/new"
      editItemPath={(id) => `/init/overview/stock-movements/edit/${id}`}
    />
  );
};