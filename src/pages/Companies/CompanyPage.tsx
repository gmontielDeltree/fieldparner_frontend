
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useForm, useAppSelector, useBusiness, useCountry, useCompany } from '../../hooks';
import { Loading } from '../../components';
import { removeCompanyActive } from '../../redux/companies';
import {
  BrokenImage as BrokenImageIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import uuid4 from 'uuid4';
import { uploadFile } from '../../helpers/fileUpload';
import { urlImg } from '../../config';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { Country } from '../../interfaces/country';
import { getLocalityAndStateByZipCode } from '../../utils/getDataZipCode';
import { Company } from '../../interfaces/company';
import { CountryCode, ItemZipCode } from '../../types';


interface FormErrors {
  trybutaryCode?: string;
  socialReason?: string;
  fantasyName?: string;
  address?: string;
  locality?: string;
  province?: string;
  phone?: string;
}

export interface AddressFormProps {
  countries: Country[];
  countryError: boolean;
  handleFormValueChange: (key: string, value: string) => void;
}

const initialForm: Company = {
  accountId: '',
  licenceId: '',
  country: '',
  companyId: '',
  zipCode: '',
  name: '',
  email: '',
  observation: '',
  province: '',
  trybutaryCode: '',
  fantasyName: '',
  locality: '',
  companyLogo: { originalName: '', uniqueName: '' },
  address: '',
  phone: '',
  secondaryContact: '',
  website: '',
  socialReason: '',
  fiscalSituation: ''
};


export const CompanyPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAppSelector(state => state.auth);
  const { companyActive } = useAppSelector((state) => state.companies);
  const { isLoading, companies, createCompany, updateCompany, getCompanies } = useCompany();
  const { getCountries, dataCountry: countries } = useCountry();
  const { businesses, getBusinesses } = useBusiness();
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [_localities, setLocalities] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const countryUser = countries.find(country => country.code === user?.countryId);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<Company>(initialForm);


  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formulario.trybutaryCode?.trim()) {
      errors.trybutaryCode = t('required_field');
      isValid = false;
    }

    if (!formulario.socialReason?.trim()) {
      errors.socialReason = t('required_field');
      isValid = false;
    }

    if (!formulario.fantasyName?.trim()) {
      errors.fantasyName = t('required_field');
      isValid = false;
    }

    if (!formulario.address?.trim()) {
      errors.address = t('required_field');
      isValid = false;
    }

    if (!formulario.locality?.trim()) {
      errors.locality = t('required_field');
      isValid = false;
    }

    if (!formulario.province?.trim()) {
      errors.province = t('required_field');
      isValid = false;
    }

    if (!formulario.phone?.trim()) {
      errors.phone = t('required_field');
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  useEffect(() => {
    if (companyActive) setFormulario(companyActive);
    else setFormulario(initialForm);
  }, [companyActive]);


  const uploadImgUser = async (fileInput: Blob) => {
    try {
      const originalFileName = fileInput.name;
      const newFileName = `${uuid4()}.jpeg`;
      const renamedFile = new File([fileInput], newFileName, { type: fileInput.type });
      const response = await uploadFile(renamedFile);


      if (response)
        setFormulario(({ ...formulario, companyLogo: { originalName: originalFileName, uniqueName: newFileName } }));
      else
        setFormulario(({ ...formulario, companyLogo: { originalName: "", uniqueName: "" } }));

    } catch (error) {
      console.log('error', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) uploadImgUser(file);
  };

  const handleCancel = () => {
    setFormulario(({ ...formulario, companyLogo: { originalName: "", uniqueName: "" } }));
  };

  const handleUpdate = async () => {
    if (!formulario._id?.trim()) {
      Swal.fire('Error', t('cannot_update_without_valid_id'), 'error');
      return;
    }
    try {
      if (validateForm()) {
        await updateCompany(formulario);
        reset();
        navigate('/init/overview/corporate-companies');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('validation_error'),
        text: t('check_required_fields'),
      });
    }
  };

  const handleAdd = async () => {
    try {
      if (validateForm()) {
        await createCompany(formulario);
        reset();
        navigate('/init/overview/corporate-companies');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('validation_error'),
        text: t('check_required_fields'),
      });
    }

  };

  const onClickCancel = () => {
    dispatch(removeCompanyActive());
    navigate("/init/overview/corporate-companies");
    reset();
  };

  const handleVerifyId = () => {
    // Solo verificamos si el taxKey (CUIT) tiene algún valor
    if (!formulario.trybutaryCode || formulario.trybutaryCode.trim() === '') {
      return false;
    }

    const existingBusiness = businesses.find(business => business.cuit === formulario.trybutaryCode);
    const taxIdExists = companies.find(corporate => corporate.trybutaryCode === formulario.trybutaryCode);

    if (taxIdExists) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La Clave tributaria ya existe',
      }).then(() => {
        setFormulario(prevForm => ({
          ...prevForm,
          trybutaryCode: '',
          // id: 0
        }));
      });
      return true;
    }

    if (existingBusiness) {
      Swal.fire({
        icon: 'question',
        title: 'Cuit ya existe en "Proveedores"',
        text: '¿Desea autocompletar?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          setFormulario(prevForm => ({
            ...prevForm,
            trybutaryCode: existingBusiness.cuit || prevForm.trybutaryCode,
            socialReason: existingBusiness.razonSocial || prevForm.socialReason,
            fantasyName: existingBusiness.razonSocial || prevForm.fantasyName, //TODO: chequear si es correcto
            zipCode: existingBusiness.cp || prevForm.zipCode,
            locality: existingBusiness.localidad || prevForm.locality,
            province: existingBusiness.provincia || prevForm.province,
            address: existingBusiness.domicilio || prevForm.address,
            secondaryContact: existingBusiness.contactoSecundario || prevForm.secondaryContact,
            website: existingBusiness.sitioWeb || prevForm.website,
            companyLogo: prevForm.companyLogo, //existingBusiness.logoBusiness ||
            phone: existingBusiness.contactoPrincipal || prevForm.phone,
          }));
        } else {
          setFormulario({ ...initialForm });
        }
      });
    }

    return !!existingBusiness;
  };

  const fetchBrazilZipCode = async (zipCode: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch Brazil zip code data:", error);
      return null;
    }
  };

  const onBlurZipCode = async () => {

    if (formulario.zipCode !== "") {

      setLoadingZipCode(true);
      try {
        if (countryUser?.code === CountryCode.ARGENTINA) {
          const localityAndStates = await getLocalityAndStateByZipCode(CountryCode.ARGENTINA, formulario.zipCode);

          if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality;
            const firstProvince = localityAndStates[0].state;
            console.log('firstLocality', firstLocality)
            setLocalities(localityAndStates.map((x: ItemZipCode) => x.locality));

            handleInputChange({
              target: {
                name: "locality",
                value: firstLocality,
              },
            } as React.ChangeEvent<HTMLInputElement>);

            handleInputChange({
              target: {
                name: "province",
                value: firstProvince,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        } else if (countryUser?.code === "BR") {

          const brazilData = await fetchBrazilZipCode(formulario.zipCode);
          if (brazilData) {

            handleInputChange({
              target: {
                name: "locality",
                value: brazilData.localidade || brazilData.logradouro,
              },
            } as React.ChangeEvent<HTMLInputElement>);

            handleInputChange({
              target: {
                name: "province",
                value: brazilData.uf,
              },
            } as React.ChangeEvent<HTMLInputElement>);

            // handleInputChange({
            //   target: {
            //     name: "domicile",
            //     value: `${brazilData.logradouro}, ${brazilData.bairro}`,
            //   },
            // } as React.ChangeEvent<HTMLInputElement>);

          }
        }
        setLoadingZipCode(false);
      } catch (error) {
        console.error("Error in onBlurZipCode:", error);
        setLoadingZipCode(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(removeCompanyActive());
    };
  }, [dispatch]);

  useEffect(() => {
    getBusinesses();
    getCompanies();
    getCountries();

  }, []);

  return (
    <>
      <Loading key="loading-business" loading={loadingZipCode} />
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          p: { sm: 1, md: 1 },
          mb: 1,
          ml: 5
        }}
      >
        <Loading key="loading-users" loading={isLoading} />
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
            {companyActive ? t("icon_edit") : t("new_famale")} {' '} {t("corporate_companies")}
          </Typography>
          <Grid container spacing={2} p={2} mt={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label={t("tax_key")}
                type="text"
                name="trybutaryCode"
                value={formulario.trybutaryCode}
                onBlur={handleVerifyId}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!formErrors.trybutaryCode}
                helperText={formErrors.trybutaryCode}
              />
            </Grid>

            <Grid item xs={12} md={4.5}>
              <TextField
                label={t("name_negal_name")}
                type="text"
                id="socialReason"
                name="socialReason"
                value={formulario.socialReason}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!formErrors.socialReason}
                helperText={formErrors.socialReason}
              />
            </Grid>
            <Grid item xs={12} md={4.5}>

              <TextField
                label={t("fantasy_name")}
                type="text"
                id="fantasyName"
                name="fantasyName"
                value={formulario.fantasyName}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!formErrors.fantasyName}
                helperText={formErrors.fantasyName}
              />

            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                variant="outlined"
                type="text"
                label={t("postal_code")}
                name="zipCode"
                value={formulario.zipCode}
                onBlur={onBlurZipCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("_locality")}
                variant="outlined"
                type="text"
                name="locality"
                value={formulario.locality}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />
                }}
                fullWidth
                required
                error={!!formErrors.locality}
                helperText={formErrors.locality}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("_address")}
                type="text"
                id="address"
                name="address"
                value={formulario.address}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!formErrors.address}
                helperText={formErrors.address}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("id_country")}
                type="text"
                value={countryUser ? countryUser.descriptionEN : ''}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("_state")}
                type="text"
                id="province"
                name="province"
                value={formulario.province}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!formErrors.province}
                helperText={formErrors.province}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("_phone")}
                type="text"
                id="phone"
                name="phone"
                value={formulario.phone}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Situacion Fiscal"
                type="text"
                name="fiscalSituation"
                value={formulario.fiscalSituation}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("secondary_contact")}
                type="text"
                id="secondaryContact"
                name="secondaryContact"
                value={formulario.secondaryContact}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={1} md={4}>
              <TextField
                label="Web"
                type="text"
                id="website"
                name="website"
                value={formulario.website}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={1} md={8}>
              <TextField
                label={t("_observations")}
                type="text"
                name="observation"
                value={formulario.observation}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={1} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: 'center', mb: 2 }}>
                <Card sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 200,
                  height: 240,
                  maxWidth: 200,
                  maxHeight: 240
                }}>
                  {formulario.companyLogo?.uniqueName ? (
                    <CardMedia
                      key="preview-img"
                      component="img"
                      alt="Vista previa de la imagen"
                      image={`${urlImg}/${formulario.companyLogo?.uniqueName}`}
                      sx={{
                        maxHeight: 150,
                        maxWidth: 150,
                        objectFit: "cover",
                        borderRadius: "50%"
                      }}
                    />
                  ) : (
                    <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrokenImageIcon fontSize="large" color="disabled" />
                    </Box>
                  )}

                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'right', justifyContent: 'space-around' }}>
                      <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'right', cursor: 'pointer' }}>
                        <PhotoCameraIcon sx={{ mr: 1 }} />
                        <Typography variant="body1" sx={{ p: 0 }}>{t("upload_photo")}</Typography>
                        <input
                          id="file-upload"
                          key="file-user"
                          accept="image/*"
                          name="file"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                      </label>
                      {formulario.companyLogo?.uniqueName && (
                        <IconButton onClick={handleCancel} color="error" sx={{ p: 0, pl: 1 }}>
                          <CancelIcon fontSize="medium" />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="inherit"
              onClick={onClickCancel}>
              {t("id_cancel")}
            </Button>
            <Button
              type='submit'
              variant="contained"
              color="success"
              onClick={
                companyActive ? handleUpdate : handleAdd
              }
            >
              {!companyActive ? t("_add") : t("id_update")} {' '}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );

};
