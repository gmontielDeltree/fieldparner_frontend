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
import { ColumnProps, PurchaseOrder } from "../types";
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
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, userPurchaseOrder } from "../hooks";
import { useTranslation } from "react-i18next";



export const ListPurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  // const { vehiculos: vehicles } = useAppSelector((state) => state.vehiculo);
  // const { vehicles, getVehicles } = useVehicle();
  const {
    isLoading,
    purchaseOrders,
    getPurchaseOrders } = userPurchaseOrder();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const onClickBuscar = (): void => {
    // const filteredVehiculos = vehicles.filter(
    //   ({ vehicleType: tipoVehiculo, make: marca, model: modelo, patent: patente }) =>
    //     (patente && patente.toLowerCase().includes(filterText.toLowerCase())) ||
    //     (marca && marca.toLowerCase().includes(filterText.toLowerCase())) ||
    //     (modelo && modelo.toLowerCase().includes(filterText.toLowerCase())) ||
    //     (tipoVehiculo &&
    //       tipoVehiculo.toLowerCase().includes(filterText.toLowerCase()))
    // );
    // dispatch(cargarVehiculos(filteredVehiculos));
  };

  const columns: ColumnProps[] = [
    { text: t("_date"), align: "center" },
    { text: t("purchase_order"), align: "center" },
    { text: t("provider"), align: "center" },
    { text: t("total_amount"), align: "right" },
    { text: "", align: "center" },
  ];

  const onClickNewPurchaseOrder = () => navigate("/init/overview/purchase-order/new");

  const onClickUpdatePurchaseOrder = (item: PurchaseOrder): void => {
    // dispatch(setVehiculoActivo(item));
    navigate(`/init/overview/purchase-order/${item._id}`);
  };

  useEffect(() => {
    getPurchaseOrders();
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
          <Icon name="list alternate outline" size="large" />
          <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
            {t("purchase_order")}
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
              onClick={onClickNewPurchaseOrder}
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
                  placeholder={"OC"}
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
            key="datatable-purchase-orders"
            columns={columns}
            isLoading={isLoading}
          >
            {purchaseOrders.map((row) => (
              <ItemRow>
                <TableCellStyled align="center">
                  {row.creationDate}
                </TableCellStyled>
                <TableCellStyled align="center">{row.nroOrder} </TableCellStyled>
                <TableCellStyled align="center">{row.businessName}</TableCellStyled>
                <TableCellStyled>{row.totalValue}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title={t("icon_edit")}>
                    <IconButton
                      aria-label={t("icon_edit")}
                      onClick={() => onClickUpdatePurchaseOrder(row)}
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
