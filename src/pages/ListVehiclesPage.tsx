import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loading,
  TemplateLayout,
  DataTable,
  ItemRow,
  TableCellStyled,
} from "../components";
import { ColumnProps, Vehiculo } from "../types";
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
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector } from "../hooks";
import {
  cargarVehiculos,
  getVehiculos,
  setVehiculoActivo,
} from "../redux/vehiculo";

const columns: ColumnProps[] = [
  { text: "Tipo Vehiculo", align: "center" },
  { text: "Marca", align: "center" },
  { text: "Modelo", align: "center" },
  { text: "Patente", align: "left" },
  { text: "Año", align: "center" },
];

export const ListVehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.ui);
  const { vehiculos } = useAppSelector((state) => state.vehiculo);
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const onClickBuscar = (): void => {
    const filteredVehiculos = vehiculos.filter(
      ({ tipoVehiculo, marca, modelo, patente }) =>
        (patente && patente.toLowerCase().includes(filterText.toLowerCase())) ||
        (marca && marca.toLowerCase().includes(filterText.toLowerCase())) ||
        (modelo && modelo.toLowerCase().includes(filterText.toLowerCase())) ||
        (tipoVehiculo &&
          tipoVehiculo.toLowerCase().includes(filterText.toLowerCase()))
    );
    dispatch(cargarVehiculos(filteredVehiculos));
  };

  const onClickAddVehicle = () => navigate("/init/overview/vehiculo/nuevo");

  const onClickUpdateVehicle = (item: Vehiculo): void => {
    dispatch(setVehiculoActivo(item));
    navigate(`/init/overview/vehiculo/${item._id}`);
  };

  useEffect(() => {
    dispatch(getVehiculos());
  }, [dispatch]);

  return (
    <TemplateLayout key="overview-vehicles" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2 }}
      >
        <LocalShippingIcon />
        <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
          Vehiculos
        </Typography>
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
              Nuevo
            </Button>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Grid container justifyContent="flex-end">
              <Grid item xs={8} sm={7}>
                <TextField
                  variant="outlined"
                  type="text"
                  size="small"
                  placeholder="Vehiculo/Marca/Modelo"
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
                  Buscar
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
            {vehiculos.map((row) => (
              <ItemRow>
                <TableCellStyled align="center">
                  {row.tipoVehiculo}
                </TableCellStyled>
                <TableCellStyled align="center">{row.marca} </TableCellStyled>
                <TableCellStyled align="center">{row.modelo}</TableCellStyled>
                <TableCellStyled>{row.patente}</TableCellStyled>
                <TableCellStyled align="center">{row.año}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label="Editar"
                      onClick={() => onClickUpdateVehicle(row)}
                    >
                      <EditIcon />
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
