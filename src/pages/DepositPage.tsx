import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Loading, TemplateLayout } from "../components";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  useBusiness,
  useDeposit,
  useForm,
} from "../hooks";
import { CountryCode, Deposit, TipoEntidad } from "../types";
import { removeDepositActive } from "../redux/deposit";
import { getLocalityAndStateByZipCode } from "../services";
import { MapPickerReact } from '../../owncomponents/map-picker/react-port/MapPicker';
import { useTranslation } from "react-i18next";

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

const locationDefault = "General";
// const initialForm: Deposit = {
//   description: "",
//   zipCode: "",
//   address: "",
//   geolocation: { lng: -35, lat: -34 },
//   locality: "",
//   isNegative: false,
//   isVirtual: false,
//   country: "",
//   owner: "Propio",
//   province: "",
//   accountId: "",
//   locations: [locationDefault],
// };


export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [descriptionError, setDescriptionError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [cpError, setCpError] = useState(false);
  const { t } = useTranslation();

  const optionsCountry = ["Argentina", "Brasil", "Chile"];

  const locationDefault = t("_general");
  const initialForm: Deposit = {
    description: "",
    zipCode: "",
    address: "",
    geolocation: { lng: -35, lat: -34 },
    locality: "",
    isNegative: false,
    isVirtual: false,
    country: "",
    owner: t("_owner"),
    province: "",
    accountId: "",
    locations: [locationDefault],
  };


  const { depositActive } = useAppSelector((state) => state.deposit);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleFormValueChange,
    handleSelectChange,
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
    country,
    isNegative,
    isVirtual,
    locations,
  } = formulario;

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

    if (country.trim() === "") {
      setCountryError(true);
      isValid = false;
    } else {
      setCountryError(false);
    }

    return isValid;
  };

  const getLocalityAndState = async () => {
    setLoadingZipCode(true);
    try {
      const localityAndStates = await getLocalityAndStateByZipCode(
        CountryCode.ARGENTINA,
        zipCode
      );

      if (localityAndStates?.length) {
        setLocalities(localityAndStates.map((x) => x.locality));
        setFormulario((prevState) => ({
          ...prevState,
          province: localityAndStates[0].state,
        }));
      }

      setLoadingZipCode(false);
    } catch (error) {
      setLoadingZipCode(false);
      console.log(error);
    }
  };

  const onBlurZipCode = () => {
    if (zipCode !== "") getLocalityAndState();
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
  }, []);

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
              options={["Propio", ...optionsPropietario]}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} name="owner" label={t("_owner")} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
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
          </Grid>
          <Grid item xs={12} sm={4} justifyContent="center">
            <FormGroup row sx={{ alignItems: "center" }}>
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
              {/* <IconButton title="Pick Position"><EditLocation/></IconButton> */}
            </FormGroup>
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="label-pais">{t("id_country")}</InputLabel>
              <Select
                labelId="label-pais"
                name="country"
                value={country}
                label={t("id_country")}
                onChange={handleSelectChange}
              >
                {optionsCountry.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
              {countryError && (
                <Typography color="error">
                  {t("country_is_mandatory")}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              variant="outlined"
              type="number"
              label={t("_cp")}
              name="zipCode"
              value={zipCode}
              onBlur={() => onBlurZipCode()}
              onChange={handleInputChange}
              error={cpError}
              helperText={cpError ? t("this_field_is_mandatory") : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              variant="outlined"
              type="text"
              label={t("_state")}
              name="province"
              value={province}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
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
                  <StyledTableCell>{t("id_location")}</StyledTableCell>
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
