import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,

  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material';
import React, { ChangeEvent, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { ContractSaleCereal } from '../../interfaces/contract-sale-cereals';
import { Campaign, Crop } from '../../types';
import { FormValueState, useAppSelector } from '../../hooks';
import { Company } from '../../interfaces/company';


interface Props {
  formValues: FormValueState<ContractSaleCereal>;
  crops: Crop[];
  campaigns: Campaign[];
  companies: Company[];
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleCheckboxChange: ({ target }: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleFormValueChange: (key: string, value: string) => void;
}

//TODO: Cambiar los textos a idioma seleccionado


export const GeneralData: React.FC<Props> = ({
  formValues,
  campaigns,
  crops,
  companies,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
  handleFormValueChange
}) => {

  const { t } = useTranslation();
  const { user } = useAppSelector(state => state.auth);
  const { kg, quintalQuote, USDQuote } = formValues;

  const valueCurrency = useMemo(() => {
    if (formValues.kg.value && formValues.quintalQuote.value) {
      const value= Number(formValues.kg.value) * Number(formValues.quintalQuote.value) * 100;
      handleFormValueChange("amountValue", value.toString());
      return value;
    }
    return null;
  }, [kg, quintalQuote]);

  const valueUSD = useMemo(() => {
    if (formValues.kg.value && formValues.USDQuote.value) {
      return Number(formValues.kg.value) * Number(formValues.USDQuote.value);
    }
    return null;
  }, [kg, USDQuote]);

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      alignItems="center">
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle1'>Numero de Contrato</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1, borderRadius: 1 }}
            secondary={
              <Typography align='right' letterSpacing={1} variant='subtitle1'>
                {formValues.contractSaleNumber.value}
              </Typography>}
          />
        </FormControl>
        {/* <TextField
          variant="outlined"
          type="text"
          label={"Nro de Contrato"}
          value={formValues.contractSaleNumber.value}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        /> */}
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl key="campaign-select"
          error={formValues.campaignId.isError}
          fullWidth>
          <InputLabel id="campaign">Campaña</InputLabel>
          <Select
            labelId="campaign"
            name="campaignId"
            value={formValues.campaignId.value}
            label="Campaña"
            onChange={handleSelectChange}
          >
            {campaigns?.map((c) => (
              <MenuItem key={c.name} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formValues.campaignId.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl key="company-select"
          error={formValues.companyId.isError}
          fullWidth>
          <InputLabel id="contract-corporate">Sociedad</InputLabel>
          <Select
            labelId="contract-corporate"
            name="companyId"
            value={formValues.companyId.value}
            label="Sociedad"
            onChange={handleSelectChange}
          >
            {companies?.map((item) => (
              <MenuItem key={item._id} value={item._id}>
                {item.socialReason}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formValues.companyId.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl key="crop-select" error={formValues.cropId.isError} fullWidth>
          <InputLabel id="crop">{t("_crop")}</InputLabel>
          <Select
            labelId="crop"
            name="cropId"
            value={formValues.cropId.value}
            label={t("_crop")}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 248 }//Tamaño para 5 opciones
              }
            }}
            onChange={handleSelectChange}
          >
            {crops?.map((crop) => (
              <MenuItem key={crop._id} value={crop._id}>
                {crop["descriptionES"]} {/* Cambiar por idioma seleccionado */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControlLabel
          key="checkbox-contract-open"
          control={
            <Checkbox
              name="isOpenContract"
              checked={formValues.isOpenContract.value}
              onChange={(event) => handleCheckboxChange(event, true)}
            />
          }
          label="Abierto"
          labelPlacement="start"
        />
        <FormControlLabel
          key="checkbox-contract-close"
          control={
            <Checkbox
              name="isOpenContract"
              checked={!formValues.isOpenContract.value}
              onChange={(event) => handleCheckboxChange(event, false)}
            />
          }
          label="Cerrado"
          labelPlacement="start"
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="date"
          label={"Fecha"}
          value={formValues.dateCreated.value}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="text"
          label={"Tipo Contrato"}
          name={"contractType"}
          error={formValues.contractType.isError}
          helperText={formValues.contractType.message}
          onChange={handleInputChange}
          value={formValues.contractType.value}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="number"
          label={"Kms"}
          name={"kms"}
          error={formValues.kms.isError}
          helperText={formValues.kms.message}
          onChange={handleInputChange}
          value={formValues.kms.value}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="number"
          label={"Kilos"}
          name={"kg"}
          error={formValues.kg.isError}
          helperText={formValues.kg.message}
          value={formValues.kg.value}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle1'>Moneda</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1, borderRadius: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {user?.currency || "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="number"
          label={"Cotizacion Quintal"}
          name={"quintalQuote"}
          error={formValues.quintalQuote.isError}
          helperText={formValues.quintalQuote.message}
          value={formValues.quintalQuote.value}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>Valor Moneda</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {valueCurrency ? valueCurrency : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="number"
          label={"Cotizacion U$D/Kg"}
          name={"USDQuote"}
          error={formValues.USDQuote.isError}
          helperText={formValues.USDQuote.message}
          value={formValues.USDQuote.value}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>Valor U$D</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {valueUSD ? valueUSD : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>

    </Grid>
  )
}
