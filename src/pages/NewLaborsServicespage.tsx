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
import { 
    Build as  BuildIcon,
    Person as PersonIcon,
 } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Loading, TemplateLayout } from "../components";
import { LaborsServices } from "@types";
import { useAppDispatch, useAppSelector, useForm, useLaborsServices } from "../hooks";
import { removeLaborsServicesActive, removeLaborsServices } from "../redux/laborsService";
import { useTranslation } from "react-i18next";


const initialState: LaborsServices = {
    service: "",
    description: ""
};

export const NewLaborsServicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { LaborsServicesActive } = useAppSelector((state) => state.laborsServices);
  
const {t} = useTranslation();
  const {
    service,
    description,
    formulario,
    setFormulario,
    handleInputChange,
  } = useForm(initialState);

  const { isLoading,createLaborsServices, updateLaborsServices, conceptoError } = useLaborsServices();

  const handleAddLaborsServices = async () => {
    console.log("Valores del formulario:", formulario);
    await createLaborsServices(formulario);
  };

  const handleUpdateLaborsServices = () => {
    if (!formulario._id) return;
    updateLaborsServices(formulario);
  };

  const onClickCancel = () => {
    dispatch(removeLaborsServicesActive());
    navigate("/init/overview/Labors-services");
  };

  useEffect(() => {
    if (LaborsServicesActive) setFormulario(LaborsServicesActive);
    else setFormulario(initialState);
  }, [LaborsServicesActive, setFormulario]);

  useEffect(() => {
    return () => {
      dispatch((removeLaborsServices));
    };
  }, [dispatch]);
  

  return (
    <>
    <TemplateLayout key="overview-labors-services" viewMap={true}>
      <Loading key="loading-new-customer" loading={isLoading}  />
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Box
          component="div"
          display="flex"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
          
          <PersonIcon sx={{ marginRight: '8px' }} />
          <BuildIcon sx={{ marginRight: '8px', fontSize: 'small' }} />
        <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
        {t("service_labors")}
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
            { LaborsServicesActive ?  t("icon_edit") : t("new_masculine")} {' '}
            {t("service_labors")}
          </Typography>
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="space-around"
          >
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("_service")}
                variant="outlined"
                type="text"
                name="service"
                value={service}
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
                    LaborsServicesActive ? handleUpdateLaborsServices: handleAddLaborsServices
                }
                >
                {! LaborsServicesActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      </TemplateLayout>
    </>
  );
};