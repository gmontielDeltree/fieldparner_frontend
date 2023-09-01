import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, useBusiness, useForm } from "../hooks";
import { Business, TipoEntidad } from "@types";
import { Loading } from "../components";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";

const initialForm: Business = {
  nombreCompleto: "",
  documento: "",
  telefono: "",
  email: "",
  tipoEntidad: TipoEntidad.FISICA.toString(),
  razonSocial: "",
  cuit: "",
  contactoPrincipal: "",
  contactoSecundario: "",
  sitioWeb: "",
  domicilio: "",
  localidad: "",
  cp: "",
  provincia: "",
  pais: "",
};

export const BusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessActive } = useAppSelector((state) => state.business);
//   const {
//     formulario,
//     setFormulario,
//     handleInputChange,
//     handleSelectChange,
//     reset,
//   } = useForm<Business>(initialForm);
  const { isLoading, createBusiness, updateBusiness } = useBusiness();

  return (
    <>
      <Loading key="loading-new-customer" loading={isLoading} />
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center">
            {businessActive ? "Editar" : "Nuevo"} Empresa/Persona
          </Typography>
          <>
            {/* FormBusiness */}
            <Grid
              container
              spacing={1}
              alignItems="center"
              justifyContent="space-around"
              sx={{ mt: { sm: 5 } }}
            >
             
            </Grid>
          </>
        </Paper>
      </Container>
    </>
  );
};
