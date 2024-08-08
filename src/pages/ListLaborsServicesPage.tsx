import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Icon } from "semantic-ui-react";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Build as BuildIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, useLaborsServices } from "../hooks";
import { useTranslation } from "react-i18next";
import { setLaborsServicesActive } from "../redux/laborsService";
import { LaborsServices } from "../types";
import { GenericListPage } from "./GenericListPage";

export const ListLaborsServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { laborsServices, getLaborsServices, removeLaborsServices } = useLaborsServices();

  useEffect(() => {
    getLaborsServices();
  }, []);

  const columns = [
    { field: "service", headerName: t("_service"), flex: 1 },
    { field: "description", headerName: t("description"), flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => onClickUpdateLaborsService(params.row)}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("icon_delete")}>
            <IconButton
              aria-label={t("icon_delete")}
              onClick={() => handleDeleteLaborsService(params.row)}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
              }}
            >
              <Icon name="trash alternate" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const onClickAddLaborsService = () => navigate("/init/overview/Labors-services/new");

  const handleDeleteLaborsService = (item: LaborsServices) => {
    if (item._id && item._rev) {
      removeLaborsServices(item._id, item._rev);
      getLaborsServices();
    }
  };

  const onClickUpdateLaborsService = (item: LaborsServices): void => {
    dispatch(setLaborsServicesActive(item));
    navigate(`/init/overview/Labors-services/${item._id}`);
  };

  const onClickBuscar = () => {
    // todo
  };

  return (
    <GenericListPage
      title={t("service_labors")}
      icon={
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ marginRight: '8px' }} />
          <BuildIcon sx={{ marginRight: '8px', fontSize: 'small' }} />
        </Box>
      }
      data={laborsServices}
      columns={columns}
      getData={getLaborsServices}
      deleteData={removeLaborsServices}
      setActiveItem={setLaborsServicesActive}
      newItemPath="/init/overview/Labors-services/new"
      editItemPath={(id) => `/init/overview/Labors-services/${id}`}
    />
  );
};
