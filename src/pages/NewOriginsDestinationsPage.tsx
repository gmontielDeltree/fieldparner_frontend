import React, { useEffect } from "react";
import { Loading } from "../components";
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { 
    ArrowRightAlt as ArrowRightAltIcon,
    AddLocationAlt as AddLocationAltIcon,} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  useForm,
} from "../hooks";
import { OriginDestinations } from "../types";
import { removeOriginsDestinations } from "../redux/originsdestinatons/originDestiantionsSlice";
import { useOriginDestinations } from "../hooks/useOriginDestinations";


const initialForm: OriginDestinations = {
  name: "",
  description: "",
  destino: false,
  procedencia: false,
};

export const NewOriginsDestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { originsDestinationsActive } = useAppSelector((state) => state.ordesti);

  const {
    name,
    description,
    formulario,
    setFormulario,
    handleInputChange,
  } = useForm<OriginDestinations>(initialForm);

  const { isLoading, createOriginDestinations, updateOriginDestinations, conceptoError } =  useOriginDestinations();

  const handleAddOriginDestinations = async () => {
    console.log("Valores del formulario:", formulario);
    await createOriginDestinations(formulario);
  };

  const handleUpdateOriginDestinations = () => {
    if (!formulario._id) return;
    updateOriginDestinations(formulario);
  };

  const onClickCancel = () => {
    dispatch(removeOriginsDestinations());
    navigate("/init/overview/origins-destinations/");
  };

  useEffect(() => {
    if (originsDestinationsActive) setFormulario(originsDestinationsActive);
    else setFormulario(initialForm);
  }, [originsDestinationsActive, setFormulario]);

  useEffect(() => {
    return () => {
      dispatch((removeOriginsDestinations));
    };
  }, [dispatch]);

  return (
    <>
      <Loading key="loading-new-customer" loading={isLoading} />
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Box
          component="div"
          display="flex"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
          
          < AddLocationAltIcon /><ArrowRightAltIcon fontSize='large' /> 
          <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
            Procedencias/Destinos
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{ my: 3, mb: 5 }}
          >
            {originsDestinationsActive ? "Editar" : "Nueva"} Procedencias/Destinos
          </Typography>
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="space-around"
          >
            <Grid item xs={12} sm={6}>
              <TextField
                label="Descripcion"
                variant="outlined"
                type="text"
                name="name"
                value={name}
                onChange={handleInputChange}
                error={conceptoError}
                helperText={conceptoError ? "Este campo es obligatorio" : ""}
                InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Geolocalizacion"
                variant="outlined"
                type="text"
                name="description"
                value={description}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
            <RadioGroup
                row
                name="destinoProcedencia"
                value={formulario.destino ? "destino" : formulario.procedencia ? "procedencia" : ""}
                onChange={(e) => {
                const value = e.target.value;
                setFormulario((prevForm) => ({
                    ...prevForm,
                    destino: value === "destino",
                    procedencia: value === "procedencia",
                }));
                }}
            >
                <FormControlLabel
                value="destino"
                control={<Radio />}
                label="Destino"
                />
                <FormControlLabel
                value="procedencia"
                control={<Radio />}
                label="Procedencia"
                />
            </RadioGroup>
            </Grid>
            <Grid item xs={6}>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="space-around"
            sx={{ mt: { sm: 5 } }}
          >
            <Grid item xs={12} sm={3} key="grid-back">
              <Button onClick={() => onClickCancel()}>Cancelar</Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={
                  originsDestinationsActive ? handleUpdateOriginDestinations: handleAddOriginDestinations
                }
              >
                {!originsDestinationsActive ? "Guardar" : "Actualizar"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};