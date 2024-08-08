import React from "react";
import { LocalShipping as LocalShippingIcon } from "@mui/icons-material";
import { useVehicle } from "../hooks";
import { setVehiculoActivo } from "../redux/vehicle";
import { GenericListPage } from "./GenericListPage";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

export const ListVehiclesPage: React.FC = () => {
  const { vehicles, getVehicles, deleteVehicle } = useVehicle();
  const navigate = useNavigate();
  const columns = [
    { field: "vehicleType", headerName: "Vehicle Type", flex: 1 },
    { field: "make", headerName: "Brand", flex: 1 },
    { field: "model", headerName: "Model", flex: 1 },
    { field: "patent", headerName: "Patent", flex: 1 },
    { field: "modelYear", headerName: "Year", flex: 1 },
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
      title="Vehicles"
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
