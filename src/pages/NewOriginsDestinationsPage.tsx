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
  AddLocationAlt as AddLocationAltIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  useForm,
} from "../hooks";
import { OriginDestinations } from "../types";
import { removeOriginsDestinationsActive } from "../redux/originsdestinatons/originDestiantionsSlice";
import { useOriginDestinations } from "../hooks/useOriginDestinations";
import { useTranslation } from "react-i18next";
import { TemplateLayout } from "../components";
import { GeolocationSection } from "../pages/Deposits/componentes/GeolocationSection";
import { getBoundaries } from "../utils/geolocation";

// Update the initialForm to include geolocation object similar to Deposit
const initialForm: OriginDestinations = {
  name: "",
  // Change geolocation from string to object with lat/lng properties
  geolocation: { lng: -35, lat: -34 },
  destino: true,
  procedencia: false,
};

export const NewOriginsDestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { originsDestinationsActive } = useAppSelector((state) => state.ordesti);

  const {
    formulario,
    setFormulario,
    handleInputChange,
  } = useForm<OriginDestinations>(initialForm);

  const { isLoading, createOriginDestinations, updateOriginDestinations, conceptoError } = useOriginDestinations();

  const handleAddOriginDestinations = async () => {
    console.log("Valores del formulario:", formulario);
    await createOriginDestinations(formulario);
  };

  const handleUpdateOriginDestinations = () => {
    if (!formulario._id) return;
    updateOriginDestinations(formulario);
  };

  const onClickCancel = () => {
    dispatch(removeOriginsDestinationsActive());
    navigate("/init/overview/origins-destinations/");
  };

  // Handle location changes from the map
  const handleLocationChange = (newLocation) => {
    setFormulario(prev => ({
      ...prev,
      geolocation: newLocation
    }));
  };

  // Check if we're on the "new" route and reset the form if needed
  useEffect(() => {
    const isNewRoute = location.pathname.endsWith('/new');

    if (isNewRoute) {
      // Clear active item from Redux store
      dispatch(removeOriginsDestinationsActive());
      // Reset form to initial state
      setFormulario(initialForm);
    } else if (originsDestinationsActive) {
      // Convert geolocation string to object if it's coming from active record
      // This is to handle the transition from string to object format
      let updatedActive = { ...originsDestinationsActive };

      // Check if geolocation is a string and convert it to object
      if (typeof updatedActive.geolocation === 'string') {
        try {
          // Try to parse if it's a JSON string
          const geoObject = JSON.parse(updatedActive.geolocation);
          updatedActive.geolocation = geoObject;
        } catch (e) {
          // If it's not a valid JSON string, use default coordinates
          updatedActive.geolocation = { lng: -35, lat: -34 };
        }
      } else if (!updatedActive.geolocation) {
        // If geolocation is undefined or null
        updatedActive.geolocation = { lng: -35, lat: -34 };
      }

      setFormulario(updatedActive);
    }
  }, [location.pathname, dispatch, setFormulario, originsDestinationsActive]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      dispatch(removeOriginsDestinationsActive());
    };
  }, [dispatch]);

  // Validate form before submit
  const validateForm = () => {
    let isValid = true;

    if (formulario.name.trim() === "") {
      // Show error for missing name
      return false;
    }

    // Validate geolocation
    const boundaries = getBoundaries(formulario.country || "AR"); // Default to Argentina if no country specified
    const geo = formulario.geolocation;

    if (
      !geo ||
      typeof geo.lat !== 'number' ||
      typeof geo.lng !== 'number' ||
      geo.lat === -34 ||
      geo.lng === -35
    ) {
      // Show error for invalid geolocation
      return false;
    }

    return isValid;
  };

  return (
    <>
      <Loading key="loading-new-origin-destination" loading={isLoading} />
      <TemplateLayout
        key="overview-origin-destination"
        viewMap={true}
        initialLocation={formulario.geolocation}
        onLocationChange={handleLocationChange}
        formWidth={60} // Same width proportion as DepositPage
      >
        <Box
          component="div"
          display="flex"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
          <AddLocationAltIcon /><ArrowRightAltIcon fontSize='large' />
          <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
            {t("origins_destinations")}
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
            {originsDestinationsActive ? t("icon_edit") : t("new_famale")} {' '}
            {t("origin_destination")}
          </Typography>
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="space-around"
          >
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("_description")}
                variant="outlined"
                type="text"
                name="name"
                value={formulario.name}
                onChange={handleInputChange}
                error={conceptoError}
                helperText={conceptoError ? t("this_field_is_mandatory") : ""}
                InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                fullWidth
              />
            </Grid>

            {/* We no longer need this text field since we're using the map for geolocation */}
            {/* <Grid item xs={6}>
              <TextField
                label={t("_geolocation")}
                variant="outlined"
                type="text"
                name="geolocation"
                value={geolocation}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />,
                }}
                fullWidth
              />
            </Grid> */}

            <Grid item xs={12} sm={6}>
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
                  label={t("_destination")}
                />
                <FormControlLabel
                  value="procedencia"
                  control={<Radio />}
                  label={t("_origin")}
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              {/* Add the Geolocation Section from DepositPage */}
              <GeolocationSection
                formulario={formulario}
                setFormulario={setFormulario}
              />
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
              <Button
                variant="contained"
                color="inherit"
                onClick={() => onClickCancel()}>
                {t("id_cancel")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                color="success"
                onClick={
                  originsDestinationsActive ? handleUpdateOriginDestinations : handleAddOriginDestinations
                }
              >
                {!originsDestinationsActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </TemplateLayout>
    </>
  );
};