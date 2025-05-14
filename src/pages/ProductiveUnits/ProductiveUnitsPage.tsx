import React, { useEffect, useState } from 'react';
import { TextField, Container, Typography, Paper, Grid, Button, Box } from '@mui/material';
import { Loading, TableProductUnits } from '../../components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useForm, useProductiveUnits } from '../../hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { removeProductiveUnitsActive, setProductiveUnitsActive } from '../../redux/productiveUntis';
import { ProductUnits, FieldsByProductUnit } from '../../interfaces/productiveUnits';

import {
  Map as MapIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material/';
import NotificationService from '../../services/notificationService';

const initialForm: ProductUnits = {
  units: '',
  description: '',
  accountId: '',
  licenceId: '',
  idProductiveUnit: ''
};

export const NewProductiveUnits: React.FC = () => {
  const { id: productiveUnitId } = useParams();
  const {
    isLoading,
    createProductiveUnits,
    updateProductiveUnits,
    getProductiveUnitById
  } = useProductiveUnits();
  const { productiveUnitsActive } = useAppSelector((state) => state.productiveUnits);
  const [fieldsByProductUnit, setFieldsByProductUnit] = useState<FieldsByProductUnit[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const {
    units,
    description,
    formulario,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<ProductUnits>(initialForm);

  useEffect(() => {
    if (productiveUnitId) {
      getProductiveUnitById(productiveUnitId).then((result) => {
        if (result) {
          setFormulario(result.productiveUnit);
          setFieldsByProductUnit(result.fieldsByProductive);
          dispatch(setProductiveUnitsActive(result.productiveUnit));
        } else {
          setFormulario(initialForm);
        }
      });
    }
  }, [productiveUnitId]);

  useEffect(() => {
    return () => {
      dispatch(removeProductiveUnitsActive());
    };
  }, [dispatch]);


  const onClickCancel = () => {
    dispatch(removeProductiveUnitsActive());
    reset();
    navigate("/init/overview/productive-units");
  };

  const handleCreateProductUnit = async () => {
    await createProductiveUnits(formulario, fieldsByProductUnit);
    navigate('/init/overview/productive-units/');
  };

  const handleUpdateProductUnit = async () => {
    await updateProductiveUnits(formulario, fieldsByProductUnit);
    navigate('/init/overview/productive-units/');
  };

  const handleAddFieldToProducUnit = (item: FieldsByProductUnit) => {
    const fieldExists = fieldsByProductUnit.some((field) => field.fieldId === item.fieldId);

    if (fieldExists) {
      NotificationService.showWarning("No se puede agregar el mismo campo"); //TODO: add translation
      return;
    }

    setFieldsByProductUnit((prevState) => [...prevState, item]);
  }

  const handleDeleteListFields = (item: FieldsByProductUnit) => {
    const updatedFields = fieldsByProductUnit.filter((field) => field.id !== item.id);
    setFieldsByProductUnit(updatedFields);
    NotificationService.showSuccess("Campo eliminado"); //TODO: add translation
  };


  return (
    <>
      <Loading key="loading-users" loading={isLoading} />
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          p: { sm: 1, md: 1 },
          mb: 1,
          ml: 5
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          <MapIcon sx={{ marginRight: "-5px", fontSize: "inherit", verticalAlign: "middle" }} />
          <LocationOnIcon sx={{ marginRight: "28px" }} />
          {t("productive_units")}
        </Typography>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label={t("productive_units")}
                name="units"
                value={units}
                onChange={handleInputChange}
                fullWidth />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label={t("_description")}
                name="description"
                value={description}
                onChange={handleInputChange}
                fullWidth />
            </Grid>
          </Grid>
          <Typography variant="h5" sx={{ mt: 4, mb: 2, pl: 1 }}>
            {t("added_fields")}
          </Typography>
          <TableProductUnits
            listFieldsByProductUnit={fieldsByProductUnit}
            onClickAdd={handleAddFieldToProducUnit}
            onClickDelete={handleDeleteListFields}
          />
          <Grid container spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 25 }}>
              <Button
                variant="contained"
                color="inherit"
                onClick={onClickCancel}
              >
                {t("id_cancel")}
              </Button>
              <Button
                type='submit'
                disabled={
                  (fieldsByProductUnit.length === 0) ||
                  (!units?.trim() || !description?.trim())
                }
                variant="contained"
                color="success"
                onClick={productiveUnitsActive ? handleUpdateProductUnit : handleCreateProductUnit}
              >
                {!productiveUnitsActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Box>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};