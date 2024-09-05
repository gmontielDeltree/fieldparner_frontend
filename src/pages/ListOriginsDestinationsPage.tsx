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
  AddLocationAlt as AddLocationAltIcon,
  ArrowRightAlt as ArrowRightAltIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, useOriginDestinations } from "../hooks";
import { setOriginsDestinationsActive } from "../redux/originsdestinatons/originDestiantionsSlice";
import { useTranslation } from "react-i18next";
import { OriginDestinations } from "../types";
import { GenericListPage } from "./GenericListPage";

export const ListOriginsDestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.ui);
  const { originsDestinations, getOriginDestinations, removeOriginDestinations, searchOriginDestinations } = useOriginDestinations();
  const { filterText, handleInputChange } = useForm({ filterText: "" });
  const { t } = useTranslation();

  useEffect(() => {
    getOriginDestinations();
  }, []);

  const columns = [
    { field: "type", headerName: t("_type"), flex: 1, renderCell: (params: { row: { destino: any; procedencia: any; }; }) => (
        params.row.destino ? t("destination") : params.row.procedencia ? t("origin") : ''
      ) 
    },
    { field: "name", headerName: t("_description"), flex: 1 },
    { field: "description", headerName: t("_geolocation"), flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: { row: OriginDestinations; }) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => onClickUpdateOriginsDestinations(params.row)}
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
              onClick={() => handleDeleteOriginsDestinations(params.row)}
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

  const onClickAddOriginsDestinations = () => navigate("/init/overview/origins-destinations/new");

  const onClickUpdateOriginsDestinations = (item: OriginDestinations): void => {
    dispatch(setOriginsDestinationsActive(item));
    navigate(`/init/overview/origins-destinations/${item._id}`);
  };

  const handleDeleteOriginsDestinations = (item: OriginDestinations) => {
    if (item._id && item._rev) {
      removeOriginDestinations(item._id, item._rev);
      getOriginDestinations();
    }
  };

  const onClickSearch = () => {
    if (filterText === "") {
      alert(t("please_enter_search_term"));
      return;
    }
    searchOriginDestinations(filterText);
  };

  return (
    <GenericListPage
      title={t("origins_destinations")}
      icon={
        <Box display="flex" alignItems="center">
          <AddLocationAltIcon sx={{ marginRight: '8px' }} />
          <ArrowRightAltIcon fontSize="large" />
        </Box>
      }
      data={originsDestinations}
      columns={columns}
      getData={getOriginDestinations}
      deleteData={removeOriginDestinations}
      setActiveItem={setOriginsDestinationsActive}
      newItemPath="/init/overview/origins-destinations/new"
      editItemPath={(id) => `/init/overview/origins-destinations/${id}`}
    />
  );
};
