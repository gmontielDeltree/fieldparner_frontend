import React, {   useEffect, useState } from 'react';
import { TextField, IconButton, Container,  Typography, Paper, Tooltip, Grid, Button, Box, FormControl,  Autocomplete } from '@mui/material';
import { DataTable, ItemRow, TableCellStyled, Loading } from '../../components';
import {ColumnProps } from '@types';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useForm , useProductiveUnits,  useField} from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { removeProductiveUnitsActive} from '../../redux/productiveUntis';
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
Delete as DeleteIcon, } from '@mui/icons-material/';

const initialForm: ProductiveUnits = {
  units: '',
  description: '',
  fieldList: []
};

export const NewProductiveUnits: React.FC = () => {
  const [newFields, setNewFields] = useState<ListProductiveUnits>({
    id:"",
    fieldName: '',
    lotes:"",
    campo_geojson:'',
  });

  //const { selectedCampaign } = useAppSelector((state) => state.campaign);
  const { productiveUnitsActive} = useAppSelector((state) => state.productiveUnits);
  const { isLoading, listProductiveUnits,
          createProductiveUnits,
          updateProductiveUnits,
          getProductiveUnits, 
          //productiveUnits,
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
    if (fieldL ) {
      dispatch(setSelectedCampaign(fieldL ));
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
    getProductiveUnits ();
  }, []);
 
  useEffect(() => {
    getFields ();
    
  }, []);

  // const handleVerifyId = () => {
  //   const IdContrtactExists = corporateContract.find(corporate => corporate.idContract === idContract);

  //   if (IdContrtactExists) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error',
  //       text: 'El ID contrato ya existe',
  //     }).then(() => {
  //       setFormulario(prevForm => ({
  //         ...prevForm,
  //         idContract: '',
  //       }));
  //     });
  //     return true; 
  //   }
  
  // };
 





  const onClickCancel = () => {
    dispatch(removeProductiveUnitsActive ());
    reset();
    navigate("/init/overview/productive-units");
    
  };



  const handleAddContract = async () => {
    const newFormData = { ...formulario }; // Usa el formulario actual
  
    // Asegúrate de que el formulario tiene datos válidos
    if (!newFormData.units?.trim() || !newFormData.description?.trim()) {
      Swal.fire('Error', 'Por favor, complete todos los campos necesarios.', 'error');
      return;
    }
  
    await createProductiveUnits(newFormData);
    reset(); // Restablece después de la operación
    setFormulario(initialForm); // Asegúrate de que el formulario vuelva a su estado inicial
  };

  const handleUpdate = async () => {
    if (!formulario._id?.trim()) {
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      return;
    }
  
    await updateProductiveUnits(formulario);
    reset(); // Restablece después de la operación
    setFormulario(initialForm); 
  };



  const handleAddListContract = () => {
    const newListFields: ListProductiveUnits = {
      id: Date.now().toString(),
      fieldName: newFields.fieldName,
      lotes: newFields.lotes,
      campo_geojson: { properties: { hectareas: newFields.campo_geojson.properties.hectareas } } // Asegúrate de almacenar solo lo necesario
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
  // Filtramos la lista de campos eliminando el campo que se desea borrar
  const updatedFieldsList = formulario.fieldList.filter(
    (field) => field.id !== fieldToDelete.id
  );

  // Actualizamos el estado con la lista de campos actualizada
  setFormulario((prevState) => ({
    ...prevState,
    fieldList: updatedFieldsList,
  }));

  // Mostramos un mensaje de éxito al usuario
  Swal.fire('Eliminado', 'Campo Eliminado.', 'success');
};


  const columns: ColumnProps[] = [
    { text: "Campo",  align: "center" },
    { text: "Hectareas",  align: "center" },
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
        <MapIcon  sx={{ marginRight: "-5px", fontSize: "inherit", verticalAlign: "middle" }}/>
      <LocationOnIcon sx={{ marginRight: "28px"}}/>
       Unidades Productivas
      </Typography>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Grid container spacing={2}>
        
          <Grid item xs={12} md={3}>
            <TextField
              label="Unidades"
              name="units"
              value={units}
              //onBlur={handleVerifyId}
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
                    <TextField {...params} label="Campos" variant="outlined" />
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
         Campos Agregados
        </Typography>
        <DataTable key="datatable-contracts" columns={columns} isLoading={false}>
            {formulario.fieldList.map((row) => (
              <ItemRow key={row.id}>
                <TableCellStyled align="center">{row.fieldName}</TableCellStyled>
                  <TableCellStyled align="center">
                    {row.campo_geojson?.properties?.hectareas|| 'Sin datos'}
                  </TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title="Eliminar">
                    <IconButton
                      aria-label="Eliminar"
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
                  variant="outlined"
                  color="secondary"
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


