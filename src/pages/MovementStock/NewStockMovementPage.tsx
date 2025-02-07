import React, { useEffect, useState, useMemo } from "react";
import { Loading } from "../../components";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { SyncAlt as SyncAltIcon, Cancel as CancelIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useCampaign, useDeposit, useForm, useStockMovement, useSupply } from "../../hooks";
import {
  Deposit,
  Movement,
  MovementType,
  StockMovement,
  Supply,
  TypeMovement,
} from "../../types";
import { getShortDate } from "../../helpers/dates";
import { useTranslation } from "react-i18next";
import uuid4 from "uuid4";
import { uploadFile } from "../../helpers/fileUpload";

const initialForm: StockMovement = {
  typeMovement: TypeMovement.Ajustes,
  amount: 0,
  nroLot: "",
  creationDate: getShortDate(),
  campaignId: "0",
  currency: "",
  depositId: "",
  location: "",
  detail: "",
  dueDate: getShortDate(),
  hours: "",
  isCrop: false,
  movement: Movement.Manual,
  operationDate: getShortDate(false, "-"),
  supplyId: "",
  cropId: "",
  totalValue: 0,
  voucher: "",
  isIncome: false,
  accountId: "",
  userId: "",
  documentFile: ""
};


export const NewStockMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const {
    isLoading,
    stockByLots,
    movementsType,
    addNewStockMovement,
    getNroLotsBySupplyAndDeposit,
    getMovementsType } = useStockMovement();
  const { isLoading: isLoadingSupplies, supplies, getSupplies } = useSupply();
  const { isLoading: isLoadingDeposits, deposits, getDeposits } = useDeposit();
  const { isLoading: isLoadCampaigns, campaigns, getCampaigns } = useCampaign();
  const { t } = useTranslation();

  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleCheckboxChange,
    handleSelectChange,
    reset,
  } = useForm(initialForm);
  const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
  const [showSwitch, setShowSwitch] = useState(true);
  const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);
  const [depositDestinationSelected, setDepositDestinationSelected] = useState<Deposit | null>(null);
  const [locationDestinationSelected, setLocationDestinationSelected] = useState("");
  const [movementTypeSelected, setMovementTypeSelected] = useState<MovementType | null>(null);
  const [fileUpload, setFileUpload] = React.useState<File | null>(null);
  const { depositId: depositOrigin, supplyId, location } = formulario;

  const depositsToBeAllocated = useMemo(() => {
    return deposits.filter(
      (d) => d._id && d._id.toLowerCase() !== depositOrigin.toLowerCase()
    );
  }, [deposits, depositOrigin]);

  const onClickCancel = () => navigate("/init/overview/stock-movements");

  const onClickSave = () => {

    let destination = depositDestinationSelected?._id ? {
      depositId: depositDestinationSelected._id,
      location: locationDestinationSelected
    } : undefined;

    if (supplySelected && depositSelected && movementTypeSelected) {
      uploadDocumentFile();
      addNewStockMovement(
        {
          ...formulario,
          typeMovement: movementTypeSelected.name,
        },
        supplySelected,
        destination);
      reset();
    }
  };

  const onChangeMovementType = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    const movementTypeSelected = movementsType.find(x => x._id === value);
    if (movementTypeSelected)
      setMovementTypeSelected(movementTypeSelected);
    setFormulario(prevState => ({ ...prevState, typeMovement: value }));
  }

  const onChangeSupply = ({ target }: SelectChangeEvent) => {
    const { value } = target;

    const supplySelected = supplies.find((supply) => supply._id === value);
    if (supplySelected && supplySelected._id) {
      setFormulario((prevState) => ({
        ...prevState,
        supplyId: value,
      }));
      setSupplySelected(supplySelected);
    }
  };

  const onChangeDeposit = ({ target }: SelectChangeEvent) => {
    const { value, name } = target;
    const depositSelected = deposits.find((deposit) => deposit._id === value);

    if (depositSelected && name === "origin") {
      setFormulario((prevState) => ({ ...prevState, depositId: value }));
      setDepositSelected(depositSelected);
    }
    if (depositSelected && name === "destination") {
      setDepositDestinationSelected(depositSelected);
    }
  };

  const onChangeLocation = ({ target }: SelectChangeEvent) => {
    const { value, name } = target;
    if (name === "origin") {
      if (!depositSelected) return;
      setFormulario((prevState) => ({ ...prevState, location: value }));
    }
    else {
      if (!depositDestinationSelected) return;
      setLocationDestinationSelected(value);
    }
  };

  const onChangeNroLot = ({ target }: SelectChangeEvent) => {
    const value = target.value;
    setFormulario(prevState => ({ ...prevState, nroLot: value }));
  }

  const uploadDocumentFile = async () => {
    try {
      if (fileUpload) {
        const response = await uploadFile(fileUpload);
        if (response) console.log("file upload successful.");
      }
    } catch (error) {
      console.log('upload file error:', error);
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      let fileNameOriginal = file.name;
      let extensionPos = fileNameOriginal.lastIndexOf(".");
      let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

      const newFileName = `stock-movement_${uuid4()}${fileType}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      setFileUpload(renamedFile);
      setFormulario(prevState => ({ ...prevState, documentFile: newFileName }));
    }
  };

  const cancelFile = () => {
    setFileUpload(null);
    setFormulario(prevState => ({ ...prevState, documentFile: "" }));
  }

  useEffect(() => {
    getSupplies();
    getDeposits();
    getMovementsType(true);
    getCampaigns();
  }, []);

  useEffect(() => {

    if (movementTypeSelected && movementTypeSelected.sumaStock === "Ambas")
      setShowSwitch(true)
    else {
      setFormulario((prevState) => ({
        ...prevState,
        isIncome: (movementTypeSelected?.sumaStock === "Suma")
      }));
      setShowSwitch(false);
    }

  }, [movementTypeSelected]);

  useEffect(() => {
    if (supplyId &&
      supplyId !== "" &&
      depositOrigin !== "" &&
      location !== "") {
      getNroLotsBySupplyAndDeposit(supplyId, depositOrigin, location);
    }
  }, [supplyId, depositOrigin, location]);


  return (
    <Container maxWidth="lg">
      <Loading
        key="loading-new-stockmovement"
        loading={isLoading || isLoadingSupplies || isLoadingDeposits || isLoadCampaigns}
      />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
      >
        <Box className="text-center">
          <SyncAltIcon />
        </Box>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{ mt: 1, mb: 7 }}
        >
          {t("new_stock_movement")}
        </Typography>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="flex-start"
        >
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="typeMovement">{t("movement_type")}</InputLabel>
              <Select
                labelId="typeMovement"
                name="typeMovement"
                value={formulario.typeMovement}
                label={t("movement_type")}
                onChange={onChangeMovementType}
              >
                {movementsType.map((movement) => (
                  <MenuItem key={movement._id} value={movement._id}>
                    {movement.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t("_reason")}
              name="detail"
              value={formulario.detail}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              variant="outlined"
              type="date"
              label={t("_date")}
              name="operationDate"
              value={formulario.operationDate}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              inputProps={{
                max: getShortDate(), // Establece la fecha mínima permitida como la fecha actual
              }}
              fullWidth
            />
          </Grid>
          {movementsType.filter(x => x.name === TypeMovement.TransferenciaDeposito).length ? (
            <>
              <Grid key="supply-transfer-deposit" item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="supply">{t("_supply")}</InputLabel>
                  <Select
                    key="select-supply-tranferencia"
                    labelId="supply"
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 248 }
                      }
                    }}
                    value={formulario.supplyId}
                    label={t("_supply")}
                    onChange={onChangeSupply}
                  >
                    {supplies.map((supply) => (
                      <MenuItem key={supply._id} value={supply._id}>
                        {`${supply.name} - ${supply.type}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body1" align="left">
                  <b>Tipo de insumo:</b> {supplySelected?.type}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" align="left">
                  <b>Descripcion:</b> {supplySelected?.description}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant="h5" align="left">
                  {t("_origin")}
                </Typography>
              </Grid>
              <Grid key="deposit-origin" item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="deposit">{t("_warehouse")}</InputLabel>
                  <Select
                    labelId="deposit"
                    name="origin"
                    value={formulario.depositId}
                    label={t("_warehouse")}
                    onChange={onChangeDeposit}
                  >
                    {deposits.map((deposit) => (
                      <MenuItem key={deposit._id} value={deposit._id}>
                        {deposit.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="location">{t("_location")}</InputLabel>
                  <Select
                    labelId="location"
                    name="origin"
                    value={formulario.location}
                    label={t("_location")}
                    onChange={onChangeLocation}
                  >
                    {depositSelected?.locations.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                {supplySelected?.stockByLot && (
                  <FormControl fullWidth>
                    {/* Cambiar esto a un mapeo de lots (depositId, supplyId, location) */}
                    <InputLabel id="lot">{t("lot_number")}</InputLabel>
                    <Select
                      labelId="lot"
                      name="nroLot"
                      value={formulario.nroLot}
                      label={t("lot_number")}
                      onChange={onChangeNroLot}
                    >
                      {stockByLots.map(({ nroLot }) => (
                        <MenuItem key={nroLot} value={nroLot}>
                          {nroLot}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  variant="outlined"
                  type="number"
                  label={t("_quantity")}
                  name="amount"
                  value={formulario.amount}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body1" align="left">
                  Unidad de Medida: <b>{supplySelected?.unitMeasurement}</b>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant="h5" align="left">
                  {t("_destination")}
                </Typography>
              </Grid>
              <Grid key="deposit-destination" item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="deposit-dest">{t("_warehouse")}</InputLabel>
                  <Select
                    labelId="deposit-dest"
                    name="destination"
                    value={depositDestinationSelected?._id}
                    label={t("_warehouse")}
                    onChange={onChangeDeposit}
                  >
                    {depositsToBeAllocated.map((deposit) => (
                      <MenuItem key={deposit._id} value={deposit._id}>
                        {deposit.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="location-dest">{t("_location")}</InputLabel>
                  <Select
                    labelId="location-dest"
                    name="destination"
                    value={locationDestinationSelected}
                    label={t("_location")}
                    onChange={onChangeLocation}
                  >
                    {depositDestinationSelected?.locations.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={3}>
                {showSwitch && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography variant="body1" display="inline-block">
                      {t("_output")}
                    </Typography>
                    <Switch
                      name="isIncome"
                      checked={formulario.isIncome}
                      onChange={handleCheckboxChange}
                    />
                    <Typography variant="body1" display="inline-block">
                      {t("_input")}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid key="supply-movement" item xs={12} sm={3}>
                <Autocomplete
                  loading={isLoadingSupplies}
                  value={{ label: supplySelected?.name || "", value: supplySelected?._id || "" }}
                  onChange={(_event, newValue) => {
                    const value = newValue?.value || "null";
                    const supplySelected = supplies.find((supply) => supply._id === value);
                    if (supplySelected && supplySelected._id) {
                      setFormulario((prevState) => ({
                        ...prevState,
                        supplyId: value,
                      }));
                      setSupplySelected(supplySelected);
                    }
                  }}
                  options={supplies.map((option) => ({ label: option.name, value: option._id || "" }))}
                  getOptionLabel={(option) => option.label}
                  disableClearable
                  renderInput={(params) => (
                    <TextField {...params} label={"Insumo"} variant="outlined" />
                  )}
                  fullWidth
                  ListboxProps={{
                    style: {
                      maxHeight: 248,
                      overflow: "auto",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <ListItemText
                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                    primary={<Typography variant='subtitle2'>Tipo de insumo:</Typography>}
                    secondary={
                      <Typography letterSpacing={1} variant='subtitle1'>
                        {supplySelected ? supplySelected.type : "-"}
                      </Typography>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="deposit">{t("_warehouse")}</InputLabel>
                  <Select
                    labelId="deposit"
                    name="origin"
                    value={formulario.depositId}
                    label={t("_warehouse")}
                    onChange={onChangeDeposit}
                  >
                    {deposits.map((deposit) => (
                      <MenuItem key={deposit._id} value={deposit._id}>
                        {deposit.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="location">{t("id_location")}</InputLabel>
                  <Select
                    labelId="location"
                    name="origin"
                    value={formulario.location}
                    label={t("id_location")}
                    onChange={onChangeLocation}
                  >
                    {depositSelected?.locations.map((loc) => (
                      <MenuItem key={loc} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {supplySelected?.stockByLot && (
                <>
                  <Grid item xs={6} sm={3}>
                    {formulario.isIncome ? (
                      <TextField
                        key="nroLot-input"
                        variant="outlined"
                        type="text"
                        label="Nro Lote"
                        name="nroLot"
                        value={formulario.nroLot}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth
                      />
                    ) : (
                      <FormControl key="nroLot-select" fullWidth>
                        {/* Cambiar esto a un mapeo de lots (depositId, supplyId, location) */}
                        <InputLabel id="lot">Nro Lote</InputLabel>
                        <Select
                          labelId="lot"
                          name="nroLot"
                          value={formulario.nroLot}
                          label="Nro Lote"
                          onChange={onChangeNroLot}
                        >
                          {stockByLots?.map(({ nroLot }) => (
                            <MenuItem key={nroLot} value={nroLot}>
                              {nroLot}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      variant="outlined"
                      type="date"
                      label="Fecha vencimiento"
                      name="dueDate"
                      value={formulario.dueDate}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                      }}
                      fullWidth
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={6} sm={2}>
                <TextField
                  variant="outlined"
                  type="number"
                  label="Cantidad"
                  name="amount"
                  value={formulario.amount}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <ListItemText
                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                    primary={<Typography variant='subtitle2'>UM:</Typography>}
                    secondary={
                      <Typography letterSpacing={1} variant='subtitle1'>
                        {supplySelected ? supplySelected?.unitMeasurement : "-"}
                      </Typography>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  variant="outlined"
                  type="text"
                  label={t("_receipt")}
                  name="voucher"
                  value={formulario.voucher}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <ListItemText
                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                    primary={<Typography variant='subtitle2'>Moneda</Typography>}
                    secondary={
                      <Typography letterSpacing={1} variant='subtitle1'>
                        {user?.currency}
                      </Typography>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  variant="outlined"
                  type="number"
                  label={t("total_value")}
                  name="totalValue"
                  value={formulario.totalValue}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl key="campaign-select" fullWidth>
                  <InputLabel id="campaign">{t("_campaign")}</InputLabel>
                  <Select
                    labelId="campaign"
                    name="campaignId"
                    value={formulario.campaignId}
                    label={t("_campaign")}
                    onChange={handleSelectChange}
                  >
                    {campaigns?.map((c) => (
                      <MenuItem key={c.campaignId} value={c.campaignId}>
                        {c.campaignId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4} sx={{ display: "flex", alignItems: "center", justifyContent: "start" }} >
                <Button
                  component="label"
                  variant="contained"
                  // tabIndex={-1}
                  // autoCapitalize=""
                  startIcon={<CloudUploadIcon />}
                // fullWidth
                >
                  Upload
                  <Input
                    type="file"
                    hidden
                    onChange={handleFileUpload} />
                </Button>
                {formulario.documentFile ? (
                  <Grid>
                    <label
                      title={formulario.documentFile}
                      style={{
                        margin: "10px",
                        width: "200px",
                        display: "inline-block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                      {formulario.documentFile}
                    </label>
                    <IconButton onClick={() => cancelFile()} color="error">
                      <CancelIcon fontSize="medium" />
                    </IconButton>
                  </Grid>
                ) :
                  <Typography variant="body1" sx={{
                    pl: 1,
                    display: "inline-block"
                  }}>
                    Ningún archivo seleccionado
                  </Typography>
                }
              </Grid>
            </>
          )}
        </Grid>
        <Grid
          container
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
          sx={{ mt: 3 }}
        >
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="inherit"
              onClick={onClickCancel}>
              {t("id_cancel")}
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              disabled={
                (!supplySelected ||
                  !depositSelected ||
                  !movementTypeSelected ||
                  !formulario.amount)
              }
              color="primary"
              onClick={onClickSave}>
              {t("_add")}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
