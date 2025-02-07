import React, { SyntheticEvent, useEffect, useState } from 'react';
import { TextField, IconButton, Container, Typography, Paper, Tooltip, Grid, Button, Box, FormControl, Autocomplete } from '@mui/material';
import { DataTable, ItemRow, TableCellStyled, Loading } from '../../components';
import { ColumnProps } from '@types';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useForm, useCorporateContract, useBusiness, useCampaign } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { removeCorporateContractActive } from '../../redux/corporateContract';
import Swal from 'sweetalert2';
import { EnumStatusContract } from '../../interfaces/corporateContract';
import { CorporateContract, ListCorporateContract } from '../../interfaces/corporateContract';
import {
  setSelectedCampaign,
} from "../../redux/campaign";
import {
  loadCampaignFromLS
} from "../../helpers/persistence";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Handshake as HandshakeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material/';

const initialForm: CorporateContract = {
  idContract: '',
  description: '',
  status: EnumStatusContract.Inactivo,
  contractsList: [],
  totalCompany: 0,
  campaignSelect: ''
};

export const NewCorporateContractPage: React.FC = () => {
  const [newContract, setNewContract] = useState<ListCorporateContract>({
    id: "",
    companie: '',
    percentageOfParticipation: '',
    activity: '',
  });

  //const { selectedCampaign } = useAppSelector((state) => state.campaign);
  const { corporateContractActive } = useAppSelector((state) => state.corporateContract);
  const { isLoading, listCorporateContract,
    createCorporateContract,
    updateCorporateContract,
    getCorporateContract,
    corporateContract,
  } = useCorporateContract();
  const { businesses, getBusinesses } = useBusiness();
  const {
    campaigns,
    getCampaigns,
  } = useCampaign();



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
    formulario,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<CorporateContract>(initialForm);

  useEffect(() => {
  }, [listCorporateContract]);

  useEffect(() => {
    getBusinesses();
  }, []);

  useEffect(() => {
    getCampaigns();
    const campaign = loadCampaignFromLS();
    if (campaign) {
      dispatch(setSelectedCampaign(campaign));
    }
  }, []);

  useEffect(() => {
    if (corporateContractActive) setFormulario(corporateContractActive);
    else setFormulario(initialForm);
  }, [corporateContractActive, setFormulario]);

  useEffect(() => {
    getCorporateContract();
  }, []);

  const handleVerifyId = () => {
    const IdContrtactExists = corporateContract.find(corporate => corporate.idContract === idContract);

    if (IdContrtactExists) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El ID contrato ya existe',
      }).then(() => {
        setFormulario(prevForm => ({
          ...prevForm,
          idContract: '',
        }));
      });
      return true;
    }

  };


  const onChangeCompanie = (_event: React.SyntheticEvent, value: { cuit: string; label: string } | null) => {
    setNewContract(prevState => ({
      ...prevState,
      companie: value ? value.label : ''
    }));
  };



  const onClickCancel = () => {
    dispatch(removeCorporateContractActive());
    reset();
    navigate("/init/overview/corporate-contract");

  };



  const handleAddContract = async () => {
    await createCorporateContract(formulario);
    reset();
  };

  const handleUpdate = () => {

    if (!formulario.idContract?.trim()) {
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      return;
    }
    updateCorporateContract(formulario);
    reset();
  };



  const handleAddListContract = () => {
    const newListContract: ListCorporateContract = {
      id: Date.now().toString(),
      companie: newContract.companie,
      percentageOfParticipation: newContract.percentageOfParticipation,
      activity: newContract.activity,
    };


    setFormulario((prevState) => ({
      ...prevState,
      contractsList: [...prevState.contractsList, newListContract],
      totalCompany: prevState.contractsList.length + 1,
    }));


    setNewContract({
      id: '',
      companie: '',
      percentageOfParticipation: '',
      activity: '',
    });

    console.log("Nuevo contrato agregado a contractsList:", newListContract);
  };


  // const handleCampaignChange = (event: SelectChangeEvent<unknown>) => {
  //   const selectedCampaignId = event.target.value as string; // Convierte el valor a string

  //   // Actualiza el estado del formulario con la campaña seleccionada
  //   setFormulario({
  //     ...formulario,
  //     campaignSelect: selectedCampaignId // Actualiza campaignSelect
  //   });
  // };


  const handleDeleteListContract = (contractToDelete: ListCorporateContract) => {
    const updatedContractsList = formulario.contractsList.filter(
      (contract) => contract.id !== contractToDelete.id
    );

    setFormulario((prevState) => ({
      ...prevState,
      contractsList: updatedContractsList,
      totalCompany: updatedContractsList.length,
    }));

    Swal.fire('Eliminado', 'El contrato ha sido eliminado exitosamente.', 'success');
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

      const statusEnum = value as EnumStatusContract;


      setFormulario(prevState => ({
        ...prevState,
        status: statusEnum
      }));

      setNewContract(prevState => ({
        ...prevState,
        status: statusEnum
      }));
    }
  };

  const columns: ColumnProps[] = [
    { text: t("_company"), align: "center" },
    { text: t("percentage_of_participation"), align: "center" },
    { text: t("_activity"), align: "center" },
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
          <DescriptionIcon sx={{ marginRight: "-5px", fontSize: "inherit", verticalAlign: "middle" }} />
          <HandshakeIcon sx={{ marginRight: "28px" }} />
          {t("corporate_contracts")}
        </Typography>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Grid container spacing={2}>

            <Grid item xs={12} md={3}>
              <TextField
                label={t("contract_id")}
                name="idContract"
                value={idContract}
                onBlur={handleVerifyId}
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
            <Grid item xs={12} md={1}>
              <FormControl style={{ marginLeft: "50px", minWidth: 200 }}>
                <Autocomplete
                  value={campaigns.find(campaign => campaign.campaignId === formulario.campaignSelect) || null}
                  onChange={(_event, newValue) => {
                    setFormulario({
                      ...formulario,
                      campaignSelect: newValue ? newValue.campaignId : '',
                    });
                  }}
                  options={campaigns}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField {...params} label="Campaña" variant="outlined" />
                  )}
                  style={{ marginLeft: "-10px", minWidth: 200 }}
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
                    <TextField {...params} label={t("_company")} variant="outlined" />
                  )}
                  fullWidth
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("percentage_of_participation")}
                name="percentageOfParticipation"
                value={newContract.percentageOfParticipation}
                onChange={handlePercentageChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("_activity")}
                name="activity"
                value={newContract.activity}
                onChange={handleActivityChange}
                fullWidth />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <Tooltip title={t("_add")}>
                <IconButton onClick={handleAddListContract}>
                  <AddIcon color='primary' />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mt: 4 }}>
            {t("added_contracts")}
          </Typography>
          <DataTable key="datatable-contracts" columns={columns} isLoading={false}>
            {formulario.contractsList.map((row) => (
              <ItemRow key={row.id}>
                <TableCellStyled align="center">{row.companie}</TableCellStyled>
                <TableCellStyled align="center">{row.percentageOfParticipation}</TableCellStyled>
                <TableCellStyled align="center">{row.activity}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title="Eliminar">
                    <IconButton
                      aria-label="Eliminar"
                      color="default"
                      onClick={() => {
                        handleDeleteListContract(row);
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
                onClick={corporateContractActive ? handleUpdate : handleAddContract}
              >
                {!corporateContractActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Box>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};


