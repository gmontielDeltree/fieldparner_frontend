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
import { Campaign, Crop, CurrencyCode } from '../../types';
import { FormValueState, useAppSelector } from '../../hooks';
import { Company } from '../../interfaces/company';

import { AutocompleteCrop } from '../Autocomplete';
import { Helper } from '../../helpers/helper';


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
    const valueQuintal = 100;
    if (formValues.kg.value && formValues.quintalQuote.value) {
      const value = (Number(formValues.kg.value) / valueQuintal) * Number(formValues.quintalQuote.value);
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
            primary={<Typography variant='subtitle1'>{t("contract_sale_number")}</Typography>}
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
          <InputLabel id="campaign">{t("_campaign")}</InputLabel>
          <Select
            labelId="campaign"
            name="campaignId"
            value={formValues.campaignId.value}
            label={t("_campaign")}
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
          <InputLabel id="contract-corporate">{t("society")}</InputLabel>
          <Select
            labelId="contract-corporate"
            name="companyId"
            value={formValues.companyId.value}
            label={t("society")}
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
        {
          <AutocompleteCrop
            value={crops.find(s => s._id === formValues?.cropId?.value) || null}
            options={crops}
            onChange={(newValue) => {
              if (newValue?._id) {
                handleFormValueChange("cropId", newValue._id);
              }
            }}
          />
        }
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
          label={t("Open")}
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
          label={t("Closed")}
          labelPlacement="start"
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="date"
          label={t("date_created")}
          name="dateCreated"
          value={formValues.dateCreated.value}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="text"
          label={t("contract_type")}
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
          label={t("kms_label")}
          name={"kms"}
          error={formValues.kms.isError}
          helperText={formValues.kms.message}
          inputProps={{ style: { textAlign: 'right' } }}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              handleFormValueChange("kms", "");
            } else {
              const numValue = Number(value);
              handleFormValueChange("kms", numValue >= 0 ? numValue.toString() : "0");
            }
          }}
          value={formValues.kms.value}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="number"
          label={t("kilograms")}
          name={"kg"}
          error={formValues.kg.isError}
          helperText={formValues.kg.message}
          value={formValues.kg.value}
          inputProps={{ style: { textAlign: 'right' } }}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              handleFormValueChange("kg", "");
            } else {
              const numValue = Number(value);
              handleFormValueChange("kg", numValue >= 0 ? numValue.toString() : "0");
            }
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle1'>{t("_currency")}</Typography>}
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
          label={t("quintal_quote")}
          name={"quintalQuote"}
          error={formValues.quintalQuote.isError}
          helperText={formValues.quintalQuote.message}
          value={formValues.quintalQuote.value}
          inputProps={{ style: { textAlign: 'right' } }}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              handleFormValueChange("quintalQuote", "");
            } else {
              const numValue = Number(value);
              handleFormValueChange("quintalQuote", numValue >= 0 ? numValue.toString() : "0");
            }
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>{t("currency_value")}</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography align='right' letterSpacing={1} variant='subtitle1'>
                {valueCurrency ? Helper.parseDecimalPointToComaWithCurrency(valueCurrency, user?.currency || "") : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="number"
          label={t("usd_quote_per_kg")}
          name={"USDQuote"}
          error={formValues.USDQuote.isError}
          helperText={formValues.USDQuote.message}
          value={formValues.USDQuote.value}
          inputProps={{ style: { textAlign: 'right' } }}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              handleFormValueChange("USDQuote", "");
            } else {
              const numValue = Number(value);
              handleFormValueChange("USDQuote", numValue >= 0 ? numValue.toString() : "0");
            }
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>{t("usd_value")}</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography align='right' letterSpacing={1} variant='subtitle1'>
                {valueUSD ? Helper.parseDecimalPointToComaWithCurrency(valueUSD, CurrencyCode.USA || "") : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>

    </Grid>
  )
}
