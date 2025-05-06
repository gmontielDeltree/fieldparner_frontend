import React, { SyntheticEvent, useEffect, useState } from 'react';
import { TextField, Container, Typography, Paper, Grid, Button, Box, FormControl, Autocomplete } from '@mui/material';
import { Loading, TableCorporateContract } from '../../components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useForm, useCorporateContract, useCampaign } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { removeCorporateContractActive } from '../../redux/corporateContract';
import Swal from 'sweetalert2';
import { EnumStatusContract } from '../../interfaces/corporateContract';
import { CorporateContract, CompanyByContract } from '../../interfaces/corporateContract';
import {
  Handshake as HandshakeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material/';

const initialForm: CorporateContract = {
  accountId: '',
  licenceId: '',
  idContract: '',
  description: '',
  status: EnumStatusContract.Inactivo,
  totalCompany: 0,
  campaignId: ''
};

export const NewCorporateContractPage: React.FC = () => {
  // Form validation errors
  const [errors, setErrors] = useState({
    idContract: false,
    description: false,
    companie: false,
    percentageOfParticipation: false,
    activity: false,
  });
  const [listCorporateContract, setlistCorporateContract] = useState<CompanyByContract[]>([]);
  const { corporateContractActive } = useAppSelector((state) => state.corporateContract);
  const {
    isLoading,
    // listCorporateContract,
    createCorporateContract,
    updateCorporateContract,
    getCorporateContract,
    corporateContract,
  } = useCorporateContract();
  const {
    campaigns,
    getCampaigns,
  } = useCampaign();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const statusOptions = Object.values(EnumStatusContract).map(x => x as string);
  const {
    idContract,
    description,
    formulario,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<CorporateContract>(initialForm);


  useEffect(() => {
    getCampaigns();
  }, []);

  // useEffect(() => {
  //   getCampaigns();
  //   const campaign = loadCampaignFromLS();
  //   if (campaign) {
  //     dispatch(setSelectedCampaign(campaign));
  //   }
  // }, []);

  // useEffect(() => {
  //   if (corporateContractActive) setFormulario(corporateContractActive);
  //   else setFormulario(initialForm);
  // }, [corporateContractActive, setFormulario]);

  useEffect(() => {
    getCorporateContract();
  }, []);

  const handleVerifyId = () => {
    const IdContrtactExists = corporateContract.find(corporate => corporate.idContract === idContract);

    if (IdContrtactExists) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('id_contract_exists'),
      }).then(() => {
        setFormulario(prevForm => ({
          ...prevForm,
          idContract: '',
        }));
      });
      return true;
    }

    // Clear the error state if ID is valid
    setErrors(prev => ({ ...prev, idContract: false }));
  };

  const onClickCancel = () => {
    dispatch(removeCorporateContractActive());
    reset();
    navigate("/init/overview/corporate-contract");
  };

  // Validate main form fields before submission
  const validateMainForm = (): boolean => {
    const newErrors = {
      idContract: !formulario.idContract?.trim(),
      description: !formulario.description?.trim(),
      companie: false,
      percentageOfParticipation: false,
      activity: false
    };

    setErrors(prev => ({ ...prev, ...newErrors }));

    return !newErrors.idContract && !newErrors.description;
  };

  const handleAddContract = async () => {
    console.log('form', formulario);
    console.log('compañias del contrato: ', listCorporateContract)
    // if (!validateMainForm()) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: t('error'),
    //     text: t('fill_required_fields'),
    //   });
    //   return;
    // }

    // if (formulario.contractsList.length === 0) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: t('error'),
    //     text: t('add_at_least_one_contract'),
    //   });
    //   return;
    // }

    // await createCorporateContract(formulario);
    // reset();
  };

  const handleUpdate = () => {
    if (!validateMainForm()) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('fill_required_fields'),
      });
      return;
    }

    // if (formulario.contractsList.length === 0) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: t('error'),
    //     text: t('add_at_least_one_contract'),
    //   });
    //   return;
    // }

    updateCorporateContract(formulario);
    reset();
  };

  const handleAddCompany = (item: CompanyByContract) => {
    console.log(item);
    setlistCorporateContract([item, ...listCorporateContract]);
  };

  const handleDeleteCompany = (contractToDelete: CompanyByContract) => {
    console.log(contractToDelete);
    setlistCorporateContract(prevList => prevList.filter(contract => contract.id !== contractToDelete.id));
  };


  const onChangeStatus = (_event: SyntheticEvent, value: string | null) => {
    if (value !== null) {
      const statusEnum = value as EnumStatusContract;

      setFormulario(prevState => ({
        ...prevState,
        status: statusEnum
      }));

      //   setNewContract(prevState => ({
      //     ...prevState,
      //     status: statusEnum
      //   }));
    }
  };

  // Custom input handler to validate main form fields
  const handleMainInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(event);

    const { name, value } = event.target;
    if (value.trim()) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };


  return (
    <>
      <Loading key="loading-users" loading={isLoading} />
      <Container
        // maxWidth="md"
        sx={{
          mt: 4,
          p: { sm: 1, md: 1 },
          mb: 1,
          ml: 5,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          <DescriptionIcon sx={{ marginRight: "-5px", fontSize: "inherit", verticalAlign: "middle" }} />
          <HandshakeIcon sx={{ marginRight: "28px" }} />
          {t("corporate_contracts")}
        </Typography>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, borderRadius: 3 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label={t("contract_id") + " *"}
                name="idContract"
                value={idContract}
                // onBlur={handleVerifyId}
                onChange={handleMainInputChange}
                error={errors.idContract}
                helperText={errors.idContract ? t("field_required") : ""}
                fullWidth />
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                label={t("_description") + " *"}
                name="description"
                value={description}
                onChange={handleMainInputChange}
                error={errors.description}
                helperText={errors.description ? t("field_required") : ""}
                fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                value={formulario.status}
                onChange={(event, newValue) => onChangeStatus(event, newValue)}
                options={statusOptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} label={t("status")} variant="outlined" />
                )}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                value={campaigns.find(campaign => campaign.campaignId === formulario.campaignId) || null}
                onChange={(_event, newValue) => {
                  setFormulario({
                    ...formulario,
                    campaignId: newValue ? newValue.campaignId : '',
                  });
                }}
                options={campaigns}
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => (
                  <TextField {...params} label={t("campaign")} variant="outlined" />
                )}

              />
            </Grid>
          </Grid>
          <Typography variant="h5" sx={{ mt: 3, mb: 2, pl: 1 }}>
            Compañias del contrato
          </Typography>

          <TableCorporateContract
            listCorporateContract={listCorporateContract}
            onClickAdd={handleAddCompany}
            onClickDelete={handleDeleteCompany}
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