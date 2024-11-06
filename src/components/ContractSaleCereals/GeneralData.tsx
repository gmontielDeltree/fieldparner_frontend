import { Checkbox, FormControl, FormControlLabel, FormHelperText, Grid, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import React, { ChangeEvent, useState } from 'react';

import { getShortDate } from '../../helpers/dates';

import { useTranslation } from 'react-i18next';
import { ContractSaleCereals } from '../../interfaces/contract-sale-cereals';
import { Campaign, Crops, Supply } from '../../types';
import { FormValueState } from '../../hooks';


interface Props {
  formValues: FormValueState<ContractSaleCereals>;
  crops: Crops[];
  campaigns: Campaign[];
  // listFields: Field[];
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleCheckboxChange: ({ target }: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}


export const GeneralData: React.FC<Props> = ({
  formValues,
  campaigns,
  crops,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange
}) => {

  // const onChangeField = ({ target }: SelectChangeEvent) => {
  //     const fieldId = target.value;
  //     const fieldSelected = listFields.find(f => f._id === fieldId);

  //     if (!fieldSelected) return;

  //     setFormValues((prevState) => ({ ...prevState, fieldId }));
  //     setFieldSelected(fieldSelected);
  //     setLotSelected(null);
  // }

  // const onChangeLot = ({ target }: SelectChangeEvent) => {
  //     const lotId = target.value;
  //     const lotSelected = fieldSelected?.lotes.find(l => l.properties.nombre === lotId);

  //     if (!lotSelected) return;

  //     setLotSelected(lotSelected);
  //     setFormValues((prevState) => ({ ...prevState, lotId }));
  // }

  // const onChangeCrop = ({ target }: SelectChangeEvent) => {
  //     const { value } = target;
  //     const cropSelected = crops.find((crop) => crop._id === value);

  //     if (cropSelected?._id) {
  //         setFormValues((prevState) => ({
  //             ...prevState,
  //             cropId: value, //Insumo id
  //             cultive: cropSelected.name || "",
  //             supply: cropSelected
  //         }));
  //     }
  // };
  const { t } = useTranslation();

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      alignItems="center">
      {/* <Grid item xs={12} display="flex" alignItems="center" mb={2}>
        <FolderOpenIcon sx={{ mx: 1 }} />
        <Typography variant="h5">{t("general_data")}</Typography>
      </Grid> */}
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="text"
          label={"Nro de Contrato"}
          value={formValues.nroContractSale.value}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          disabled
          fullWidth
        />
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
        <FormControl key="contract-corporate-select"
          error={formValues.contractCorporateId.isError}
          fullWidth>
          <InputLabel id="contract-corporate">Sociedad</InputLabel>
          <Select
            labelId="contract-corporate"
            name="contractCorporateId"
            value={formValues.contractCorporateId.value}
            label="Sociedad"
            onChange={handleSelectChange}
          >
            {["123", "Pepe"]?.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formValues.contractCorporateId.message}</FormHelperText>
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
        <TextField
          variant="outlined"
          type="fecha"
          label={"Fecha"}
          value={formValues.dateCreated.value}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="fecha"
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
          type="text"
          label={"Kms"}
          name={"kms"}
          error={formValues.kms.isError}
          helperText={formValues.kms.message}
          onChange={handleInputChange}
          value={formValues.kms.value}
          fullWidth
        />
      </Grid>
      <Grid item xs={6} sm={6}>

      </Grid>
      {/* <Grid item sm={4} /> */}
    </Grid>
  )
}
