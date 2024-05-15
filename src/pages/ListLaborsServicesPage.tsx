import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loading,
  TemplateLayout,
  DataTable,
  ItemRow,
  TableCellStyled,
  CloseButtonPage,
} from "../components";
import { ColumnProps, LaborsServices } from "../types";
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
import 'semantic-ui-css/semantic.min.css';
import {Icon} from "semantic-ui-react";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Build as  BuildIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, useLaborsServices } from "../hooks";
import { useTranslation } from "react-i18next";
import { setLaborsServicesActive } from "../redux/laborsService";




export const ListLaborsServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
const {t} = useTranslation();
  const { isLoading } = useAppSelector((state) => state.ui);
  const { laborsServices, getLaborsServices,removeLaborsServices } = useLaborsServices();
  const { filterText, handleInputChange } = useForm({ filterText: "" });


  const columns: ColumnProps[] = [
    { text: t("_service"), align: "center" },
    { text: t("description"), align: "center" },
    { text: "", align: "center" }
  ];



  const onClickAddLaborsService = () => navigate("/init/overview/Labors-services/new");

  const handleDeleteLaborsService = (item:LaborsServices) => {
    if (item._id && item._rev) {
        removeLaborsServices (item._id, item._rev);
        getLaborsServices();
    }
  };

  const onClickUpdateLaborsService = (item: LaborsServices): void => {
    dispatch( setLaborsServicesActive(item));
    navigate(`/init/overview/Labors-services/${item._id}`);
  };

  useEffect(() => {
    getLaborsServices();
  }, []);

  function onClickBuscar(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <TemplateLayout key="overview-labors-services" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
        <PersonIcon sx={{ marginRight: '8px' }} />
        <BuildIcon sx={{ marginRight: '8px', fontSize: 'small' }} />
        <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
        {t("service_labors")}
        </Typography>
        </Box>
        <CloseButtonPage />
      </Box>
      <Box component="div" sx={{ mt: 7 }}>
        <Grid
          container
          spacing={0}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2, mt: { sm: 2 } }}
        >
          <Grid item xs={6} sm={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={onClickAddLaborsService}
            >
              {t("add_new")}
            </Button>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Grid container justifyContent="flex-end">
              <Grid item xs={8} sm={7}>
                <TextField
                  variant="outlined"
                  type="text"
                  size="small"
                  placeholder={t("labors_service")}
                  autoComplete="off"
                  name="filterText"
                  value={filterText}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4} sm={3}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  fullWidth
                  sx={{
                    height: "98%",
                    margin: "auto",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  onClick={() => onClickBuscar()}
                  startIcon={<SearchIcon />}
                >
                  {t("icon_search")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 1 }}>
          <DataTable
            key="datatable-labors-services"
            columns={columns}
            isLoading={isLoading}
          >
            {laborsServices.map((row) => (
              <ItemRow>
                <TableCellStyled align="center">{row.service} </TableCellStyled>
                <TableCellStyled align="center">{row.description}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title={t("icon_edit")}>
                    <IconButton
                      aria-label={t("icon_edit")}
                      onClick={() => onClickUpdateLaborsService(row)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("icon_delete")}>
                  <IconButton onClick={() => handleDeleteLaborsService(row)} style={{ fontSize: '1rem' }}>
                        <Icon name="trash alternate" />
                      </IconButton>
                    </Tooltip>
                </TableCellStyled>
              </ItemRow>
            ))}
          </DataTable>
        </Box>
      </Box>
    </TemplateLayout>
  );
};
