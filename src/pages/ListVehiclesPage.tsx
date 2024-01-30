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
import { ColumnProps, Vehicle } from "../types";
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
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, useVehicle } from "../hooks";
import {
  cargarVehiculos,
  // getVehiculos,
  setVehiculoActivo,
} from "../redux/vehicle";
import { useTranslation } from "react-i18next";



export const ListVehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
const {t} = useTranslation();
  const { isLoading } = useAppSelector((state) => state.ui);
  // const { vehiculos: vehicles } = useAppSelector((state) => state.vehiculo);
  const { vehicles, getVehicles } = useVehicle();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const onClickBuscar = (): void => {
    const filteredVehiculos = vehicles.filter(
      ({ vehicleType: tipoVehiculo, make: marca, model: modelo, patent: patente }) =>
        (patente && patente.toLowerCase().includes(filterText.toLowerCase())) ||
        (marca && marca.toLowerCase().includes(filterText.toLowerCase())) ||
        (modelo && modelo.toLowerCase().includes(filterText.toLowerCase())) ||
        (tipoVehiculo &&
          tipoVehiculo.toLowerCase().includes(filterText.toLowerCase()))
    );
    dispatch(cargarVehiculos(filteredVehiculos));
  };

  const columns: ColumnProps[] = [
    { text: t("vehicle_type"), align: "center" },
    { text: t("_brand"), align: "center" },
    { text: t("_model"), align: "center" },
    { text: t("_patent"), align: "left" },
    { text: t("_year"), align: "center" },
    { text: "", align: "center" }
  ];

  const onClickAddVehicle = () => navigate("/init/overview/vehicle/new");

  const onClickUpdateVehicle = (item: Vehicle): void => {
    dispatch(setVehiculoActivo(item));
    navigate(`/init/overview/vehicle/${item._id}`);
  };

  useEffect(() => {
    // dispatch(getVehiculos());
    getVehicles();
  }, []);

  return (
    <TemplateLayout key="overview-vehicles" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
          <LocalShippingIcon sx={{ marginRight: '8px' }} />
          <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
            {t("_vehicles")}
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
              onClick={onClickAddVehicle}
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
                  placeholder={t("vehicle_brand_model")}
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
            key="datatable-vehicles"
            columns={columns}
            isLoading={isLoading}
          >
            {vehicles.map((row) => (
              <ItemRow>
                <TableCellStyled align="center">
                  {row.vehicleType}
                </TableCellStyled>
                <TableCellStyled align="center">{row.make} </TableCellStyled>
                <TableCellStyled align="center">{row.model}</TableCellStyled>
                <TableCellStyled>{row.patent}</TableCellStyled>
                <TableCellStyled align="center">{row.modelYear}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title={t("icon_edit")}>
                    <IconButton
                      aria-label={t("icon_edit")}
                      onClick={() => onClickUpdateVehicle(row)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("icon_delete")}>
                      <IconButton
                        // onClick={() =>  handleDeleteVehicle (row)}
                        style={{ fontSize: '1rem' }}
                      >
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
