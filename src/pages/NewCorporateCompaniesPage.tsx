
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
import { useAppDispatch, useForm, useCorporateCompanies, useAppSelector, useBusiness, useCountry } from '../hooks';
import { Loading } from '../components';
import { CorporateCompanies } from '../types';
import { removeCorporateCompaniesActive } from '../redux/corporateCompanies';
import {
  BrokenImage as BrokenImageIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import uuid4 from 'uuid4';
import { uploadFile } from '../helpers/fileUpload';
import { urlImg } from '../config';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { Country } from '../interfaces/country';
import { getLocalityAndStateByZipCode } from '../utils/getDataZipCode';



export interface AddressFormProps {
  countries: Country[];
  countryError: boolean;
  handleFormValueChange: (key: string, value: string) => void;
}

const initialForm: CorporateCompanies = {
  accountId: '',
  licenceId: '',
  countryId: '',
  companyId: '',
  cp: '',
  taxKey: '',
  fantasyName: '',
  location: '',
  state: '',
  photoName: '',
  address: '',
  phoneNumber: '',
  secondaryContact: '',
  web: '',
  observations: '',
  businessName: '',
  pais: '',
  taxSituation: ''
};


export const NewCoporateCompaniesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAppSelector(state => state.auth);
  const { corporateCompaniesActive } = useAppSelector((state) => state.corporateCompanies);
  const { isLoading, createCorporateCompanies, updateCorporateCompanies, corporateCompanies, getCorporateCompanies } = useCorporateCompanies();
  const { getCountries, dataCountry: countries } = useCountry();
  const { businesses, getBusinesses } = useBusiness();
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [_localities, setLocalities] = useState<string[]>([]);
  const countryUser = countries.find(country => country.code === user?.countryId);

  const {
    photoName,
    cp,
    taxKey,
    fantasyName,
    state,
    address,
    location,
    phoneNumber,
    secondaryContact,
    web,
    businessName,
    observations,
    formulario,
    taxSituation,
    setFormulario,
    handleInputChange,
    reset,
  } = useForm<CorporateCompanies>(initialForm);


  useEffect(() => {
    if (corporateCompaniesActive) setFormulario(corporateCompaniesActive);
    else setFormulario(initialForm);
  }, [corporateCompaniesActive, setFormulario]);


  const uploadImgUser = async (fileInput: Blob) => {
    try {
      const newFileName = `${uuid4()}.jpeg`;
      const renamedFile = new File([fileInput], newFileName, { type: fileInput.type });
      const response = await uploadFile(renamedFile);


      if (response)
        setFormulario(({ ...formulario, photoName: newFileName }));
      else
        setFormulario(({ ...formulario, photoName: "" }));

    } catch (error) {
      console.log('error', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) uploadImgUser(file);
  };

  const handleCancel = () => {
    setFormulario(({ ...formulario, photoName: "" }));
  };

  const handleUpdate = () => {

    if (!formulario._id?.trim()) {
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      return;
    }

    updateCorporateCompanies(formulario);
    reset();
  };


  const handleAdd = async () => {
    await createCorporateCompanies(formulario);
    reset();
  };


  const onClickCancel = () => {
    dispatch(removeCorporateCompaniesActive());
    navigate("/init/overview/corporate-companies");
    reset();
  };

  const handleVerifyId = () => {
    const existingBusiness = businesses.find(business => business.cuit === taxKey);
    const taxIdExists = corporateCompanies.find(corporate => corporate.taxKey === taxKey);

    if (taxIdExists) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La Clave tributaria ya existe',
      }).then(() => {
        setFormulario(prevForm => ({
          ...prevForm,
          taxKey: '',
          id: 0
        }));
      });
      return true; // O puedes devolver idExists si deseas mantener consistencia con el retorno
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
            taxKey: existingBusiness.cuit || prevForm.taxKey,
            businessName: existingBusiness.razonSocial || prevForm.businessName,
            fantasyName: existingBusiness.razonSocial || prevForm.fantasyName,
            cp: existingBusiness.cp || prevForm.cp,
            location: existingBusiness.localidad || prevForm.location,
            state: existingBusiness.provincia || prevForm.state,
            address: existingBusiness.domicilio || prevForm.address,
            secondaryContact: existingBusiness.contactoSecundario || prevForm.secondaryContact,
            web: existingBusiness.sitioWeb || prevForm.web,
            photoName: existingBusiness.logoBusiness || prevForm.photoName,
            phoneNumber: existingBusiness.contactoPrincipal || prevForm.phoneNumber,
          }));
        } else {
          setFormulario(prevForm => ({
            ...prevForm,
            id: 0
          }));
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

    if (cp !== "") {

      setLoadingZipCode(true);
      try {
        if (countryUser?.code === "AR") {
          const localityAndStates = await getLocalityAndStateByZipCode("ARG", cp);

          if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality;
            const firstProvince = localityAndStates[0].state;

            setLocalities(localityAndStates.map((x) => x.locality));

            handleInputChange({
              target: {
                name: "location",
                value: firstLocality,
              },
            } as React.ChangeEvent<HTMLInputElement>);

            handleInputChange({
              target: {
                name: "state",
                value: firstProvince,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        } else if (countryUser?.code === "BR") {

          const brazilData = await fetchBrazilZipCode(cp);
          if (brazilData) {

            handleInputChange({
              target: {
                name: "location",
                value: brazilData.localidade || brazilData.logradouro,
              },
            } as React.ChangeEvent<HTMLInputElement>);

            handleInputChange({
              target: {
                name: "state",
                value: brazilData.uf,
              },
            } as React.ChangeEvent<HTMLInputElement>);

            handleInputChange({
              target: {
                name: "domicile",
                value: `${brazilData.logradouro}, ${brazilData.bairro}`,
              },
            } as React.ChangeEvent<HTMLInputElement>);

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
      dispatch(removeCorporateCompaniesActive());
    };
  }, [dispatch]);

  useEffect(() => {
    getBusinesses();
    getCorporateCompanies();
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
        <Typography
          component="h1"
          variant="h4"
          align="left"
          sx={{ mt: 3, mb: 3 }}
        >
          <PeopleIcon
            sx={{ marginRight: "8px", fontSize: "inherit", verticalAlign: "middle" }}
          />
          {t("corporate_companies")}
        </Typography>
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
            {corporateCompaniesActive ? t("icon_edit") : t("new_famale")} {' '} {t("corporate_companies")}
          </Typography>
          <Grid container spacing={2} p={2} mt={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label={t("tax_key")}
                type="text"
                name="taxKey"
                value={taxKey}
                onBlur={handleVerifyId}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4.5}>
              <TextField
                label={t("name_negal_name")}
                type="text"
                id="businessName"
                name="businessName"
                value={businessName}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4.5}>
              <TextField
                label={t("fantasy_name")}
                type="text"
                id="fantasyName"
                name="fantasyName"
                value={fantasyName}
                onChange={handleInputChange}
                required
                fullWidth
              />

            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                variant="outlined"
                type="text"
                label={t("postal_code")}
                name="cp"
                value={cp}
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
                name="location"
                value={location}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("_address")}
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={handleInputChange}
                required
                fullWidth
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
                id="state"
                name="state"
                value={state}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("_phone")}
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Situacion Fiscal"
                type="text"
                id="taxSituation"
                name="taxSituation"
                value={taxSituation}
                onChange={handleInputChange}
                required
                fullWidth
              />

            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t("secondary_contact")}
                type="text"
                id="secondaryContact"
                name="secondaryContact"
                value={secondaryContact}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={1} md={4}>
              <TextField
                label="Web"
                type="text"
                id="web"
                name="web"
                value={web}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={1} md={8}>
              <TextField
                label={t("_observations")}
                type="text"
                id="observations"
                name="observations"
                value={observations}
                onChange={handleInputChange}
                required
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
                  {photoName ? (
                    <CardMedia
                      key="preview-img"
                      component="img"
                      alt="Vista previa de la imagen"
                      image={`${urlImg}/${photoName}`}
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
                      {photoName && (
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
                corporateCompaniesActive ? handleUpdate : handleAdd
              }
            >
              {!corporateCompaniesActive ? t("_add") : t("id_update")} {' '}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );

};
