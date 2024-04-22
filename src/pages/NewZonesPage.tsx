import React, { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Map as MapIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Loading, TemplateLayout } from "../components";
import { Zones } from "@types";
import { useAppDispatch, useAppSelector, useForm, useZones } from "../hooks";
import { removeZoneActive, removeZones, } from "../redux/zones";
import { useTranslation } from "react-i18next";

const initialState: Zones = {
    zone: "",
    description: ""
};

export const NewZonePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { zoneActive } = useAppSelector((state) => state.zone);
  
const {t} = useTranslation();
  const {
    zone,
    description,
    formulario,
    setFormulario,
    handleInputChange,
  } = useForm(initialState);

  const { isLoading,createZone, updateZone, conceptoError } = useZones();

  const handleAddZone = async () => {
    console.log("Valores del formulario:", formulario);
    await createZone(formulario);
  };

  const handleUpdateZone = () => {
    if (!formulario._id) return;
    updateZone(formulario);
  };

  const onClickCancel = () => {
    dispatch(removeZoneActive());
    navigate("/init/overview/zones");
  };

  useEffect(() => {
    if (zoneActive) setFormulario(zoneActive);
    else setFormulario(initialState);
  }, [zoneActive, setFormulario]);

  useEffect(() => {
    return () => {
      dispatch((removeZones));
    };
  }, [dispatch]);
  

  return (
    <>
    <TemplateLayout key="overview-zones" viewMap={true}>
      <Loading key="loading-new-customer" loading={isLoading}  />
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Box
          component="div"
          display="flex"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
          
          <MapIcon sx={{ marginRight: '8px' }} />
          <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
            {t("_zones")}
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
            { zoneActive ?  t("icon_edit") : t("new_famale")} {' '}
          {t("_zone")}
          </Typography>
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="space-around"
          >
            <Grid item xs={12} sm={6}>
              <TextField
                label="Zona"
                variant="outlined"
                type="text"
                name="zone"
                value={zone}
                onChange={handleInputChange}
                error={conceptoError}
                helperText={conceptoError ? t("this_field_is_mandatory") : ""}
                InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t("description")}
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
              <Button onClick={() => onClickCancel()}>{t("id_cancel")}</Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={
                    zoneActive ? handleUpdateZone: handleAddZone
                }
                >
                {! zoneActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      </TemplateLayout>
    </>
  );
};