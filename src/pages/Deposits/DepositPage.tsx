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
import { Deposit, EnumStatusContract, TipoEntidad } from "../../types";
import { removeDepositActive } from "../../redux/deposit";
import { getLocalityAndStateByZipCode } from "../../utils/getDataZipCode";
import { MapPickerReact } from "../../../owncomponents/map-picker/react-port/MapPicker";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { t } from "i18next";

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

const FormSection: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    {title && (
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: 'divider' }} />
        <Typography
          variant="h6"
          sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}
        >
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: 'divider' }} />
      </Box>
    )}
    <Box sx={{ pl: 2 }}>{children}</Box>
  </Box>
);
// Initial form values
const initialForm: Deposit = {
  description: "",
  zipCode: "",
  address: "",
  geolocation: { lng: -35, lat: -34 },
  locality: "",
  country: "",
  owner: "",
  province: "",
  accountId: "",
  locations: [t("_general")],
  isNegative: false,
  isVirtual: false,
  siloBag: false,
  hopper: false,
  silo: false,
  deposit: false,
  siloBagId: "",
  status: EnumStatusContract.Inactivo,
};

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // Local state
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [descriptionError, setDescriptionError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [cpError, setCpError] = useState(false);
  const [countryOptions, setCountryOptions] = useState<{ code: string; label: string }[]>([]);

  // Hooks for countries, business and deposit
  const { dataCountry, getCountries } = useCountry();
  const { depositActive } = useAppSelector((state) => state.deposit);
  const { isLoading, createDeposit, updateDeposit } = useDeposit();
  const { getBusinesses, businesses, isLoading: loadingBusiness } = useBusiness();

  // main form state
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleFormValueChange,
    handleGeolocationChange,
  } = useForm(initialForm);

  // A separate mini-form to add a location within the depot
  const { location, handleInputChange: inputChange, reset: resetFormLot } = useForm({ location: "" });
  const {
    description,
    owner,
    zipCode,
    address,
    geolocation,
    locality,
    province,
    country,
    isNegative,
    isVirtual,
    locations,
    deposit,
    hopper,
    silo,
    siloBag,
    siloBagId,
  } = formulario;

  const statusOptions = Object.values(EnumStatusContract).map((x) => {
    switch (x) {
      case EnumStatusContract.Activo:
        return t("status_active");
      case EnumStatusContract.Inactivo:
        return t("status_inactive");
      default:
        return x as string;
    }
  });

  const getStatusEnumFromTranslation = (translatedStatus: string): EnumStatusContract => {
    if (translatedStatus === t("status_active")) return EnumStatusContract.Activo;
    if (translatedStatus === t("status_inactive")) return EnumStatusContract.Inactivo;
    return EnumStatusContract.Inactivo;
  };

  const locationDefault = t("_general");

  const onChangeStatus = (_event: SyntheticEvent, value: string | null) => {
    if (value !== null) {
      const statusEnum = getStatusEnumFromTranslation(value);
      setFormulario((prev) => ({ ...prev, status: statusEnum }));
    }
  };

  const optionsPropietario = useMemo(() => {
    return businesses
      .filter((business) => business.tipoEntidad === TipoEntidad.JURIDICA)
      .map((business) => business.razonSocial || "");
  }, [businesses]);

  const onClickCancel = () => navigate("/init/overview/deposit");
  const handleUpdateDeposit = async () => {
    if (validateForm()) {
      try {
        if (formulario._id) {
          await updateDeposit(formulario);
        } else {
          await createDeposit(formulario);
        }

        dispatch(removeDepositActive());

        setFormulario(initialForm);

        navigate("/init/overview/deposit");

        Swal.fire({
          title: t("success"),
          text: formulario._id ? t("deposit_updated_successfully") : t("deposit_created_successfully"),
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error al actualizar/crear el depósito:", error);
        Swal.fire({
          title: t("error"),
          text: t("operation_failed"),
          icon: "error"
        });
      }
    }
  };

  const handleAddDeposit = async () => {
    if (validateForm()) {
      try {
        await createDeposit(formulario);

        setFormulario(initialForm);

        navigate("/init/overview/deposit");

        Swal.fire({
          title: t("success"),
          text: t("deposit_created_successfully"),
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error al crear el depósito:", error);
        Swal.fire({
          title: t("error"),
          text: t("deposit_creation_failed"),
          icon: "error"
        });
      }
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
    if (country.trim() === "") {
      setCountryError(true);
      isValid = false;
    } else {
      setCountryError(false);
    }
  
    // Validación de geolocalización
    const boundaries = getBoundaries(country);
    if (geolocation.lat < boundaries.minLat || geolocation.lat > boundaries.maxLat) {
      Swal.fire({
        title: t("validation_error"),
        text: t("latitude_out_of_bounds"), // Define este mensaje en tus traducciones
        icon: "error",
      });
      isValid = false;
    }
    if (geolocation.lng < boundaries.minLng || geolocation.lng > boundaries.maxLng) {
      Swal.fire({
        title: t("validation_error"),
        text: t("longitude_out_of_bounds"), // Define este mensaje en tus traducciones
        icon: "error",
      });
      isValid = false;
    }
  
    return isValid;
  };
  
  // ZIP code lookup functions
  const fetchBrazilZipCode = async (zip: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch Brazil zip code data:", error);
      return null;
    }
  };

  const onBlurZipCode = async () => {
    if (zipCode !== "") {
      setLoadingZipCode(true);
      try {
        if (country === "ARG" || country === "AR") {
          const localityAndStates = await getLocalityAndStateByZipCode("ARG", zipCode);
          if (localityAndStates?.length) {
            const uniqueLocalities = [...new Set(localityAndStates.map((x) => x.locality))];
            setLocalities(uniqueLocalities);
            const firstProvince = localityAndStates[0].state;
            handleInputChange({
              target: { name: "province", value: firstProvince },
            } as React.ChangeEvent<HTMLInputElement>);
            if (uniqueLocalities.length === 1) {
              handleInputChange({
                target: { name: "locality", value: uniqueLocalities[0] },
              } as React.ChangeEvent<HTMLInputElement>);
            } else {
              handleInputChange({
                target: { name: "locality", value: "" },
              } as React.ChangeEvent<HTMLInputElement>);
              Swal.fire({
                title: t("select_locality"),
                text: t("multiple_localities_found"),
                icon: "info",
              });
            }
          } else {
            throw new Error("No matching record found for Argentina.");
          }
        } else if (country === "BR" || country === "BRA") {
          const brazilData = await fetchBrazilZipCode(zipCode);
          if (brazilData) {
            handleInputChange({
              target: { name: "locality", value: brazilData.localidade || brazilData.logradouro },
            } as React.ChangeEvent<HTMLInputElement>);
            handleInputChange({
              target: { name: "province", value: brazilData.uf },
            } as React.ChangeEvent<HTMLInputElement>);
            handleInputChange({
              target: { name: "address", value: `${brazilData.logradouro}, ${brazilData.bairro}` },
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
            throw new Error("No matching record found for Brazil.");
          }
        } else if (country === "PY" || country === "PRY") {
          const localityAndStates = await getLocalityAndStateByZipCode("PRY", zipCode);
          if (localityAndStates?.length) {
            const uniqueLocalities = [...new Set(localityAndStates.map((x) => x.locality))];
            setLocalities(uniqueLocalities);
            const firstProvince = localityAndStates[0].state;
            handleInputChange({
              target: { name: "province", value: firstProvince },
            } as React.ChangeEvent<HTMLInputElement>);
            if (uniqueLocalities.length === 1) {
              handleInputChange({
                target: { name: "locality", value: uniqueLocalities[0] },
              } as React.ChangeEvent<HTMLInputElement>);
            } else {
              handleInputChange({
                target: { name: "locality", value: "" },
              } as React.ChangeEvent<HTMLInputElement>);
              Swal.fire({
                title: t("select_locality"),
                text: t("multiple_localities_found"),
                icon: "info",
              });
            }
          } else {
            throw new Error("No matching record found for Paraguay.");
          }
        } else {
          throw new Error("Unsupported country selected.");
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error",
          text: "Check that the postal code matches the selected country.",
          icon: "error",
        });
      } finally {
        setLoadingZipCode(false);
      }
    }
  };


  const getBoundaries = (countryCode: string) => {
    switch (countryCode) {
      case "ARG":
      case "AR":
        return { minLat: -55, maxLat: -21, minLng: -73, maxLng: -53 };
      case "BR":
      case "BRA":
        return { minLat: -33, maxLat: 5, minLng: -74, maxLng: -34 };
      case "PY":
      case "PRY":
        return { minLat: -28, maxLat: -19, minLng: -62, maxLng: -54 };
      default:
        return { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 };
    }
  };

  const boundaries = getBoundaries(country);


  const isDuplicateLocation = (newLocation: string) => {
    return formulario.locations.some(
      (loc) => loc.trim().toLowerCase() === newLocation.trim().toLowerCase()
    );
  };

  const handleAddLocation = () => {
    if (!location.trim()) {
      Swal.fire({
        title: t("validation_error"),
        text: t("location_cannot_be_empty"),
        icon: "error",
      });
      return;
    }
    if (isDuplicateLocation(location)) {
      Swal.fire({
        title: t("validation_error"),
        text: t("location_already_exists"),
        icon: "error",
      });
      return;
    }
    setFormulario((prev) => ({
      ...prev,
      locations: [location, ...prev.locations],
    }));
    resetFormLot();
  };

  const handleDeleteLocation = (item: string) => {
    setFormulario((prev) => ({
      ...prev,
      locations: prev.locations.filter(
        (l) => l.trim().toLowerCase() !== item.trim().toLowerCase()
      ),
    }));
  };

  const handleChangeIsNegative = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setFormulario((prev) => ({
      ...prev,
      isNegative: name.toLowerCase() === "yes",
    }));
  };

  const onChangeCountry = (
    _event: SyntheticEvent,
    value: { code: string; label: string } | null
  ) => {
    if (value) handleFormValueChange("country", value.code);
  };

  // Effects
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
      const options = dataCountry.map((country) => ({
        code: country.code,
        label: country.descriptionEN || country.descriptionES || country.code,
      }));
      setCountryOptions(options);
    }
  }, [dataCountry]);

  return (
    <TemplateLayout key="overview-deposit" viewMap={true}>
      <Loading key="loading-deposit" loading={isLoading || loadingZipCode} />
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}>
        <Box textAlign="center" mb={3}>
          <WarehouseIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          {depositActive
            ? `${t("icon_edit")} ${t("new_masculine")} ${t("_warehouse")}`
            : `${t("_add")} ${t("new_masculine")} ${t("_warehouse")}`}
        </Typography>

        {/* Basic Information Section */}
        <FormSection title={t("basic_information")}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("_description")}
                name="description"
                value={description}
                onChange={handleInputChange}
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
                onChange={(_event, newValue: string | null) =>
                  newValue && handleFormValueChange("owner", newValue)
                }
                inputValue={owner}
                onInputChange={(_event, newInputValue) =>
                  handleFormValueChange("owner", newInputValue)
                }
                options={optionsPropietario}
                fullWidth
                renderInput={(params) => <TextField {...params} label={t("_owner")} name="owner" />}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Type and Status Section */}
        <FormSection title={t("type_and_status")}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!isVirtual}
                      onChange={() =>
                        setFormulario((prev) => ({ ...prev, isVirtual: false }))
                      }
                    />
                  }
                  label={t("physical_masculine")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isVirtual}
                      onChange={() =>
                        setFormulario((prev) => ({ ...prev, isVirtual: true }))
                      }
                    />
                  }
                  label={t("_virtual")}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Autocomplete
                  value={formulario.status}
                  onChange={(e, newValue) =>
                    newValue && onChangeStatus(e, newValue)
                  }
                  options={statusOptions}
                  renderInput={(params) => <TextField {...params} label={t("status")} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={deposit}
                      onChange={() =>
                        setFormulario((prev) => ({
                          ...prev,
                          deposit: true,
                          siloBag: false,
                          silo: false,
                          hopper: false,
                        }))
                      }
                    />
                  }
                  label={t("_warehouse")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={siloBag}
                      onChange={() =>
                        setFormulario((prev) => ({
                          ...prev,
                          deposit: false,
                          siloBag: true,
                          silo: false,
                          hopper: false,
                        }))
                      }
                    />
                  }
                  label={t("_silobag")}
                />
                {siloBag && (
                  <TextField
                    sx={{ width: "72%" }}
                    variant="outlined"
                    size="small"
                    label="ID Silobolsa"
                    name="siloBagId"
                    value={siloBagId}
                    onChange={(e) =>
                      setFormulario((prev) => ({ ...prev, siloBagId: e.target.value }))
                    }
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography sx={{ mr: 2 }}>{t("admits_negative_stock")}</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isNegative}
                      onChange={handleChangeIsNegative}
                      name="yes"
                    />
                  }
                  label={t("_yes")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!isNegative}
                      onChange={handleChangeIsNegative}
                      name="not"
                    />
                  }
                  label={t("_no")}
                />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={silo}
                      onChange={() =>
                        setFormulario((prev) => ({
                          ...prev,
                          deposit: false,
                          silo: true,
                          hopper: false,
                        }))
                      }
                    />
                  }
                  label="Silo"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hopper}
                      onChange={() =>
                        setFormulario((prev) => ({
                          ...prev,
                          deposit: false,
                          siloBag: false,
                          silo: false,
                          hopper: true,
                        }))
                      }
                    />
                  }
                  label={t("_hopper")}
                />
              </Box>
            </Grid>
          </Grid>
        </FormSection>


        {/* Address Information Section */}
        <FormSection title={t("address_information")}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <FormControl fullWidth variant="outlined" error={countryError}>
                <Autocomplete
                  value={countryOptions.find((opts) => opts.code === country) || null}
                  onChange={onChangeCountry}
                  options={countryOptions}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => <TextField {...params} label={t("id_country")} />}
                />
                {countryError && <FormHelperText>{t("error_country")}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label={t("postal_code")}
                name="zipCode"
                value={zipCode}
                onBlur={onBlurZipCode}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Autocomplete
                id="province"
                freeSolo
                loading={loadingZipCode}
                value={province}
                onChange={(_event, newValue: string | null) =>
                  newValue && handleFormValueChange("province", newValue)
                }
                inputValue={province}
                onInputChange={(_event, newInputValue) =>
                  handleFormValueChange("province", newInputValue)
                }
                options={[]} // Adjust if you have province options
                fullWidth
                renderInput={(params) => <TextField {...params} label={t("_state")} name="province" />}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Autocomplete
                id="localidad"
                freeSolo
                loading={loadingZipCode}
                value={locality}
                onChange={(_event, newValue: string | null) =>
                  newValue && handleFormValueChange("locality", newValue)
                }
                inputValue={locality}
                onInputChange={(_event, newInputValue) =>
                  handleFormValueChange("locality", newInputValue)
                }
                options={localities}
                fullWidth
                renderInput={(params) => <TextField {...params} label={t("_locality")} name="locality" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("_address")}
                name="address"
                value={address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Geolocation Section */}
        <FormSection title={t("geolocation")}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Latitud"
                type="number"
                size="small"
                value={geolocation.lat?.toFixed(5) || ""}
                onChange={(e) =>
                  handleGeolocationChange({ ...geolocation, lat: +e.target.value })
                }
                fullWidth
                inputProps={{ min: boundaries.minLat, max: boundaries.maxLat, step: "0.00001" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Longitud"
                type="number"
                size="small"
                value={geolocation.lng?.toFixed(5) || ""}
                onChange={(e) =>
                  handleGeolocationChange({ ...geolocation, lng: +e.target.value })
                }
                fullWidth
                inputProps={{ min: boundaries.minLng, max: boundaries.maxLng, step: "0.00001" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MapPickerReact
                posicion={geolocation}
                onPicked={({ detail }: any) => handleGeolocationChange(detail)}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Locations Section */}
        <FormSection title={t("locations_within_the_depot")}>
          <Container maxWidth="md">
            <TableContainer component={Paper}>
              <Table aria-label="locations table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>{t("locations_within_the_depot")}</StyledTableCell>
                    <StyledTableCell align="center">{t("actions")}</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledTableCell>
                      <TextField
                        name="location"
                        value={location}
                        onChange={inputChange}
                        fullWidth
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Fab color="success" size="small" onClick={handleAddLocation}>
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
                            disabled={loc.toLowerCase() === locationDefault.toLowerCase()}
                            onClick={() => handleDeleteLocation(loc)}
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
        </FormSection>

        {/* Action Buttons */}
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" color="inherit" fullWidth onClick={onClickCancel}>
              {t("id_cancel")}
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={depositActive ? handleUpdateDeposit : handleAddDeposit}
            >
              {depositActive ? t("id_update") : t("_add")}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </TemplateLayout>
  );
};