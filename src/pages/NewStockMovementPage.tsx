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
  StockMovement,
  Supply,
  TypeMovement,
  TypeMovements,
  // TypeSupplies,
  UnidadesDeMedida,
} from "../types";
import { getShortDate } from "../helpers/dates";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import dayjs from "dayjs";

const initialForm: StockMovement = {
  typeMovement: "",
  amount: 0,
  batch: "",
  campaign: 0,
  currency: "",
  deposit: "",
  detail: "",
  dueDate: "",
  hours: "",
  movement: "Manual",
  operationDate: getShortDate(),
  supply: "",
  typeSupply: "",
  ubication: "",
  unitMeasurement: "",
  totalValue: 0,
  voucher: "",
  isIncome: false,
  depositDestination: "",
};

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
  const { isLoading, addNewStockMovement } = useStockMovement();
  const { isLoading: isLoadingSupplies, supplies, getSupplies } = useSupply();
  const { isLoading: isLoadingDeposits, deposits, getDeposits } = useDeposit();
  const { typeMovement, deposit: depositOrigin } = formulario;

  const depositsToBeAllocated = useMemo(() => {
    return deposits.filter(
      (d) => d.descripcion.toLowerCase() !== depositOrigin.toLowerCase()
    );
  }, [deposits, depositOrigin]);

  const onClickCancel = () => navigate("/init/overview/stock-movements");

  const onClickSave = () => {
    // console.log("formulario", formulario);
    addNewStockMovement(formulario);
    reset();
  };

  const onChangeSupply = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    // const supplySelected = JSON.parse(value) as Supply;
    const supplySelected = supplies.find((supply) => supply.insumo === value);
    if (supplySelected) {
      setFormulario((prevState) => ({
        ...prevState,
        supply: supplySelected?.insumo,
        typeSupply: supplySelected.tipo,
      }));
      setSupplySelected(supplySelected);
    }
  };

  useEffect(() => {
    getSupplies();
    getDeposits();
  }, []);

  useEffect(() => {
    const movementsShowSwitch = [
      TypeMovement.Ajustes.toString(),
      TypeMovement.Prestamos.toString(),
      TypeMovement.TransferenciaDeposito.toString(),
    ];
    if (typeMovement !== "" && movementsShowSwitch.includes(typeMovement))
      setShowSwitch(true);
    else {
      setFormulario((prevState) => ({
        ...prevState,
        isIncome: !typeMovement.includes(TypeMovement.Compra.toString()),
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
                max: getShortDate() // Establece la fecha mínima permitida como la fecha actual
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
                    value={formulario.supply}
                    label="Insumo"
                    onChange={onChangeSupply}
                  >
                    {supplies.map((supply) => (
                      <MenuItem key={supply._id} value={supply.insumo}>
                        {supply.insumo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body1" align="left">
                  <b>Tipo de insumo:</b> {supplySelected?.tipo}
                </Typography>
                {/* <FormControl fullWidth>
              <InputLabel id="tipo-insumo">Tipo de Insumo: {TypeSupplies[1]}</InputLabel>
              <Select
                labelId="tipo-insumo"
                name="typeSupply"
                value={formulario.typeSupply}
                label="Tipo de Insumo"
                onChange={handleSelectChange}
              >
                {TypeSupplies.map((supply) => (
                  <MenuItem key={supply} value={supply}>
                    {supply}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" align="left">
                  <b>Descripcion:</b> {supplySelected?.descripcion}
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
                    name="deposit"
                    value={formulario.deposit}
                    label="Deposito"
                    onChange={handleSelectChange}
                  >
                    {deposits.map((deposit) => (
                      <MenuItem key={deposit._id} value={deposit.descripcion}>
                        {deposit.descripcion}
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
                  name="ubication"
                  value={formulario.ubication}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  variant="outlined"
                  type="text"
                  label="Lote"
                  name="batch"
                  value={formulario.batch}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="unidadMedida">Unidad de medida</InputLabel>
                  <Select
                    labelId="unidadMedida"
                    name="unitMeasurement"
                    value={formulario.unitMeasurement}
                    label="Unidad de medida"
                    onChange={handleSelectChange}
                  >
                    {UnidadesDeMedida.map((um) => (
                      <MenuItem key={um} value={um}>
                        {um}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
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
              <Grid item xs={12} sm={12}>
                <Typography variant="h5" align="left">
                  Destino
                </Typography>
              </Grid>
              <Grid key="deposit-destination" item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="deposit">Deposito</InputLabel>
                  <Select
                    labelId="deposit"
                    name="depositDestination"
                    value={formulario.depositDestination}
                    label="Deposito"
                    onChange={handleSelectChange}
                  >
                    {depositsToBeAllocated.map((deposit) => (
                      <MenuItem key={deposit._id} value={deposit.descripcion}>
                        {deposit.descripcion}
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
                      Entrada
                    </Typography>
                    <Switch
                      name="isIncome"
                      checked={formulario.isIncome}
                      onChange={handleCheckboxChange}
                    />
                    <Typography variant="body1" display="inline-block">
                      Salida
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
                    // name="supply"
                    value={formulario.supply}
                    label="Insumo"
                    onChange={onChangeSupply}
                  >
                    {supplies.map((supply) => (
                      <MenuItem key={supply._id} value={supply.insumo}>
                        {supply.insumo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body1" align="center">
                  Tipo de insumo: <b>{supplySelected?.tipo}</b>
                </Typography>
                {/* <FormControl fullWidth>
              <InputLabel id="tipo-insumo">Tipo de Insumo: {TypeSupplies[1]}</InputLabel>
              <Select
                labelId="tipo-insumo"
                name="typeSupply"
                value={formulario.typeSupply}
                label="Tipo de Insumo"
                onChange={handleSelectChange}
              >
                {TypeSupplies.map((supply) => (
                  <MenuItem key={supply} value={supply}>
                    {supply}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="deposit">Deposito</InputLabel>
                  <Select
                    labelId="deposit"
                    name="deposit"
                    value={formulario.deposit}
                    label="Deposito"
                    onChange={handleSelectChange}
                  >
                    {deposits.map((deposit) => (
                      <MenuItem key={deposit._id} value={deposit.descripcion}>
                        {deposit.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  variant="outlined"
                  type="text"
                  label="Ubicacion"
                  name="ubication"
                  value={formulario.ubication}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  variant="outlined"
                  type="text"
                  label="Lote"
                  name="batch"
                  value={formulario.batch}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="unidadMedida">Unidad de medida</InputLabel>
                  <Select
                    labelId="unidadMedida"
                    name="unitMeasurement"
                    value={formulario.unitMeasurement}
                    label="Unidad de medida"
                    onChange={handleSelectChange}
                  >
                    {UnidadesDeMedida.map((um) => (
                      <MenuItem key={um} value={um}>
                        {um}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
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
