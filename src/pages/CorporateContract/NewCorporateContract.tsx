import React, { SyntheticEvent, useEffect, useState } from 'react';
import { TextField, IconButton, Container,  Typography, Paper, Tooltip, Grid, Button, Select, MenuItem, Box, FormControl, InputLabel, SelectChangeEvent, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataTable, ItemRow, TableCellStyled, Loading } from '../../components';
import { CorporateContract, ColumnProps } from '@types';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useForm , useCorporateContract, useBusiness} from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { removeCorporateContractActive } from '../../redux/corporateContract';
import Swal from 'sweetalert2';
import {EnumStatusContract} from '../../types';

const initialForm: CorporateContract = {
  idContract: '',
  description: '',
  status: EnumStatusContract.Inactivo,
  companie: '',
  percentageOfParticipation: '',
  activity: ''
};

export const NewCorporateContractPage: React.FC = () => {
  const [newContract, setNewContract] = useState<CorporateContract>(initialForm);
  const { corporateContractActive } = useAppSelector((state) => state.corporateContract);
  const { isLoading, createCorporateContract, setCorporateContract ,updateCorporateContract,corporateContract, getCorporateContract} = useCorporateContract();
  const {businesses, getBusinesses} = useBusiness();



  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const statusOptions = Object.values(EnumStatusContract).map(x => x as string);

  const companieOptions = businesses.map(business => ({
    cuit: business.cuit,
    label: business.razonSocial
  }));


  const {
    idContract,
    description,
    //status,
    companie,
    percentageOfParticipation,
    activity,
    formulario,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<CorporateContract >(initialForm);

  useEffect(() => {
    getBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCorporateContract();
  }, []);

  useEffect(() => {
    if (corporateContractActive) setFormulario(corporateContractActive);
    else setFormulario(initialForm);
  }, [corporateContractActive, setFormulario]);

 
 
 

  const onChangeCompanie = (event: React.SyntheticEvent, value: { cuit: string; label: string } | null) => {
    setNewContract(prevState => ({
      ...prevState,
      companie: value ? value.label : ''
    }));
  };

  const handleAddContract = () => {
    const newContractWithId: CorporateContract = {
      ...newContract,
      _id: Date.now().toString()
    };
  
    // Agregar el nuevo contrato a la lista
    const updatedContracts = [...corporateContract, newContractWithId];
    setCorporateContract(updatedContracts);
  
    // Resetear el formulario después de agregar
    setNewContract(initialForm);
  };
  



  const onClickCancel = () => {
    dispatch(removeCorporateContractActive ());
    navigate("/init/overview/corporate-contract");
    reset();
  };



  const handleAdd = async () => {
   await createCorporateContract(formulario);
   console.log("Datos Contrato:",formulario)
     reset();
 };

  const handleUpdate = () => {
    
    if (!formulario._id?.trim()) {
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      return;
    }
    updateCorporateContract(formulario);
    reset();
  };

  const handleDeleteContract = (id: string) => {
    setCorporateContract(corporateContract.filter(contract => contract._id !== id));
  };
  const handlePercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNewContract(prevState => ({
      ...prevState,
      percentageOfParticipation: value
    }));
  };

  const handleActivityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNewContract(prevState => ({
      ...prevState,
      activity: value
    }));
  };

  const onChangeStatus = (_event: SyntheticEvent, value: string | null) => {
    if (value !== null) {
      setFormulario(prevState => ({ ...prevState, status: value }));
      setNewContract(prevState => ({ ...prevState, status: value }));
    }
  }

  const columns: ColumnProps[] = [
    { text: "Compañía",  align: "center" },
    { text: "Porcent Participación",  align: "center" },
    { text: "Actividad",  align: "center" },
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
        Contratos Societarios
      </Typography>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="ID Contrato"
              name="idContract"
              value={idContract}
              onChange={handleInputChange}
              fullWidth />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              label="Descripción"
              name="description"
              value={description}
              onChange={handleInputChange}
              fullWidth />
          </Grid>
          <Grid item xs={12} md={2.5}>
          <FormControl fullWidth>
          <Autocomplete
            value={formulario.status}
            onChange={(event, newValue) => onChangeStatus(event, newValue)}
            options={statusOptions}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField {...params} label="Status" variant="outlined" />
            )}
            fullWidth
          />
    </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} md={3}>
          <FormControl fullWidth>
              <Autocomplete
                  value={companieOptions.find(option => option.label === newContract.companie) || null}
                  onChange={onChangeCompanie}
                  options={companieOptions}
                  getOptionLabel={(option) => option.label || ''}
                  renderInput={(params) => (
                    <TextField {...params} label="Compañía" variant="outlined" />
                  )}
                  fullWidth
                />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Porcent Participación"
              name="percentageOfParticipation"
              value={newContract.percentageOfParticipation}
              onChange={handlePercentageChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Actividad"
              name="activity"
              value={newContract.activity}
              onChange={handleActivityChange}
              fullWidth />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right' }}>
            <IconButton onClick={handleAddContract}>
              <AddIcon color='primary' />
            </IconButton>
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ mt: 4 }}>
          Contratos agregados
        </Typography>
        <DataTable
          key="datatable-contracts"
          columns={columns}
          isLoading={false}
        >
          {corporateContract.map((row) => (
            <ItemRow key={row._id}>
              <TableCellStyled align="center">{row.companie}</TableCellStyled>
              <TableCellStyled align="center">{row.percentageOfParticipation}</TableCellStyled>
              <TableCellStyled align="center">{row.activity}</TableCellStyled>
              <TableCellStyled align="center">
                <Tooltip title="Eliminar">
                  <IconButton
                    aria-label="Eliminar"
                    color="default"
                    onClick={() => {
                      if (row._id) {
                        handleDeleteContract(row._id);
                      }
                    } }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCellStyled>
            </ItemRow>
          ))}
        </DataTable>
        <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onClickCancel}>
              {t("id_cancel")}
            </Button>
            <Button
              type='submit'
              variant="contained"
              color="success"
              onClick={corporateContractActive ? handleUpdate : handleAdd}
            >
              {!corporateContractActive ? t("_add") : t("id_update")} {' '}
            </Button>
          </Box>
        </Grid>
      </Paper>
    </Container></>
  );
};


