import { getLocalityAndStateByZipCode } from '../services';
import {
  Autocomplete,
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
import { useAppDispatch,  useForm, useCorporateCompanies, useAppSelector ,useBusiness} from '../hooks';
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
import { SyntheticEvent, useEffect, useState } from 'react';
import Swal from 'sweetalert2';




const initialForm: CorporateCompanies = {
  accountId: '',
  countryId: '',
  companyId: '',
  cp: '',
  licenceId: '',
  taxKey: '',
  fantasyName: '',
  location: '',
  state: '',
  photoName: '',
  domicile: '',
  phoneNumber: '',
  secondaryContact: '',
  web: '',
  observations: '',
  businessName: '',
  values: ''
};


export const NewCoporateCompaniesPage = () => {
  const navigate = useNavigate();
  const { isLoading, createCorporateCompanies, updateCorporateCompanies, getCorporateCompanies } = useCorporateCompanies();
  const dispatch = useAppDispatch();
  const {businesses,getBusinesses} = useBusiness();
  //const {users, getUsers} = useUser();
  const { corporateCompaniesActive } = useAppSelector((state) => state.corporateCompanies);
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [locality, setLocality] = useState<string | null>(null);
  const { businessActive } = useAppSelector((state) => state.business);
  const { user } = useAppSelector(state => state.auth);


 


  const {
    photoName,
    values,
    accountId,
    countryId,
    cp,
    licenceId,
    taxKey,
    fantasyName,
    location,
    state,
    domicile,
    phoneNumber,
    secondaryContact,
    web,
    businessName,
    observations,
    formulario,
    setFormulario,
    handleInputChange,
    //handleSelectChange,
    reset,
  } = useForm<CorporateCompanies>(initialForm);

  const {    } = values;

  useEffect(() => {
    getBusinesses();
 }, []);

 useEffect(() => {
  if (businessActive) {
    setFormulario(initialForm);
  } else {
    setFormulario(initialForm);
  }
}, [businessActive, setFormulario]);




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
    if (formulario._id) {
      updateCorporateCompanies(formulario);
      dispatch(removeCorporateCompaniesActive ());
      navigate("/init/overview/corporate-companies");
    }
  };

  const handleAdd = async () => {
    await createCorporateCompanies(formulario);
    navigate("/init/overview/corporate-companies");
    reset();
  };

  const onClickCancel = () => {
    dispatch(removeCorporateCompaniesActive ());
    navigate("/init/overview/corporate-companies");
    // setIsLoading(true);
    reset();
  };



  const handleClick = () => {
    if (user) {
      const { isAdmin, accountId, username, countryId } = user;
      
      console.log("Admin:", isAdmin);
      console.log("Account ID:", accountId);
      console.log("Username:", username);
      console.log("Country ID:", countryId);
    } else {
      console.log("No user data available");
    }
  };

  const handleVerifyId = () => {
    const existingBusiness = businesses.find(business => business.cuit === taxKey);
    
    if (existingBusiness) {
      Swal.fire({
        icon: 'question',
        title: 'Cuit ya existe',
        text: 'El CUIT ya existe, ¿desea autocompletar?',
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
            domicile: existingBusiness.domicilio || prevForm.domicile,
            secondaryContact: existingBusiness.contactoSecundario || prevForm.secondaryContact,
            web: existingBusiness.sitioWeb || prevForm.web,
            photoName: existingBusiness.logoBusiness || prevForm.photoName,
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
        if (countryId === "ARG") {
          const localityAndStates = await getLocalityAndStateByZipCode("ARG", cp);
          console.log("onBlurZipCode triggered");
          if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality;
            const firstProvince = localityAndStates[0].state;
  
            setLocalities(localityAndStates.map((x) => x.locality));
  
            handleInputChange({
              target: {
                name: "localidad",
                value: firstLocality,
              },
            } as React.ChangeEvent<HTMLInputElement>);
  
            handleInputChange({
              target: {
                name: "provincia",
                value: firstProvince,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        } else if (countryId === "BR") {
          const brazilData = await fetchBrazilZipCode(cp);
          if (brazilData) {
  
            handleInputChange({
              target: {
                name: "localidad",
                value: brazilData.localidade || brazilData.logradouro,
              },
            } as React.ChangeEvent<HTMLInputElement>);
  
            handleInputChange({
              target: {
                name: "provincia",
                value: brazilData.uf,
              },
            } as React.ChangeEvent<HTMLInputElement>);
  
            handleInputChange({
              target: {
                name: "domicilio",
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
    if (corporateCompaniesActive) setFormulario(corporateCompaniesActive);
    else setFormulario(initialForm);
  }, [corporateCompaniesActive, setFormulario]);

  useEffect(() => {
    return () => {
      dispatch((removeCorporateCompaniesActive));
    };
  }, [dispatch]);




  return (
    <>
    <Loading key="loading-business" loading={loadingZipCode }  />
      <Container maxWidth="md" sx={{
        mt: 4,
        p: { sm: 1, md: 1 },
        mb: 1,
        ml: 5
      }}>
        <Loading key="loading-users" loading={isLoading} />
        <Typography
          component="h1"
          variant="h4"
          align="left"
          sx={{ mt: 3, mb: 3 }}
        >
          <PeopleIcon sx={{ marginRight: '8px', fontSize: 'inherit', verticalAlign: 'middle' }} />
          Compañías Societarias
        </Typography>
        <button onClick={handleClick}> Vereficar</button>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{ my: 3, mb: 5 }}
          >
            { corporateCompaniesActive ?  "Editar" : "Nueva"} {' '}
            Compañías Societarias
          </Typography>

            <Grid container spacing={1} p={1} mt={1}>
              <Grid container direction="column" xs={7}>
                <Grid container spacing={1.5} sx={{ pt: 6 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Clave Tributaria"
                    type="text"
                    name="taxKey"
                    value={taxKey}
                    onBlur={handleVerifyId}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Razón Social"
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={businessName}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Nombre Fantasía"
                    type="text"
                    id="fantasyName"
                    name="fantasyName"
                    value={fantasyName}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Codigo Postal"
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
                <Grid item xs={12}>
                <Autocomplete
                  options={localities}
                  getOptionLabel={(option) => option}
                  value={locality}
                  onChange={(_event, newValue) => {
                    setLocality(newValue);
                    handleInputChange({
                      target: {
                        name: "localidad",
                        value: newValue || "" // Asegurar que no pase `null` en `handleInputChange`
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Localidad"
                      variant="outlined"
                      name="localidad"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <InputAdornment position="start" />
                      }}
                      fullWidth
                    />
                  )}
                />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Domicilio"
                    type="text"
                    id="domicile"
                    name="domicile"
                    value={domicile}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Estado"
                    type="text"
                    id="state"
                    name="state"
                    value={state}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Teléfono"
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Contacto Secundario"
                    type="text"
                    id="secondaryContact"
                    name="secondaryContact"
                    value={secondaryContact}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <TextField
                    label="Observaciones"
                    type="text"
                    id="observations"
                    name="observations"
                    value={observations}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                  {!corporateCompaniesActive &&
                    <>
                      <Grid item xs={6}>
                        {/* <TextField
                          label="Contraseña"
                          type="password"
                          name="password"
                          error={!!formControlError["password"]}
                          helperText={formControlError["password"]}
                          value={formulario.password}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">
                              <Tooltip title={policyPassword}>
                                <InfoIcon />
                              </Tooltip>
                            </InputAdornment>,
                          }}
                          onChange={handlePasswordChange}
                          fullWidth /> */}
                      </Grid>
                      <Grid item xs={6}>
                        {/* <TextField
                          label="Repetir contraseña"
                          type="password"
                          name="confirmPassword"
                          error={!!formControlError["confirmPassword"]}
                          helperText={formControlError["confirmPassword"]}
                          value={confirmPassword}
                          onChange={handlePasswordChange}
                          fullWidth /> */}
                      </Grid>
                    </>
                  }
                  <Grid item xs={4}>
                    {/* <FormControl fullWidth >
                      <InputLabel>Idioma</InputLabel>
                      <Select
                        id="language"
                        name="language"
                        label="Idioma"
                        value={formulario.language}
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="Español">Español</MenuItem>
                        <MenuItem value="Portugués">Portugués</MenuItem>
                        <MenuItem value="Inglés">Inglés</MenuItem>
                      </Select>
                    </FormControl> */}
                  </Grid>
                  <Grid item xs={4}>
                    {/* <FormControl fullWidth >
                      <InputLabel>Rol</InputLabel>
                      {/* <Select
                        id="admin"
                        name="rol"
                        label="Rol"
                        value={formulario.rol}
                        onChange={handleSelectChange}
                      > 
                        <MenuItem value={UserRols.User}>Usuario</MenuItem>
                        <MenuItem value={UserRols.Administrator}>Administrador</MenuItem>
                      </Select>
                    </FormControl> */}
                  </Grid>
                  <Grid item xs={4}>
                    {/* <Autocomplete
                      value={formulario.state}
                      onChange={onChangeStatus}
                      options={statusOptions}
                      // getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} label="Estado" variant="outlined" />
                      )}
                      fullWidth
                    /> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid container direction="column" xs={5}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <PhotoCameraIcon sx={{ mr: 1 }} />
                          <Typography variant="body1" sx={{ p: 0 }}>Subir foto</Typography>
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
                {corporateCompaniesActive && <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: "center", alignItems: 'center' }} >
                  </Box>
                    <>
                      <Grid container direction="column" sx={{ mt: 1 }} spacing={1}>
                         <Grid item xs={4}>
                         {/* <TextField
                            label="Clave anterior"
                            type="password"
                            name="previousPassword"
                            value={formulario.previousPassword}
                            onChange={handleInputChange}
                            fullWidth /> */}
                        </Grid>
                        <Grid item xs={4}>
                          {/* <TextField
                            label="Nueva clave"
                            type="password"
                            name="newPassword"
                            value={formulario.newPassword}
                            onChange={handleInputChange}
                            fullWidth /> */}
                        </Grid>
                        <Grid item xs={4}>
                          {/* <TextField
                            label="Repetir nueva clave"
                            type="password"
                            value={confirmPassword}
                            error={!!formControlError.password}
                            helperText={formControlError.password}
                            onChange={onChangeConfirmNewPassword}
                            fullWidth /> */}
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button variant="contained" color="primary" onClick={() => console.log("Clic")}>
                        Confirmar
                      </Button>
                        <Button variant="outlined" color="secondary" onClick={() => console.log("Clic")}>
                          Cancelar
                        </Button>
                      </Box>
                    </>
                </Box>}
                {/* <Box sx={{ display: 'flex', justifyContent: "center", alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">Última sesión:</Typography>
                  {ultimaConexion && (
                    <Typography variant="body1" sx={{ ml: 1 }}>{ultimaConexion.toLocaleString()}</Typography>
                  )}
                </Box> */}
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onClickCancel}>
                Cancelar
              </Button>
              <Button
                type='submit'
                variant="contained"
                color="primary"
                onClick={
                  corporateCompaniesActive ? handleUpdate: handleAdd
                }
              >
                {!corporateCompaniesActive ? "Guardar" : "Actualizar"}{' '}
              </Button>
            </Box>
        </Paper>
      </Container>
    </>
  );
};
