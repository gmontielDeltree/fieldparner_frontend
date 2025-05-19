import React, { useMemo, useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { SyncAlt as SyncAltIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { useStockMovement } from "../../hooks";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "../GenericListPage";
import { IconButton } from "@mui/material";
import { StockMovementItem } from "../../types";
import { DetailStockMovementModal } from "../../components";

export const StockMovementPage: React.FC = () => {
  const { stockMovements, getStockMovements } = useStockMovement();
  const { t } = useTranslation();
  const [selectedMovement, setSelectedMovement] = useState<null | StockMovementItem>(null);
  const [openModal, setOpenModal] = useState(false);

  const onClickDetail = (item: StockMovementItem) => {
    setSelectedMovement(item);
    setOpenModal(true);
  };


  const columns: GridColDef[] = [
    { field: "date", headerName: t("_date"), width: 150, align: "left" },
    { field: "movement", headerName: t("_movement"), headerAlign: 'center', width: 150, align: "left" },
    { field: "supplyOrCrop", headerName: t("type_supply"), headerAlign: 'center', width: 150, align: "left" },
    { field: "deposit", headerName: t("_warehouse"), headerAlign: 'center', width: 150, align: "left" },
    { field: "movementType", headerName: t("movement_type"), headerAlign: 'center', width: 150, align: "left" },
    { field: "isIncome", headerName: t("income_outcome"), width: 150, headerAlign: 'center', align: "left" },
    { field: "um", headerName: "UM", width: 150, headerAlign: 'center', align: "center" },
    { field: "amount", headerName: t("_quantity"), width: 150, headerAlign: 'right', align: "right" },
    { field: "documentFile", headerName: t("_file"), width: 250, headerAlign: 'center', align: "right" },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          aria-label={"Detalle"}
          onClick={() => onClickDetail(params.row)}
          sx={{
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.2)" },
          }}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  const rows = useMemo(() => {
    return stockMovements.map((sm) => {
      const isCrop = !!sm.cropId;
      const supplyOrCrop = isCrop ? `${sm.crop?.descriptionEN || "-"}` : `${sm.supply?.type || "-"} / ${sm.supply?.name || "-"}`;
      return {
        ...sm,
        date: sm.creationDate,
        movement: sm.movement,
        supplyOrCrop,
        deposit: sm.deposit?.description,
        movementType: sm.typeMovement,
        isIncome: sm.isIncome ? t("_income") : t("_outcome"),
        um: sm.supply?.unitMeasurement || "-",
        amount: sm.amount,
        documentFile: sm.documentFile?.originalName
      }
    });
  }, [stockMovements, t]);


  return (
    <>
      <GenericListPage<StockMovementItem>
        title={t("stock_movements")}
        isLoading={false}
        icon={<SyncAltIcon />}
        data={rows}
        columns={columns}
        getData={getStockMovements}
        // setActiveItem={setActiveItem}
        newItemPath="/init/overview/stock-movements/new"
        editItemPath={(id) => `/init/overview/stock-movements/edit/${id}`}
      />
      <DetailStockMovementModal
        open={openModal}
        detail={selectedMovement}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};