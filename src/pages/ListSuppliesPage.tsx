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
} from "../components";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { setSupplyActive } from "../redux/supply";

const columns: ColumnProps[] = [
  { text: "Tipo", align: "left" },
  { text: "Insumo", align: "center" },
  { text: "Un. Medida", align: "center" },
  { text: "Stock Actual", align: "left" },
  { text: "Stock Reservado", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

export const ListSuppliesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isLoading, supplies, getSupplies } = useSupply();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const onClickSearch = () => {};
  const onClickUpdateSupply = (item: Supply) => {
    navigate(`/init/overview/supply/${item._id}`);
    dispatch(setSupplyActive(item));
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
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
          <InventoryIcon />
          <Typography component="h4" variant="h5" sx={{ ml: { sm: 2 } }}>
            Insumos
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
                onClick={() => navigate("/init/overview/supply/new")}
              >
                Nuevo
              </Button>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Grid container justifyContent="flex-end">
                <Grid item xs={8} sm={7}>
                  <SearchInput
                    value={filterText}
                    placeholder="Insumo / descripcion"
                    handleInputChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <SearchButton text="Buscar" onClick={() => onClickSearch()} />
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
                  <TableCellStyled align="center">{row.tipo}</TableCellStyled>
                  <TableCellStyled align="center">{row.insumo}</TableCellStyled>
                  <TableCellStyled align="center">
                    {row.unidadMedida}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.stockActual}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.stockReservado}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.stockDisponible}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        aria-label="Editar"
                        onClick={() => onClickUpdateSupply(row)}
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
      </Container>
    </TemplateLayout>
  );
};
