import React from "react";
import { Inventory as InventoryIcon } from "@mui/icons-material";
import { useSupply } from "../../hooks";
import { setSupplyActive } from "../../redux/supply";
import { GenericListPage } from "../GenericListPage";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const ListSuppliesPage: React.FC = () => {
  const { supplies, getSupplies, deleteSupply } = useSupply();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const columns = [
    { field: "type", headerName: t("_type"), flex: 1 },
    { field: "name", headerName:t("_supply"), flex: 1 },
    { field: "unitMeasurement", headerName: t("unit_of_measure"), flex: 1 },
    { field: "currentStock", headerName:  t("current_stock"), flex: 1 },
    { field: "reservedStock", headerName: t("reserved_stock"), flex: 1 },
    { field: "brand", headerName: t("brand"), flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title="Edit">
            <IconButton
              aria-label="Edit"
              onClick={() => {
                setSupplyActive(params.row);
                navigate(`/init/overview/supply/${params.row._id}`);
              }}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              aria-label="Delete"
              onClick={() => deleteSupply(params.row._id, params.row._rev)}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
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
      title={t("_supplies")}
      isLoading={false}
      icon={<InventoryIcon sx={{ fontSize: 40, color: "#424242" }} />}
      data={supplies}
      columns={columns}
      getData={getSupplies}
      deleteData={deleteSupply}
      setActiveItem={setSupplyActive}
      newItemPath="/init/overview/supply/new"
      editItemPath={(id) => `/init/overview/supply/${id}`}
    />
  );
};
