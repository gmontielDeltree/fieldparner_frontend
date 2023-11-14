import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TemplateLayout,
  Loading,
  SearchButton,
  SearchInput,
  DataTable,
  ItemRow,
  TableCellStyled,
} from "../components";
import { Business, ColumnProps } from "../types";
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
  Add as AddIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useBusiness } from "../hooks";
import { setBusinessActive } from "../redux/business";

const columns: ColumnProps[] = [
  { text: "Tipo Entidad", align: "left" },
  { text: "Nombre/Razon social", align: "center" },
  { text: "Cuit/Dni", align: "center" },
  { text: "Email", align: "left" },
  { text: "Pais", align: "center" },
  { text: "", align: "center" },
];

export const ListBusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const { isLoading } = useAppSelector((state) => state.ui);
  const { isLoading, businesses, getBusinesses, setBusinesses } = useBusiness();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const onClickSearch = (): void => {
    if (filterText === "") {
      getBusinesses();
      return;
    }
    const filteredBusinesses = businesses.filter(
      ({ razonSocial, nombreCompleto }) =>
        (razonSocial &&
          razonSocial.toLowerCase().includes(filterText.toLowerCase())) ||
        (nombreCompleto &&
          nombreCompleto.toLowerCase().includes(filterText.toLowerCase()))
    );
    setBusinesses(filteredBusinesses);
  };

  const onClickAddBusiness = () => navigate("/init/overview/business/new");

  const onClickUpdateBusiness = (item: Business) => {
    dispatch(setBusinessActive(item));
    navigate(`/init/overview/business/${item._id}`);
  };

  useEffect(() => {
    getBusinesses();
  }, []);

  return (
    <TemplateLayout key="overview-business" viewMap={false}>
      {isLoading && <Loading loading={true} />}
      <Container maxWidth="lg">
        <Box
          component="div"
          display="flex"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
          <BusinessIcon />
          <Typography component="h4" variant="h5" sx={{ ml: { sm: 2 } }}>
            Entidades Sociales
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
                onClick={onClickAddBusiness}
              >
                Nuevo
              </Button>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Grid container justifyContent="flex-end">
                <Grid item xs={8} sm={7}>
                  <SearchInput
                    value={filterText}
                    placeholder="Razon social / Nombre"
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
              key="datatable-business"
              columns={columns}
              isLoading={isLoading}
            >
              {businesses.map((row) => (
                <ItemRow key={row._id} hover>
                  <TableCellStyled align="center">
                    {row.tipoEntidad}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.razonSocial || row.nombreCompleto}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.cuit || row.documento}
                  </TableCellStyled>
                  <TableCellStyled>{row.email}</TableCellStyled>
                  <TableCellStyled align="center">{row.pais}</TableCellStyled>
                  <TableCellStyled align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        aria-label="Editar"
                        onClick={() => onClickUpdateBusiness(row)}
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
