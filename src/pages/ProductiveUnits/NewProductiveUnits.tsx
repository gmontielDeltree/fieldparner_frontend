import React, { useEffect, useState } from 'react';
import { TextField, IconButton, Container, Typography, Paper, Tooltip, Grid, Button, Box, FormControl, Autocomplete } from '@mui/material';
import { DataTable, ItemRow, TableCellStyled, Loading } from '../../components';
import { ColumnProps } from '@types';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useForm, useProductiveUnits, useField } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { removeProductiveUnitsActive } from '../../redux/productiveUntis';
import Swal from 'sweetalert2';
import { ProductiveUnits, ListProductiveUnits } from '../../interfaces/productiveUnits';
import {
  setSelectedCampaign,
} from "../../redux/campaign";
import {
  loadCampaignFromLS
} from "../../helpers/persistence";
import {
  Add as AddIcon,
  Map as MapIcon,
  LocationOn as LocationOnIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material/';

const initialForm: ProductiveUnits = {
  units: '',
  description: '',
  fieldList: []
};

export const NewProductiveUnits: React.FC = () => {
  const [newFields, setNewFields] = useState<ListProductiveUnits>({
    id: "",
    fieldName: '',
    lotes: "",
    campo_geojson: '',
  });

  const { productiveUnitsActive } = useAppSelector((state) => state.productiveUnits);
  const {
    isLoading,
    listProductiveUnits,
    createProductiveUnits,
    updateProductiveUnits,
    getProductiveUnits,
  } = useProductiveUnits();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { fields, getFields } = useField();

  const companieOptions = fields.map(fields => ({
    nombre: fields.nombre,
    lotes: fields.lotes,
    campo_geojson: fields.campo_geojson
  }));

  const {
    units,
    description,
    formulario,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<ProductiveUnits>(initialForm);

  useEffect(() => {
  }, [listProductiveUnits]);

  useEffect(() => {
    getFields();
    const fieldL = loadCampaignFromLS();
    if (fieldL) {
      dispatch(setSelectedCampaign(fieldL));
    }
  }, []);

  useEffect(() => {
    if (productiveUnitsActive) setFormulario(productiveUnitsActive);
    else setFormulario(initialForm);
  }, [productiveUnitsActive]);

  useEffect(() => {
    return () => {
      dispatch(removeProductiveUnitsActive());
    };
  }, [dispatch]);

  useEffect(() => {
    getProductiveUnits();
  }, []);

  useEffect(() => {
    getFields();
  }, []);

  const onClickCancel = () => {
    dispatch(removeProductiveUnitsActive());
    reset();
    navigate("/init/overview/productive-units");
  };

  const handleAddContract = async () => {
    const newFormData = { ...formulario };

    if (!newFormData.units?.trim() || !newFormData.description?.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('complete_all_fields'),
      });
      return;
    }

    await createProductiveUnits(newFormData);
    reset();
    setFormulario(initialForm);
  };

  const handleUpdate = async () => {
    if (!formulario._id?.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('cannot_update_without_valid_id'),
      });
      return;
    }

    await updateProductiveUnits(formulario);
    reset();
    setFormulario(initialForm);
  };

  const handleAddListContract = () => {
    const newListFields: ListProductiveUnits = {
      id: Date.now().toString(),
      fieldName: newFields.fieldName,
      lotes: newFields.lotes,
      campo_geojson: { properties: { hectareas: newFields.campo_geojson.properties.hectareas } }
    };

    setFormulario((prevForm) => ({
      ...prevForm,
      fieldList: [...prevForm.fieldList, newListFields],
    }));

    setNewFields({
      id: '',
      fieldName: '',
      lotes: '',
      campo_geojson: '',
    });
  };

  const onChangeCompanie = (
    _event: React.SyntheticEvent,
    value: { nombre: string, lotes: string, campo_geojson: string } | null
  ) => {
    setNewFields(prevState => ({
      ...prevState,
      fieldName: value ? value.nombre : '',
      lotes: value ? value.lotes : '',
      campo_geojson: value ? value.campo_geojson : '',
    }));
  };

  const handleDeleteListFields = (fieldToDelete: ListProductiveUnits) => {
    const updatedFieldsList = formulario.fieldList.filter(
      (field) => field.id !== fieldToDelete.id
    );

    setFormulario((prevState) => ({
      ...prevState,
      fieldList: updatedFieldsList,
    }));

    Swal.fire({
      icon: 'success',
      title: t('deleted'),
      text: t('field_deleted'),
    });
  };

  const columns: ColumnProps[] = [
    { text: t("field"), align: "center" },
    { text: t("hectares"), align: "center" },
    { text: "", align: "center" },
  ];

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
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <Autocomplete
                  value={companieOptions.find(option => option.nombre === newFields.fieldName) || null}
                  onChange={onChangeCompanie}
                  options={companieOptions}
                  getOptionLabel={(option) => option.nombre || ''}
                  renderInput={(params) => (
                    <TextField {...params} label={t("_fields")} variant="outlined" />
                  )}
                  fullWidth
                />
              </FormControl>
            </Grid>
            < Grid item xs={1} sx={{ textAlign: 'right' }}>
              <Tooltip title={t("_add")}>
                <IconButton onClick={handleAddListContract}>
                  <AddIcon color='primary' />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mt: 4 }}>
            {t("added_fields")}
          </Typography>
          <DataTable key="datatable-contracts" columns={columns} isLoading={false}>
            {formulario.fieldList.map((row) => (
              <ItemRow key={row.id}>
                <TableCellStyled align="center">{row.fieldName}</TableCellStyled>
                <TableCellStyled align="center">
                  {row.campo_geojson?.properties?.hectareas || t('no_data')}
                </TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title={t("icon_delete")}>
                    <IconButton
                      aria-label={t("icon_delete")}
                      color="default"
                      onClick={() => {
                        handleDeleteListFields(row);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCellStyled>
              </ItemRow>
            ))}
          </DataTable>
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
                onClick={productiveUnitsActive ? handleUpdate : handleAddContract}
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