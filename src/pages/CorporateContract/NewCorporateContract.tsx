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

  // Form validation errors
  const [errors, setErrors] = useState({
    idContract: false,
    description: false,
    companie: false,
    percentageOfParticipation: false,
    activity: false,
  });

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

  const onChangeCompanie = (_event: React.SyntheticEvent, value: { cuit: string; label: string } | null) => {
    setNewContract(prevState => ({
      ...prevState,
      companie: value ? value.label : ''
    }));

    // Clear the error state if company is selected
    setErrors(prev => ({ ...prev, companie: false }));
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
    if (!validateMainForm()) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('fill_required_fields'),
      });
      return;
    }

    if (formulario.contractsList.length === 0) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('add_at_least_one_contract'),
      });
      return;
    }

    await createCorporateContract(formulario);
    reset();
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

    if (formulario.contractsList.length === 0) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('add_at_least_one_contract'),
      });
      return;
    }

    updateCorporateContract(formulario);
    reset();
  };

  // Validate contract fields before adding to list
  const validateContractFields = (): boolean => {
    const newErrors = {
      companie: !newContract.companie?.trim(),
      percentageOfParticipation: !newContract.percentageOfParticipation?.trim(),
      activity: !newContract.activity?.trim()
    };

    setErrors(prev => ({ ...prev, ...newErrors }));

    return !newErrors.companie && !newErrors.percentageOfParticipation && !newErrors.activity;
  };

  const handleAddListContract = () => {
    if (!validateContractFields()) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('fill_all_contract_fields'),
      });
      return;
    }

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
  };

  const handleDeleteListContract = (contractToDelete: ListCorporateContract) => {
    const updatedContractsList = formulario.contractsList.filter(
      (contract) => contract.id !== contractToDelete.id
    );

    setFormulario((prevState) => ({
      ...prevState,
      contractsList: updatedContractsList,
      totalCompany: updatedContractsList.length,
    }));

    Swal.fire({
      icon: 'success',
      title: t('deleted'),
      text: t('contract_deleted_successfully'),
    });
  };

  // Accept only numeric values for percentage
  const handlePercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewContract(prevState => ({
        ...prevState,
        percentageOfParticipation: value
      }));

      // Clear error if valid
      setErrors(prev => ({ ...prev, percentageOfParticipation: false }));
    }
  };

  const handleActivityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNewContract(prevState => ({
      ...prevState,
      activity: value
    }));

    // Clear error if has value
    if (value.trim()) {
      setErrors(prev => ({ ...prev, activity: false }));
    }
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

  // Custom input handler to validate main form fields
  const handleMainInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(event);

    const { name, value } = event.target;
    if (value.trim()) {
      setErrors(prev => ({ ...prev, [name]: false }));
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
                label={t("contract_id") + " *"}
                name="idContract"
                value={idContract}
                onBlur={handleVerifyId}
                onChange={handleMainInputChange}
                error={errors.idContract}
                helperText={errors.idContract ? t("field_required") : ""}
                fullWidth />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label={t("_description") + " *"}
                name="description"
                value={description}
                onChange={handleMainInputChange}
                error={errors.description}
                helperText={errors.description ? t("field_required") : ""}
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
                    <TextField {...params} label={t("status")} variant="outlined" />
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
                    <TextField {...params} label={t("campaign")} variant="outlined" />
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
                    <TextField
                      {...params}
                      label={t("_company") + " *"}
                      variant="outlined"
                      error={errors.companie}
                      helperText={errors.companie ? t("field_required") : ""}
                    />
                  )}
                  fullWidth
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("percentage_of_participation") + " *"}
                name="percentageOfParticipation"
                value={newContract.percentageOfParticipation}
                onChange={handlePercentageChange}
                error={errors.percentageOfParticipation}
                helperText={errors.percentageOfParticipation ? t("field_required") : t("numeric_values_only")}
                inputProps={{ inputMode: 'decimal' }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("_activity") + " *"}
                name="activity"
                value={newContract.activity}
                onChange={handleActivityChange}
                error={errors.activity}
                helperText={errors.activity ? t("field_required") : ""}
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
                  <Tooltip title={t("delete")}>
                    <IconButton
                      aria-label={t("delete")}
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