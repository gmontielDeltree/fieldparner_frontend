import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { uiCloseModal } from '../../../redux/ui';
import { useForm, useLaborsServices } from '../../../hooks';
import { removeLaborsServicesActive, removeLaborsServices } from '../../../redux/laborsService';
import { useTranslation } from 'react-i18next';
import { LaborsServices } from '../../../types';
import { Loading } from '../../Loading';

const initialState: LaborsServices = {
  service: "",
  description: ""
};

interface LaborsServicesFormModalProps {
  onLaborsServiceCreated?: (laborsService: LaborsServices) => void;
}

export const LaborsServicesFormModal: React.FC<LaborsServicesFormModalProps> = ({ 
  onLaborsServiceCreated 
}) => {
  const dispatch = useAppDispatch();
  const { LaborsServicesActive } = useAppSelector((state) => state.laborsServices);
  const { t } = useTranslation();
  
  const {
    service,
    description,
    formulario,
    setFormulario,
    handleInputChange,
  } = useForm(initialState);

  const { isLoading, createLaborsServices, updateLaborsServices, conceptoError } = useLaborsServices();

  const handleCancel = () => {
    dispatch(uiCloseModal());
    dispatch(removeLaborsServicesActive());
    setFormulario(initialState);
  };

  const handleAddLaborsServices = async () => {
    try {
      console.log("Valores del formulario:", formulario);
      // Indicar que se está creando desde el modal de adición rápida
      const newLaborsService = await createLaborsServices(formulario, true);
      
      if (newLaborsService && onLaborsServiceCreated) {
        onLaborsServiceCreated(newLaborsService);
      }
      
      // Cerrar modal después de crear exitosamente
      dispatch(uiCloseModal());
      setFormulario(initialState);
    } catch (error) {
      console.error('Error creating labors service:', error);
    }
  };

  const handleUpdateLaborsServices = async () => {
    if (!formulario._id) return;
    
    try {
      const updatedLaborsService = await updateLaborsServices(formulario);
      
      if (updatedLaborsService && onLaborsServiceCreated) {
        onLaborsServiceCreated(updatedLaborsService);
      }
      
      // Cerrar modal después de actualizar exitosamente
      dispatch(uiCloseModal());
      setFormulario(initialState);
    } catch (error) {
      console.error('Error updating labors service:', error);
    }
  };

  useEffect(() => {
    if (LaborsServicesActive) {
      setFormulario(LaborsServicesActive);
    } else {
      setFormulario(initialState);
    }
  }, [LaborsServicesActive, setFormulario]);

  useEffect(() => {
    return () => {
      dispatch(removeLaborsServices);
    };
  }, [dispatch]);

  return (
    <>
      <Loading key="loading-new-labors-service" loading={isLoading} />
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Box
          component="div"
          display="flex"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2 }}
        >
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
            {LaborsServicesActive ? t("icon_edit") : t("new_masculine")} {' '}
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
              <Button
                variant="contained"
                color="inherit"
                onClick={handleCancel}
              >
                {t("id_cancel")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                color="success"
                onClick={
                  LaborsServicesActive ? handleUpdateLaborsServices : handleAddLaborsServices
                }
              >
                {!LaborsServicesActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};