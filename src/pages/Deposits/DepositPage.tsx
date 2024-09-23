import React, { ChangeEvent, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { Loading, TemplateLayout } from "../../components";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  TableContainer,
  TableCell,
  Table,
  TableHead,
  TableRow,
  tableCellClasses,
  styled,
  TableBody,
  Fab,
  Tooltip,
  IconButton,
  Container,
  FormGroup,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import {
  Warehouse as WarehouseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  useCountry,
  useBusiness,
  useDeposit,
  useForm,
} from "../../hooks";
import {  Deposit, EnumStatusContract, TipoEntidad } from "../../types";
import { removeDepositActive } from "../../redux/deposit";
import { getLocalityAndStateByZipCode } from "../../services";
import { MapPickerReact } from '../../../owncomponents/map-picker/react-port/MapPicker';
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    padding: "5px",
    fontSize: 14,
  },
}));




export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [descriptionError, setDescriptionError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [cpError, setCpError] = useState(false);
  const { t } = useTranslation();
  const {dataCountry, getCountries} = useCountry();
  

  
  const statusOptions = Object.values(EnumStatusContract).map(x => x as string);

  const locationDefault = t("_general");

  const initialForm: Deposit = {
    description: "",
    zipCode: "",
    address: "",
    geolocation: { lng: -35, lat: -34 },
    locality: "",
    pais: "",
    owner: "",
    province: "",
    accountId: "",
    locations: [locationDefault],
    isNegative: false,
    isVirtual: false,
    siloBag: false,
    hopper: false,
    silo: false,
    deposit: false,
    siloBagId: "",
    status: EnumStatusContract.Inactivo,
  };


  const { depositActive } = useAppSelector((state) => state.deposit);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleFormValueChange,
    //handleSelectChange,
    handleGeolocationChange,
  } = useForm(initialForm);

  const { isLoading, createDeposit, updateDeposit } = useDeposit();
  const {
    getBusinesses,
    businesses,
    isLoading: loadingBusiness,
  } = useBusiness();
  const {
    location,
    handleInputChange: inputChange,
    reset: resetFormLot,
  } = useForm({ location: "" });

  const {
    description,
    owner,
    zipCode,
    address,
    geolocation,
    locality,
    province,
    pais,
    isNegative,
    isVirtual,
    locations,
    deposit,
    hopper,
    silo,
    siloBag,
    siloBagId,
  } = formulario;

  //const countries: Country[] = [];
 // const countryOptions = countries ? countries.map(c => ({ code: c.code, label: c.descriptionEN })) : [];
 const [countryOptions, setCountryOptions] = useState<{ code: string; label: string }[]>([]);
  
 const onChangeStatus = (_event: SyntheticEvent, value: string | null) => {
  if (value !== null) {
    
    const statusEnum = value as EnumStatusContract;

    
    setFormulario(prevState => ({
      ...prevState,
      status: statusEnum
    }));

    setFormulario(prevState => ({
      ...prevState,
      status: statusEnum
    }));
  }
};

  const optionsPropietario = useMemo(() => {
    return businesses
      .filter((business) => business.tipoEntidad == TipoEntidad.JURIDICA)
      .map((business) => business.razonSocial || "");
  }, [businesses]);

  const onClickCancel = () => navigate("/init/overview/deposit");

  const handleUpdateDeposit = () => {
    if (validateForm()) {
      if (formulario._id) {
        updateDeposit(formulario);
      } else {
        createDeposit(formulario);
      }
      dispatch(removeDepositActive());
      setFormulario(initialForm);
    }
  };
  const handleAddDeposit = () => {
    if (validateForm()) {
      createDeposit(formulario);
      setFormulario(initialForm);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (description.trim() === "") {
      setDescriptionError(true);
      isValid = false;
    } else {
      setDescriptionError(false);
    }

    if (zipCode.trim() === "") {
      setCpError(true);
      isValid = false;
    } else {
      setCpError(false);
    }

    if (pais.trim() === "") {
      setCountryError(true);
      isValid = false;
    } else {
      setCountryError(false);
    }

    return isValid;
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

  // const getLocalityAndState = async () => {
  //   setLoadingZipCode(true);
  //   try {
  //     const localityAndStates = await getLocalityAndStateByZipCode(
  //       CountryCode.ARGENTINA,
  //       zipCode
  //     );

  //     if (localityAndStates?.length) {
  //       setLocalities(localityAndStates.map((x) => x.locality));
  //       setFormulario((prevState) => ({
  //         ...prevState,
  //         province: localityAndStates[0].state,
  //       }));
  //     }

  //     setLoadingZipCode(false);
  //   } catch (error) {
  //     setLoadingZipCode(false);
  //     console.log(error);
  //   }
  // };

  const onBlurZipCode = async () => {
    if (zipCode !== "") {
      setLoadingZipCode(true);
      try {
        console.log("Ejecutando1", pais);
  
        if (pais === "ARG" || pais === "AR") {
          console.log("Ejecutando2", pais);
          const localityAndStates = await getLocalityAndStateByZipCode("ARG",zipCode);
  
          if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality;
            const firstProvince = localityAndStates[0].state;
  
            setLocalities(localityAndStates.map((x) => x.locality));
  
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
          } else {
            throw new Error("El código postal no coincide con ningún registro en Argentina.");
          }
        } else if (pais === "BR" || pais === "BRA") {
          const brazilData = await fetchBrazilZipCode(zipCode);
  
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
  
            handleInputChange({
              target: {
                name: "address",
                value: `${brazilData.logradouro}, ${brazilData.bairro}`,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
            throw new Error("El código postal no coincide con ningún registro en Brasil.");
          }
        } else if (pais === "PY" || pais === "PRY") {
          console.log("Ejecutando3", pais);
          const localityAndStates = await getLocalityAndStateByZipCode("PRY", zipCode);
  
          if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality;
            const firstProvince = localityAndStates[0].state;
  
            setLocalities(localityAndStates.map((x) => x.locality));
  
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
          } else {
            throw new Error("El código postal no coincide con ningún registro en Paraguay.");
          }
        } else {
          throw new Error("El país seleccionado no es válido o no está soportado.");
        }
  
        setLoadingZipCode(false);
      } catch (error) {
        console.error(error);
  
        Swal.fire({
          title: "Error",
          text: "Revisa que el Código Postal sea correspondiente al país.",
          icon: "error",
        });
  
        setLoadingZipCode(false);
      }
    }
  };

  const handleAddLocation = () => {
    setFormulario((prevState) => ({
      ...prevState,
      locations: [location, ...prevState.locations],
    }));
    resetFormLot();
  };

  const handleDeleteLocation = (item: string) => {
    setFormulario((prevState) => ({
      ...prevState,
      locations: prevState.locations.filter(
        (l) => l.trim().toLowerCase() !== item.trim().toLowerCase()
      ),
    }));
  };

  const handleChangeIsNegative = (
    e: ChangeEvent<HTMLInputElement>,
    _checked: boolean
  ) => {
    const { name } = e.target;
    setFormulario((prevState) => ({
      ...prevState,
      isNegative: name.toLowerCase() === "yes",
    }));
  };

  useEffect(() => {
    if (depositActive) setFormulario(depositActive);
    else setFormulario(initialForm);
  }, [depositActive]);

  useEffect(() => {
    return () => {
      dispatch(removeDepositActive());
    };
  }, [dispatch]);

  useEffect(() => {
    getBusinesses();
    getCountries();
  }, []);

 

  useEffect(() => {
    if (dataCountry) {
      const options = dataCountry.map(country => ({
        code: country.code,
        label: country.descriptionEN || country.descriptionES || country.code, 
      }));
      setCountryOptions(options);
    }
  }, [dataCountry]);


  const onChangeCountry = (_event: SyntheticEvent, value: { code: string; label: string } | null) => {
    if (value)
      handleFormValueChange("pais", value.code);
  }

  return (
    <TemplateLayout key="overview-deposit" viewMap={true}>
      <Loading key="loading-deposit" loading={isLoading || loadingZipCode} />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
      >
        <Box className="text-center">
          <WarehouseIcon />
        </Box>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{ mt: 1, mb: 7 }}
        >
          {depositActive ? `${t("icon_edit")} ${t("new_masculine")} ${t("_warehouse")}` : `${t("_add")} ${t("new_masculine")} ${t("_warehouse")}`}
        </Typography>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t("_description")}
              name="description"
              value={description}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
              error={descriptionError}
              helperText={descriptionError ? t("this_field_is_mandatory") : ""}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              id="owner"
              freeSolo
              loading={loadingBusiness}
              value={owner}
              onChange={(_event: any, newValue: string | null) => {
                newValue && handleFormValueChange("owner", newValue);
              }}
              inputValue={owner}
              onInputChange={(_event, newInputValue) => {
                handleFormValueChange("owner", newInputValue);
              }}
              options={[...optionsPropietario]}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} name="owner" label={t("_owner")} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}  sx={{ marginLeft: '-50px' }} >
            <Box >
            <FormGroup row>
              <FormControlLabel
                key="checkbox-true"
                control={
                  <Checkbox
                    name="physical"
                    checked={!isVirtual}
                    onChange={() =>
                      setFormulario((prevState) => ({
                        ...prevState,
                        isVirtual: false,
                      }))
                    }
                  />
                }
                label={t("physical_masculine")}
                labelPlacement="start"
              />
              <FormControlLabel
                key="checkbox-false"
                control={
                  <Checkbox
                    name="virtual"
                    checked={isVirtual}
                    onChange={() =>
                      setFormulario((prevState) => ({
                        ...prevState,
                        isVirtual: true,
                      }))
                    }
                  />
                }
                label={t("_virtual")}
                labelPlacement="start"
              />
            </FormGroup>
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
          {/* <FormControl fullWidth>
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
          </FormControl> */}
            </Box>
            
            <FormGroup row>
              <FormControlLabel
                key="checkbox-true"
                control={
                  <Checkbox
                    name="physical"
                    checked={deposit}
                    onChange={() =>
                      setFormulario((prevState) => ({
                        ...prevState,
                        deposit: true,
                        siloBag: false, 
                        silo: false,
                        hopper: false,
                      }))
                    }
                  />
                }
                label="Deposito"
                labelPlacement="start"
              />
              <FormControlLabel
                key="checkbox-false"
                control={
                  <Checkbox
                    name="siloBag"
                    checked={siloBag}
                    onChange={() =>
                      setFormulario((prevState) => ({
                        ...prevState,
                        deposit: false, 
                        siloBag: true,
                        silo: false,
                        hopper: false
                      }))
                    }
                  />
                }
                label="Silobolsa"
                labelPlacement="start"
              />
              {siloBag && (
                  <TextField
                    sx={{ width: "72%" }}
                    variant="outlined"
                    type="text"
                    size="small"
                    label="ID Silobolsa"
                    name="siloBagId"
                    value={siloBagId}
                    onChange={(e) => setFormulario((prevState) => ({
                      ...prevState,
                      siloBagId: e.target.value
                    }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" />,
                    }}
                  />
                )}
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={3.5} md={3}  sx={{ marginLeft: '0px' }} >
            <FormGroup row sx={{ alignItems: "left" }}>
              <label htmlFor="">{t("admits_negative_stock")}</label>
              <FormControlLabel
                key="checkbox-true"
                control={
                  <Checkbox
                    name="yes"
                    checked={isNegative}
                    onChange={handleChangeIsNegative}
                  />
                }
                label={t("_yes")}
                labelPlacement="start"
              />
              <FormControlLabel
                key="checkbox-false"
                control={
                  <Checkbox
                    name="not"
                    checked={!isNegative}
                    onChange={handleChangeIsNegative}
                  />
                }
                label={t("_no")}
                labelPlacement="start"
              />
            </FormGroup>
            
            <FormGroup row>
              <FormControlLabel
                key="checkbox-true"
                control={
                  <Checkbox
                    name="silo"
                    checked={silo}
                    onChange={() =>
                      setFormulario((prevState) => ({
                        ...prevState,
                        deposit: false, 
                        silo: true,
                        hopper: false
                      }))
                    }
                  />
                }
                label="Silo"
                labelPlacement="start"
              />
              <FormControlLabel
                key="checkbox-false"
                control={
                  <Checkbox
                    name="hopper"
                    checked={hopper}
                    onChange={() =>
                      setFormulario((prevState) => ({
                        ...prevState,
                        deposit: false, 
                        siloBag: false,
                        silo: false,
                        hopper: true
                      }))
                    }
                  />
                }
                label="Tolva"
                labelPlacement="start"
              />
            </FormGroup>
          
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormGroup sx={{ position: 'flex', flexDirection: "row", gap: "5px" }}>
              <TextField
                sx={{ width: "35%" }}
                variant="outlined"
                type="text"
                size="small"
                label="Latitud"
                name="geolocation"
                value={geolocation.lat?.toFixed(5) || ""}
                onChange={(e) => handleGeolocationChange({ ...geolocation, lat: +e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />,
                }}

              />
              <TextField
                variant="outlined"
                sx={{ width: "35%" }}
                type="text"
                size="small"
                label="Longitud"
                name="geolocation"
                value={geolocation.lng?.toFixed(5) || ""}
                onChange={(e) => handleGeolocationChange({ ...geolocation, lng: +e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />,
                }}

              />
              <MapPickerReact posicion={geolocation} onPicked={({ detail }: any) => { handleGeolocationChange(detail) }} />
           
              
            </FormGroup>
          </Grid>
          <Grid item xs={6} sm={4}>
          <FormControl fullWidth variant="outlined" error={countryError}>
                <Autocomplete
                  value={countryOptions.find(opts => opts.code === pais) || null}
                  onChange={onChangeCountry}
                  options={countryOptions}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} label={t("id_country")} variant="outlined" />
                  )}
                  fullWidth
                />
            {countryError && <FormHelperText>Mensaje de error!</FormHelperText>}
          </FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
          <TextField
            variant="outlined"
            type="text"
            label={t("postal_code")}
            name="zipCode"
            value={zipCode}
            onBlur={onBlurZipCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Autocomplete
              id="province"
              freeSolo
              loading={loadingZipCode}
              value={province}
              onChange={(_event: any, newValue: string | null) => {
                newValue && handleFormValueChange("province", newValue);
              }}
              inputValue={province}
              onInputChange={(_event, newInputValue) => {
                handleFormValueChange("province", newInputValue);
              }}
              options={localities}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} name="province" label={t("_state")} />
              )}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Autocomplete
              id="localidad"
              freeSolo
              loading={loadingZipCode}
              value={locality}
              onChange={(_event: any, newValue: string | null) => {
                newValue && handleFormValueChange("locality", newValue);
              }}
              inputValue={locality}
              onInputChange={(_event, newInputValue) => {
                handleFormValueChange("locality", newInputValue);
              }}
              options={localities}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} name="locality" label={t("_locality")} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              variant="outlined"
              type="text"
              label={t("_address")}
              name="address"
              value={address}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Container maxWidth="md">
          <TableContainer
            key="table-locations"
            sx={{ mt: 2 }}
            component={Paper}
          >
            <Table sx={{ minWidth: 350 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>{t("locations_within_the_depot")}</StyledTableCell>
                  <StyledTableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow key="new-especificacion">
                  <StyledTableCell sx={{ minWidth: 300, maxWidth: 400 }}>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="text"
                      name="location"
                      value={location}
                      onChange={inputChange}
                      fullWidth
                    />
                  </StyledTableCell>
                  <StyledTableCell key="head-actions" align="center">
                    <Fab
                      color="success"
                      aria-label="add"
                      size="small"
                      onClick={() => handleAddLocation()}
                    >
                      <AddIcon />
                    </Fab>
                  </StyledTableCell>
                </TableRow>
                {locations.map((loc) => (
                  <TableRow key={loc}>
                    <TableCell
                      sx={{
                        p: "5px",
                        height: "50px",
                        minWidth: 350,
                        maxWidth: 450,
                      }}
                    >
                      {loc}
                    </TableCell>
                    <TableCell align="center" sx={{ p: "5px" }}>
                      <Tooltip title={t("icon_delete")}>
                        <IconButton
                          hidden={
                            loc.toLowerCase() === locationDefault.toLowerCase()
                          }
                          onClick={() => handleDeleteLocation(loc)}
                          color="default"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
        <Grid
          container
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
          sx={{ mt: 3 }}
        >
          <Grid item xs={12} sm={3}>
            <Button onClick={onClickCancel}>{t("id_cancel")}</Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={depositActive ? handleUpdateDeposit : handleAddDeposit}
            >
              {!depositActive ? t("_add") : t("id_update")}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </TemplateLayout>
  );


  
};
