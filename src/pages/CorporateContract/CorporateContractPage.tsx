import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { TextField, Container, Typography, Paper, Grid, Button, Box, Autocomplete } from '@mui/material';
import { Loading, TableCorporateContract } from '../../components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useForm, useCorporateContract, useCampaign } from '../../hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { removeCorporateContractActive, setCorporateContractActive } from '../../redux/corporateContract';
import { EnumStatusContract } from '../../interfaces/corporateContract';
import { CorporateContract, CompanyByContract } from '../../interfaces/corporateContract';
import {
  Handshake as HandshakeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material/';
import NotificationService from '../../services/notificationService';

const initialForm: CorporateContract = {
  accountId: '',
  licenceId: '',
  idContract: '',
  description: '',
  status: EnumStatusContract.Inactivo,
  totalCompany: 0,
  campaignId: ''
};

export const CorporateContractPage: React.FC = () => {
  const { contractId } = useParams();

  const [errors, setErrors] = useState({
    idContract: false,
    description: false,
  });
  const [companiesFromContract, setCompaniesFromContract] = useState<CompanyByContract[]>([]);
  const { corporateContractActive } = useAppSelector((state) => state.corporateContract);
  const {
    isLoading,
    createCorporateContract,
    updateCorporateContract,
    getCorporateContractById
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

  const totalPercentageCompanies = useMemo(() =>
    companiesFromContract.reduce((suma, item) => suma + Number(item.percentageOfParticipation), 0)
    , [companiesFromContract]);

  useEffect(() => {
    getCampaigns();
  }, []);

  useEffect(() => {
    if (contractId) {
      getCorporateContractById(contractId).then((result) => {
        if (result) {
          setFormulario(result.contract);
          setCompaniesFromContract(result.companies || []);
          dispatch(setCorporateContractActive(result.contract));
        } else {
          setFormulario(initialForm);
        }
      });
    }
  }, [contractId]);

  const handleVerifyId = async () => {
    const contractExists = await getCorporateContractById(idContract);
    if (contractExists) {
      NotificationService.showWarning(t('id_contract_exists'));
      setFormulario(prevForm => ({
        ...prevForm,
        idContract: '',
      }));
      return;
    }
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
    };

    setErrors(prev => ({ ...prev, ...newErrors }));

    return !newErrors.idContract && !newErrors.description;
  };

  const handleAddCorporateContract = async () => {

    if (!validateMainForm()) {
      NotificationService.showError(t('fill_required_fields'));
      return;
    }
    await createCorporateContract(formulario, companiesFromContract);
    navigate('/init/overview/corporate-contract/');
  };

  const handleUpdateCorporateContract = async () => {
    if (!validateMainForm()) {
      NotificationService.showError(t('fill_required_fields'));
      return;
    }
    await updateCorporateContract(formulario, companiesFromContract);
    navigate('/init/overview/corporate-contract/');
    reset();
  };

  const handleAddCompanyToContract = (item: CompanyByContract) => {
    try {
      const existCompany = companiesFromContract.find(company => company.companyId === item.companyId);
      if (existCompany) {
        NotificationService.showWarning("No se puede agregar la misma compañia dos veces");
        return;
      }
      // const totalPercentage = companiesFromContract.reduce((suma, item) => suma + item.percentageOfParticipation, 0);

      if (Number(totalPercentageCompanies) + Number(item.percentageOfParticipation) > 100) {
        NotificationService.showWarning("El porcentaje total de las compañias no puede ser mayor a 100%", null);
        return;
      }

      setCompaniesFromContract([item, ...companiesFromContract]);
    } catch (error) {
      NotificationService.showError(t("databaseError", { error: error || t("unexpectedError") }), error, t("error_label"));
    }
  };

  const handleDeleteCompanyFromContract = (contractToDelete: CompanyByContract) => {
    // if(companiesFromContract.length === 1) {}
    setCompaniesFromContract(prevList => prevList.filter(contract => contract.id !== contractToDelete.id));
  };

  const onChangeStatus = (_event: SyntheticEvent, value: string | null) => {
    if (value !== null) {
      const statusEnum = value as EnumStatusContract;
      setFormulario(prevState => ({
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
                disabled={!!corporateContractActive}
                onBlur={() => {
                  !corporateContractActive && handleVerifyId()
                }}
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
          <Typography variant="h4" sx={{ mt: 4, mb: 2, pl: 1 }}>
            Compañias del contrato
          </Typography>

          <TableCorporateContract
            listCorporateContract={companiesFromContract}
            onClickAdd={handleAddCompanyToContract}
            onClickDelete={handleDeleteCompanyFromContract}
          />
          <Typography variant="h6" sx={{ mb: 2, pl: 1 }}>
            Porcentaje total de compañias: {totalPercentageCompanies} %
          </Typography>
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
                disabled={companiesFromContract.length === 0}
                color="success"
                onClick={corporateContractActive ? handleUpdateCorporateContract : handleAddCorporateContract}
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