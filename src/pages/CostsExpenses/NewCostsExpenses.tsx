import React, { useEffect, useState } from 'react';
import { TextField, Container, Typography, Paper, Grid, Button, Box } from '@mui/material';
import { TemplateLayout } from '../../components';

import { useTranslation } from 'react-i18next';
import { useAppDispatch, useForm, useCostsExpensess, useAppSelector, } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { removeCostsExpensesActive } from '../../redux/costsExpenses';
import Swal from 'sweetalert2';
import { CostsExpenses } from '../../interfaces/costsExpenses';

const initialForm: CostsExpenses = {
  costCode: '',
  costCenter: '',
  description: ''
};

export const NewCostsExpenses: React.FC = () => {


  const { costsExpensesActive } = useAppSelector((state) => state.costsExpenes);
  const [error, setError] = useState<string>('');
  const { isLoading,
    createCostsExpenses,
    updateCostsExpenses,
    getCostsExpenses,
    costsExpenses,
  } = useCostsExpensess();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();



  const {
    costCode,
    costCenter,
    description,
    formulario,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<CostsExpenses>(initialForm);

  useEffect(() => {
    if (costsExpensesActive) {
      setFormulario({
        ...costsExpensesActive
      });
    }
  }, [costsExpensesActive]);

  useEffect(() => {
    return () => {
      dispatch(removeCostsExpensesActive());
    };
  }, [dispatch]);


  useEffect(() => {
    getCostsExpenses();
  }, []);

  // useEffect(() => {
  //   getFields ();

  // }, []);

  const handleVerifyCostCode = () => {
    const IdContrtactExists = costsExpenses.find(costs => costs.costCode === costCode);

    if (IdContrtactExists) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El ID codigo ya existe',
      }).then(() => {
        setFormulario(prevForm => ({
          ...prevForm,
          costCode: '',
        }));
      });
      return true;
    }

  };




  const onClickCancel = () => {
    dispatch(removeCostsExpensesActive());
    reset();
    navigate("/init/overview/costs-expenses");

  };



  const handleAddCostsExpenses = async () => {
    if (!costCode.trim()) {
      setError(t("cost_code_field_error"));
      return;
    }

    setError(''); // Limpia el error si el campo es válido
    const newFormData = { ...formulario };
    await createCostsExpenses(newFormData);
    reset();
    setFormulario(initialForm);
  };

  const handleUpdate = async () => {
    if (!costCode.trim()) {
      setError(t("cost_code_field_error"));
      return;
    }

    if (!formulario._id?.trim()) {
      setError('No se puede actualizar sin un ID válido.');
      return;
    }

    setError(''); // Limpia el error si todo es válido
    await updateCostsExpenses(formulario);
    reset();
    setFormulario(initialForm);
  };




  return (
    <TemplateLayout key="new-cost-expenses" viewMap={false} viewSelector={false}>
      <Container maxWidth="md" sx={{ margin: 0, mb: 1, mt: 3 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography component="h2" align="center" variant="h4" sx={{ ml: { sm: 2 }, mb: 4 }}>
            {!costsExpensesActive ? t("new_costs_expenses") : t("update_costs_expenses")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("cost_code")}
                name="costCode"
                value={costCode}
                onBlur={handleVerifyCostCode}
                onChange={(e) => {
                  handleInputChange(e as React.ChangeEvent<HTMLInputElement>);
                  setError(''); // Limpia el error al escribir
                }}
                fullWidth
                error={!!error} // Indica que hay un error
              />
              {error && (
                <Typography color="error" variant="caption">
                  {error}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("cost_center")}
                name="costCenter"
                value={costCenter}
                //onBlur={handleVerifyId}
                onChange={handleInputChange}
                fullWidth />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label={t("_description")}
                name="description"
                value={description}
                onChange={handleInputChange}
                fullWidth />
            </Grid>
          </Grid>
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
                variant="contained"
                color="success"
                onClick={costsExpensesActive ? handleUpdate : handleAddCostsExpenses}
              >
                {!costsExpensesActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Box>
          </Grid>
        </Paper>
      </Container>
    </TemplateLayout>
  );
};


