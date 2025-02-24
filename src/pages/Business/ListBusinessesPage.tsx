import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Icon } from "semantic-ui-react";
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useBusiness } from "../../hooks";
import { setBusinessActive } from "../../redux/business";
import { useTranslation } from "react-i18next";
import { Business, BusinessItem } from "../../interfaces/socialEntity";
import { GenericListPage } from "../GenericListPage";

export const ListBusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, businesses, getBusinesses, deleteBusiness } = useBusiness();

  const { t } = useTranslation();
  useEffect(() => {
    getBusinesses();
  }, []);
  
  useEffect(() => {
    console.log('Businesses data updated:', businesses);
  }, [businesses]);
  const columns = [
    { field: "tipoEntidad", headerName: t("entity_type"), flex: 1 },
    { field: "razonSocial", headerName: t("name_negal_name"), flex: 1 },
    { field: "cuit", headerName: t("tax_id_identification_number"), flex: 1 },
    { field: "email", headerName: t("Email"), flex: 1 },
    { 
      field: "country", 
      headerName: t("id_country"), 
      flex: 1,
      valueGetter: (params) => params.row.country?.descriptionES || '-'
    },
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
              onClick={() => onClickUpdateBusiness(params.row)}
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
              onClick={() => handleDeleteBusiness(params.row)}
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


  const onClickUpdateBusiness = (item: BusinessItem) => {
    const { country, ...rest } = item;
    dispatch(setBusinessActive(rest));
    navigate(`/init/overview/business/${item._id}`);
  };

  const handleDeleteBusiness = (item: Business) => {
    if (item._id && item._rev) {
      deleteBusiness(item._id, item._rev);
      getBusinesses();
    }
  };

  return (
    <GenericListPage
      title={t("social_entities")}
      icon={<BusinessIcon sx={{ fontSize: 40, color: "#424242" }} />}
      data={businesses}
      columns={columns}
      getData={getBusinesses}
      deleteData={deleteBusiness}
      setActiveItem={setBusinessActive}
      newItemPath="/init/overview/business/new"
      editItemPath={(id) => `/init/overview/business/${id}`} isLoading={isLoading}    />
  );
};
