import { useNavigate } from "react-router-dom";
import { ColumnProps, Supply } from "../types";
import React, { useEffect } from "react";
import { useAppDispatch, useForm, useSupply } from "../hooks";
import {
  DataTable,
  ItemRow,
  Loading,
  SearchButton,
  SearchInput,
  TableCellStyled,
  TemplateLayout,
  CloseButtonPage
} from "../components";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography
} from "@mui/material";
import "semantic-ui-css/semantic.min.css";
import { Icon } from "semantic-ui-react";
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { setSupplyActive } from "../redux/supply";
import { useTranslation } from "react-i18next";

export const ListSuppliesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { isLoading, supplies, getSupplies, setSupplies, deleteSupply } =
    useSupply();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const columns: ColumnProps[] = [
    { text: t("_type"), align: "left" },
    { text: t("_supply"), align: "center" },
    { text: t("unit_of_measure"), align: "center" },
    { text: "", align: "center" }
    // { text: "Stock Reservado", align: "center" },
    // { text: "Stock Disponible", align: "center" },
  ];

  const onClickSearch = () => {
    if (filterText === "") {
      getSupplies();
      return;
    }
    const filteredSupplies = supplies.filter(
      ({ name: insumo, description: descripcion }) => {
        (insumo && insumo.toLowerCase().includes(filterText.toLowerCase())) ||
          (descripcion &&
            descripcion.toLowerCase().includes(filterText.toLowerCase()));
      }
    );
    setSupplies(filteredSupplies);
  };
  const onClickUpdateSupply = (item: Supply) => {
    navigate(`/init/overview/supply/${item._id}`);
    dispatch(setSupplyActive(item));
  };
  const handleDeleteSupply = (item: Supply) => {
    if (item._id && item._rev) {
      deleteSupply(item._id, item._rev);
      getSupplies();
    }
  };

  useEffect(() => {
    getSupplies();
  }, []);

  return (
    <TemplateLayout key="overview-supplies" viewMap={false}>
      {isLoading && <Loading loading />}
      <Container maxWidth="md" sx={{ ml: 0 }}>
        <Box
          component="div"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
        >
          <Box display="flex" alignItems="center">
            <InventoryIcon sx={{ marginRight: "8px" }} />
            <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
              {t("_supplies")}
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
                onClick={() => navigate("/init/overview/supply/new")}
              >
                {t("new_masculine")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Grid container justifyContent="flex-end">
                <Grid item xs={8} sm={7}>
                  <SearchInput
                    value={filterText}
                    placeholder={t("supply_description")}
                    handleInputChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <SearchButton
                    text={t("icon_search")}
                    onClick={() => onClickSearch()}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box component="div" sx={{ p: 1 }}>
            <DataTable
              key="datatable-supplies"
              columns={columns}
              isLoading={isLoading}
            >
              {supplies.map((row) => (
                <ItemRow key={row._id} hover>
                  <TableCellStyled align="left">{row.type}</TableCellStyled>
                  <TableCellStyled align="center">{row.name}</TableCellStyled>
                  <TableCellStyled align="center">
                    {row.unitMeasurement}
                  </TableCellStyled>
                  {/* <TableCellStyled align="center">
                    {row.stockActual}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.stockReservado}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.stockDisponible}
                  </TableCellStyled> */}
                  <TableCellStyled align="center">
                    <Tooltip title={t("icon_edit")}>
                      <IconButton
                        aria-label={t("icon_edit")}
                        disabled={row.generico}
                        onClick={() => onClickUpdateSupply(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("icon_delete")}>
                      <IconButton
                        onClick={() => handleDeleteSupply(row)}
                        disabled={row.generico}
                        style={{ fontSize: "1rem" }}
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
      </Container>
    </TemplateLayout>
  );
};
