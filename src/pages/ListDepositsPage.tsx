import { useNavigate } from "react-router-dom";
import { ColumnProps, Deposit } from "../types";
import React, { useEffect } from "react";
import { useAppDispatch, useDeposit, useForm } from "../hooks";
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
  Chip,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import { setDepositActive } from "../redux/deposit";

const columns: ColumnProps[] = [
  { text: "Descripcion", align: "left" },
  { text: "Propietario", align: "center" },
  { text: "Fisico/Virtual", align: "left" },
  { text: "Domicilio", align: "center" },
  { text: "Localidad", align: "center" },
  { text: "Pais", align: "center" },
];

export const ListDepositsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isLoading, deposits, getDeposits, setDeposits } = useDeposit();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const onClickSearch = () => {
    if (filterText === "") {
      getDeposits();
      return;
    }
    const filteredDeposits = deposits.filter(({ description: descripcion, owner: propietario }) => {
      (descripcion &&
        descripcion.toLowerCase().includes(filterText.toLowerCase())) ||
        (propietario &&
          propietario.toLowerCase().includes(filterText.toLowerCase()));
    });
    setDeposits(filteredDeposits);
  };

  const onClickUpdateDeposit = (item: Deposit) => {
    navigate(`/init/overview/deposit/${item._id}`);
    dispatch(setDepositActive(item));
  };

  useEffect(() => {
    getDeposits();
  }, []);

  return (
    <TemplateLayout key="overview-deposits" viewMap={false}>
      {isLoading && <Loading loading />}
      <Container maxWidth="md" sx={{ ml: 0 }}>
        <Box
          component="div"
          display="flex"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
          <WarehouseIcon />
          <Typography component="h4" variant="h4" sx={{ ml: { sm: 2 } }}>
            Depositos
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
                onClick={() => navigate("/init/overview/deposit/new")}
              >
                Nuevo
              </Button>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Grid container justifyContent="flex-end">
                <Grid item xs={8} sm={7}>
                  <SearchInput
                    value={filterText}
                    placeholder="Descripcion / Propietario"
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
              key="datatable-deposits"
              columns={columns}
              isLoading={isLoading}
            >
              {deposits.map((row) => (
                <ItemRow key={row._id} hover>
                  <TableCellStyled align="center">
                    {row.description}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.owner}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    <Chip
                      variant={row.isVirtual ? "filled" : "outlined"}
                      label={row.isVirtual ? "Virtual" : "Fisico"}
                    />
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.address}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.locality}
                  </TableCellStyled>
                  <TableCellStyled align="center">{row.country}</TableCellStyled>
                  <TableCellStyled align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        aria-label="Editar"
                        onClick={() => onClickUpdateDeposit(row)}
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
