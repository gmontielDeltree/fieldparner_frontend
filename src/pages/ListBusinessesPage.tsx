import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BusinessTable,
  Loading,
  SearchButton,
  SearchInput,
} from "../components";
import { Business, ColumnProps } from "../types";
import { Box, Button, Grid, Typography } from "@mui/material";
import { Add as AddIcon, Business as BusinessIcon } from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, useBusiness } from "../hooks";
import { setBusinessActive } from "../redux/business";

const columns: ColumnProps[] = [
  { text: "Tipo Entidad", align: "left" },
  { text: "Nombre/Razon social", align: "center" },
  { text: "Cuit/Dni", align: "center" },
  { text: "Email", align: "left" },
  { text: "Pais", align: "center" },
];

export const ListBusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.ui);
  const { businesses, getBusinesses, setBusinesses } = useBusiness();
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
    navigate(`/init/overview/business/${item.id}`);
  };

  useEffect(() => {
    getBusinesses();
  }, []);

  return (
    <>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2 }}
      >
        <BusinessIcon />
        <Typography component="h4" variant="h5" sx={{ ml: { sm: 2 } }}>
          Empresas/Personas
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
          <BusinessTable
            key="datatable-businesses"
            isLoading={isLoading}
            columns={columns}
            data={businesses}
            onClickEdit={onClickUpdateBusiness}
          />
        </Box>
      </Box>
    </>
  );
};
