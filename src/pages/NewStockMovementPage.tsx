import React, { useEffect, useState, useMemo } from "react";
import { Loading } from "../components";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { SyncAlt as SyncAltIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDeposit, useForm, useStockMovement, useSupply } from "../hooks";
import {
  CurrencyCode,
  Deposit,
  Lot,
  StockMovement,
  Supply,
  TypeMovement,
  TypeMovements,
} from "../types";
import { getShortDate } from "../helpers/dates";

const initialForm: StockMovement = {
  typeMovement: TypeMovement.Ajustes,
  amount: 0,
  nroLot: "",
  creationDate: new Date().toLocaleString(),
  campaign: 0,
  currency: "",
  depositId: "",
  detail: "",
  dueDate: getShortDate(),
  hours: "",
  movement: "Manual",
  operationDate: getShortDate(),
  supplyId: "",
  totalValue: 0,
  voucher: "",
  isIncome: false,
  accountId: "",
};

const movementsShowSwitch = [
  TypeMovement.Ajustes.toString(),
  TypeMovement.Prestamos.toString(),
  TypeMovement.TransferenciaDeposito.toString(),
];

export const NewStockMovementPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [depositIdDestination, setDepositIdDestination] = useState("");
  const [lotSelected, setLotSelected] = useState<Lot | null>(null);
  const { isLoading, addNewStockMovement } = useStockMovement();
  const { isLoading: isLoadingSupplies, supplies, getSupplies } = useSupply();
  const { isLoading: isLoadingDeposits, deposits, getDeposits } = useDeposit();
  const { typeMovement, depositId: depositOrigin } = formulario;

  const depositsToBeAllocated = useMemo(() => {
    return deposits.filter(
      (d) => d._id && d._id.toLowerCase() !== depositOrigin.toLowerCase()
    );
  }, [deposits, depositOrigin]);

  const onClickCancel = () => navigate("/init/overview/stock-movements");

  const onClickSave = () => {
    // console.log("formulario", formulario);
    if (supplySelected && depositSelected) {
      addNewStockMovement(formulario, supplySelected, depositIdDestination);
      reset();
    }
  };

  const onChangeSupply = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    // const supplySelected = JSON.parse(value) as Supply;
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
      setDepositIdDestination(value);
    }
  };

  const onChangeLot = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    if (!depositSelected) return;
    const lotSelected = depositSelected.lots.find(
      (lot) => lot.nro.toLowerCase() === value.toLowerCase()
    );
    if (!lotSelected) return;
    setFormulario((prevState) => ({ ...prevState, nroLot: value }));
    setLotSelected(lotSelected);
  };

  useEffect(() => {
    getSupplies();
    getDeposits();
  }, []);

  useEffect(() => {
    if (
      typeMovement.toString() !== "" &&
      movementsShowSwitch.includes(typeMovement.toString())
    )
      setShowSwitch(true);
    else {
      setFormulario((prevState) => ({
        ...prevState,
        isIncome: typeMovement.includes(TypeMovement.Compra.toString()),
      }));
      setShowSwitch(false);
    }
  }, [typeMovement]);

  return (
    <Container maxWidth="lg">
      <Loading
        key="loading-new-stockmovement"
        loading={isLoading || isLoadingSupplies || isLoadingDeposits}
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
          Nuevo Movimiento de Stock
        </Typography>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="flex-start"
        >
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="typeMovement">Tipo de Movimiento</InputLabel>
              <Select
                labelId="typeMovement"
                name="typeMovement"
                value={formulario.typeMovement}
                label="Tipo de Movimiento"
                onChange={handleSelectChange}
              >
                {TypeMovements.map((movement) => (
                  <MenuItem key={movement} value={movement}>
                    {movement}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              type="text"
              label="Motivo"
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
              label="Fecha"
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
          {typeMovement.includes(TypeMovement.TransferenciaDeposito) ? (
            <>
              <Grid key="supply-transfer-deposit" item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="supply">Insumo</InputLabel>
                  <Select
                    key="select-supply-tranferencia"
                    labelId="supply"
                    // name="supply"
                    value={formulario.supplyId}
                    label="Insumo"
                    onChange={onChangeSupply}
                  >
                    {supplies.map((supply) => (
                      <MenuItem key={supply._id} value={supply._id}>
                        {supply.name}
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
                  Origen
                </Typography>
              </Grid>
              <Grid key="deposit-origin" item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="deposit">Deposito</InputLabel>
                  <Select
                    labelId="deposit"
                    name="origin"
                    value={formulario.depositId}
                    label="Deposito"
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
              {supplySelected?.stockByLot && (
                <>
                  <Grid item xs={6} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel id="lot">Lote</InputLabel>
                      <Select
                        labelId="lot"
                        name="nroLot"
                        value={formulario.nroLot}
                        label="Lote"
                        onChange={onChangeLot}
                      >
                        {depositSelected?.lots.map((lot) => (
                          <MenuItem key={lot.nro} value={lot.nro}>
                            {lot.nro}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <TextField
                      variant="outlined"
                      type="text"
                      label="Ubicacion"
                      value={lotSelected?.location}
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
              <Grid item xs={12} sm={4}>
                <Typography variant="body1" align="left">
                  Unidad de Medida: <b>{supplySelected?.unitMeasurement}</b>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant="h5" align="left">
                  Destino
                </Typography>
              </Grid>
              <Grid key="deposit-destination" item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="deposit-dest">Deposito</InputLabel>
                  <Select
                    labelId="deposit-dest"
                    name="destination"
                    value={depositIdDestination}
                    label="Deposito"
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
                      Salida
                    </Typography>
                    <Switch
                      name="isIncome"
                      checked={formulario.isIncome}
                      onChange={handleCheckboxChange}
                    />
                    <Typography variant="body1" display="inline-block">
                      Entrada
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid key="supply-movement" item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="supply">Insumo</InputLabel>
                  <Select
                    key="select-supply-movement"
                    labelId="supply"
                    value={formulario.supplyId}
                    label="Insumo"
                    onChange={onChangeSupply}
                  >
                    {supplies.map((supply) => (
                      <MenuItem key={supply._id} value={supply._id}>
                        {supply.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body1" align="left">
                  Tipo de insumo: <b>{supplySelected?.type}</b>
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="deposit">Deposito</InputLabel>
                  <Select
                    labelId="deposit"
                    name="origin"
                    value={formulario.depositId}
                    label="Deposito"
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
              {supplySelected?.stockByLot && (
                <Grid item xs={6} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel id="lot">Lote</InputLabel>
                    <Select
                      labelId="lot"
                      name="nroLot"
                      value={formulario.nroLot}
                      label="Lote"
                      onChange={onChangeLot}
                    >
                      {depositSelected?.lots.map((lot) => (
                        <MenuItem key={lot.nro} value={lot.nro}>
                          {lot.nro}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={2}>
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
              {supplySelected?.stockByLot && (
                <Grid item xs={6} sm={4}>
                  <TextField
                    variant="outlined"
                    type="text"
                    label="Ubicacion"
                    value={lotSelected?.location}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                  />
                </Grid>
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
                <Typography variant="body1" align="left">
                  UM: <b>{supplySelected?.unitMeasurement}</b>
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  variant="outlined"
                  type="text"
                  label="Comprobante"
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
                  <InputLabel id="currency">Moneda</InputLabel>
                  <Select
                    labelId="currency"
                    name="currency"
                    value={formulario.currency}
                    label="Moneda"
                    onChange={handleSelectChange}
                  >
                    <MenuItem key={CurrencyCode.ARG} value={CurrencyCode.ARG}>
                      {CurrencyCode.ARG.toString()}
                    </MenuItem>
                    <MenuItem key={CurrencyCode.BRA} value={CurrencyCode.BRA}>
                      {CurrencyCode.BRA.toString()}
                    </MenuItem>
                    <MenuItem key={CurrencyCode.CHL} value={CurrencyCode.CHL}>
                      {CurrencyCode.CHL.toString()}
                    </MenuItem>
                    <MenuItem key={CurrencyCode.USA} value={CurrencyCode.USA}>
                      {CurrencyCode.USA.toString()}
                    </MenuItem>
                    <MenuItem key={CurrencyCode.EURO} value={CurrencyCode.EURO}>
                      {CurrencyCode.EURO.toString()}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  variant="outlined"
                  type="number"
                  label="Valor Total"
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
                <TextField
                  variant="outlined"
                  type="number"
                  label="Campaña"
                  name="campaign"
                  value={formulario.campaign}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
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
            <Button onClick={onClickCancel}>Cancelar</Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" color="primary" onClick={onClickSave}>
              Agregar
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
