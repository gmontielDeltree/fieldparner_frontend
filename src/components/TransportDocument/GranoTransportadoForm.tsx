import React, { useState, useEffect } from 'react'
import { TransportDocumentFormProps } from './type';
import { Box, FormControl, FormHelperText, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, styled, TextField, Typography } from '@mui/material';
import { Loading } from '../Loading';
import { getLocalityAndStateByZipCode } from '../../utils/getDataZipCode';
import { CountryCode, ItemZipCode } from '../../types';
import { useTranslation } from "react-i18next";


const TextFieldGray = styled(TextField)(() => ({
  backgroundColor: "#f5f5f5",
  fontWeight: 600
}));

export const GranoTransportadoForm: React.FC<TransportDocumentFormProps> = ({
  formValues,
  selectedFieldOutput,
  contractSales,
  handleInputChange,
  handleSelectChange
}) => {
  const { t } = useTranslation();

  const { cpSalidaCampo } = formValues;
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [dataZipCode, setDataZipCode] = useState<ItemZipCode | null>(null);

  const getLocalityAndState = async (zipCode: string) => {
    setLoadingZipCode(true);
    try {
      const localityAndStates = await getLocalityAndStateByZipCode(
        CountryCode.ARGENTINA,
        zipCode
      );

      if (localityAndStates?.length) setDataZipCode(localityAndStates[0]);

      setLoadingZipCode(false);
    } catch (error) {
      setLoadingZipCode(false);
      console.log(error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (cpSalidaCampo.value !== "")
        getLocalityAndState(cpSalidaCampo.value);
      else
        setDataZipCode(null);

    }, 1000); // 1000 ms = 1 segundo

    return () => clearTimeout(delayDebounceFn);
  }, [cpSalidaCampo]);


  return (
    <Box className="grano-transportado-form">
      <Loading loading={loadingZipCode} />
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <TextFieldGray
            variant='outlined'
            label={t('campaign')}
            value={selectedFieldOutput?.campaign?.name || selectedFieldOutput?.campaignId || "-"}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextFieldGray
            variant='outlined'
            label={t('crop')}
            value={selectedFieldOutput?.crop?.descriptionES || selectedFieldOutput?.crop?.crop || "-"}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl
            key="contract-select"
            fullWidth
            error={formValues.contractSaleNumber.isError}
          >
            <InputLabel id="contract">{t('cerealSaleContract')}</InputLabel>
            <Select
              labelId="contract"
              name="contractSaleNumber"
              value={formValues.contractSaleNumber.value}
              label={t('cerealSaleContract')}
              onChange={handleSelectChange}
            >
              {contractSales?.map((x) => (
                <MenuItem key={x._id} value={x.contractSaleNumber}>
                  {x.contractSaleNumber}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formValues.contractSaleNumber.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextFieldGray
            variant='outlined'
            label={t('fieldExit')}
            value={selectedFieldOutput?.field?.nombre || "-"}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <ListItemText
              primary={<Typography variant='subtitle2'>{t('kilograms')}</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {selectedFieldOutput?.kgNet || "-"}
                </Typography>}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            variant="outlined"
            type="text"
            label={t('postalCode')}
            name="cpSalidaCampo"
            error={formValues.cpSalidaCampo.isError}
            helperText={formValues.cpSalidaCampo.message}
            value={formValues.cpSalidaCampo.value}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <ListItemText
              primary={<Typography variant='subtitle2'>{t('locality')}</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {dataZipCode ? dataZipCode.locality : "-"}
                </Typography>}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <ListItemText
              primary={<Typography variant='subtitle2'>{t('district')}</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {"-"}
                </Typography>}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <ListItemText
              primary={<Typography variant='subtitle2'>{t('province')}</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {dataZipCode ? dataZipCode.state : "-"}
                </Typography>}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Typography variant='h6' sx={{ my: 3 }}>{t('loadWeightedAtDestination')}</Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <TextField
            variant="outlined"
            type="number"
            label={t('estimatedKilograms')}
            name="kgEstimado"
            error={formValues.kgEstimado.isError}
            helperText={formValues.kgEstimado.message}
            inputProps={{
              min: 0,
            }}
            value={formValues.kgEstimado.value}
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
            type="number"
            label={t('grossKilograms')}
            name="kgBruto"
            error={formValues.kgBruto.isError}
            helperText={formValues.kgBruto.message}
            inputProps={{ min: 0 }}
            value={formValues.kgBruto.value}
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
            type="number"
            label={t('tareKilograms')}
            name="kgTara"
            error={formValues.kgTara.isError}
            helperText={formValues.kgTara.message}
            inputProps={{ min: 0 }}
            value={formValues.kgTara.value}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <ListItemText
              primary={<Typography variant='subtitle2'>{t('net')}</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {(formValues.kgBruto.value - formValues.kgTara.value) || "-"}
                </Typography>}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            variant="outlined"
            type="text"
            label={t('observations')}
            name="observaciones"
            multiline
            value={formValues.observaciones.value}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  )
}