// ListVehiclesPage.tsx
import React from "react";
import { LocalShipping as LocalShippingIcon } from "@mui/icons-material";
import { useVehicle } from "../../hooks";
import { setVehiculoActivo } from "../../redux/vehicle";
import { GenericListPage } from "../GenericListPage";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ListVehiclesPage: React.FC = () => {
  const { vehicles, getVehicles, deleteVehicle } = useVehicle();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const columns = [
    { field: "vehicleType", headerName: t("vehicle_type"), flex: 1 },
    { field: "make", headerName: t("brand"), flex: 1 },
    { field: "model", headerName: t("_model"), flex: 1 },
    { field: "patent", headerName: t("_patent"), flex: 1 },
    { field: "modelYear", headerName: t("_year"), flex: 1 },
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
                setVehiculoActivo(params.row);
                navigate(`/init/overview/vehicle/${params.row._id}`);
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
              onClick={() => deleteVehicle(params.row._id, params.row._rev)}
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
      isLoading={false}
      title={t("_vehicles")}
      icon={<LocalShippingIcon sx={{ fontSize: 40, color: "#424242" }} />}
      data={vehicles}
      columns={columns}
      getData={getVehicles}
      deleteData={deleteVehicle}
      setActiveItem={setVehiculoActivo}
      newItemPath="/init/overview/vehicle/new"
      editItemPath={(id) => `/init/overview/vehicle/${id}`}
    />
  );
};