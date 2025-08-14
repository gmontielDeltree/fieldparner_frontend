import React, { useEffect, useState, useMemo } from 'react';
import { Loading } from '../../components';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
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
} from '@mui/material';
import {
  SyncAlt as SyncAltIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  FormValueState,
  useAppSelector,
  useCampaign,
  useDeposit,
  useFormValues,
  useStockMovement,
  useSupply,
} from '../../hooks';
import { Deposit, Movement, MovementType, StockMovement, Supply, TypeMovement } from '../../types';
import { getShortDate } from '../../helpers/dates';
import { useTranslation } from 'react-i18next';

import { uploadFile } from '../../helpers/fileUpload';
import { useFileUploadHook, BasicFileInfo } from '../../components/NuevoVehiculo/useDatosGenerales';
import { AutocompleteSupply } from '../../components/Autocomplete';

const initialForm: FormValueState<StockMovement> = {
  accountId: { value: '', isError: false, message: '', required: false }, // get from user
  userId: { value: '', isError: false, message: '', required: false }, // get from user
  amount: { value: 0, isError: false, message: '', required: true },
  campaignId: { value: '', isError: false, message: '', required: true },
  cropId: { value: '', isError: false, message: '', required: false },
  typeMovement: { value: TypeMovement.Ajustes, isError: false, message: '', required: true },
  nroLot: { value: '', isError: false, message: '', required: false },
  creationDate: { value: getShortDate(), isError: false, message: '', required: false },
  currency: { value: '', isError: false, message: '', required: false }, // get from user
  depositId: { value: '', isError: false, message: '', required: true },
  location: { value: '', isError: false, message: '', required: true },
  detail: { value: '', isError: false, message: '', required: false },
  dueDate: { value: getShortDate(), isError: false, message: '', required: false },
  hours: { value: 0, isError: false, message: '', required: false },
  isCrop: { value: false, isError: false, message: '', required: false },
  isIncome: { value: false, isError: false, message: '', required: false },
  movement: { value: Movement.Manual, isError: false, message: '', required: false },
  operationDate: { value: getShortDate(), isError: false, message: '', required: false },
  supplyId: { value: '', isError: false, message: '', required: true },
  totalValue: { value: 0, isError: false, message: '', required: false },
  voucher: { value: '', isError: false, message: '', required: false },
  documentFile: {
    value: {
      originalName: '',
      uniqueName: '',
    },
    isError: false,
    message: '',
    required: false,
  },
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
    getMovementsType,
  } = useStockMovement();
  const { isLoading: isLoadingSupplies, supplies, getSupplies } = useSupply();
  const { isLoading: isLoadingDeposits, deposits, getDeposits } = useDeposit();
  const { isLoading: isLoadCampaigns, campaigns, getCampaigns } = useCampaign();
  const { t } = useTranslation();
  const {
    formValues,
    setFormValues,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleFormValueChange,
    reset,
    getMapFormValues,
  } = useFormValues<StockMovement>(initialForm);

  const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
  const [showSwitch, setShowSwitch] = useState(true);
  const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);
  const [depositDestinationSelected, setDepositDestinationSelected] = useState<Deposit | null>(
    null,
  );
  const [locationDestinationSelected, setLocationDestinationSelected] = useState('');
  const [movementTypeSelected, setMovementTypeSelected] = useState<MovementType | null>(null);
  const [documentFile, setDocumentFile] = React.useState<File | null>(null);

  const { depositId: depositOrigin, supplyId, location } = formValues;
  const {
    // fileDisplayName,
    handleFileUpload,
    handleRemoveFile,
  } = useFileUploadHook({
    setFilesUpload: (file: File | BasicFileInfo) => setDocumentFile(file as File),
    onFileChange: dataFileName => {
      //  handleFormValueChange("documentFile", fileName)
      setFormValues(prev => ({
        ...prev,
        documentFile: { ...prev.documentFile, value: dataFileName },
      }));
    },
    cancelFile: () => setDocumentFile(null),
    onFileRemove: () => {
      // handleFormValueChange("documentFile", "")
      setFormValues(prev => ({
        ...prev,
        documentFile: {
          ...prev.documentFile,
          value: { originalName: '', uniqueName: '' },
        },
      }));
    },
    fileTypePrefix: 'stock-movement',
    acceptedFileTypes: 'application/pdf,image/*',
    returnBasicFile: false,
    initialFileName: formValues.documentFile?.value?.originalName,
    singleFile: true,
  });

  const depositsToBeAllocated = useMemo(() => {
    return deposits.filter(d => d._id && d._id.toLowerCase() !== depositOrigin.value.toLowerCase());
  }, [deposits, depositOrigin]);

  const onClickCancel = () => navigate('/init/overview/stock-movements');

  const createMovement = async () => {
    try {
      let destination = depositDestinationSelected?._id
        ? {
            depositId: depositDestinationSelected._id,
            location: locationDestinationSelected,
          }
        : undefined;

      if (!supplySelected || !depositSelected || !movementTypeSelected) return;
      const mappedForm = getMapFormValues() as StockMovement;

      uploadDocumentFile();
      addNewStockMovement(
        {
          ...mappedForm,
          typeMovement: movementTypeSelected.name,
        },
        supplySelected,
        destination,
      );
      reset();
    } catch (error) {
      console.log('createMovement error:', error);
    }
  };

  const onChangeMovementType = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    const movementTypeSelected = movementsType.find(x => x._id === value);
    if (movementTypeSelected) setMovementTypeSelected(movementTypeSelected);

    handleFormValueChange('typeMovement', value);
  };

  // const onChangeSupply = ({ target }: SelectChangeEvent) => {
  //   const { value } = target;

  //   const supplySelected = supplies.find((supply) => supply._id === value);
  //   if (supplySelected && supplySelected._id) {
  //     handleFormValueChange("supplyId", value);
  //     setSupplySelected(supplySelected);
  //   }
  // };

  const onChangeDeposit = ({ target }: SelectChangeEvent) => {
    const { value, name } = target;
    const depositSelected = deposits.find(deposit => deposit._id === value);

    if (depositSelected && name === 'origin') {
      handleFormValueChange('depositId', value);
      setDepositSelected(depositSelected);
    }
    if (depositSelected && name === 'destination') {
      setDepositDestinationSelected(depositSelected);
    }
  };

  const onChangeLocation = ({ target }: SelectChangeEvent) => {
    const { value, name } = target;
    if (name === 'origin') {
      if (!depositSelected) return;
      handleFormValueChange('location', value);
    } else {
      if (!depositDestinationSelected) return;
      setLocationDestinationSelected(value);
    }
  };

  const onChangeNroLot = ({ target }: SelectChangeEvent) => {
    const value = target.value;
    handleFormValueChange('nroLot', value);
  };

  const uploadDocumentFile = async () => {
    try {
      if (documentFile) {
        const response = await uploadFile(documentFile);
        if (response) console.log('file upload successful.');
      }
    } catch (error) {
      console.log('upload file error:', error);
    }
  };

  const validateForm = (form: EventTarget & HTMLFormElement): boolean => {
    let isValid = true;
    let updatedFormValue = { ...formValues };
    const elements = form.elements as HTMLFormControlsCollection;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLInputElement;
      const fieldName = element.name as keyof FormValueState<StockMovement>;
      const field = formValues[fieldName];
      if (field && field.required && !element.value) {
        updatedFormValue[fieldName] = {
          ...field,
          isError: true,
          message: t('this_field_is_mandatory'),
        };
        isValid = false;
      }
    }

    if (!isValid) setFormValues(updatedFormValue);

    return isValid;
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (validateForm(form)) {
      createMovement();
    }
  };

  useEffect(() => {
    getSupplies();
    getDeposits();
    getMovementsType(true);
    getCampaigns();
  }, []);

  useEffect(() => {
    if (movementTypeSelected && movementTypeSelected.sumaStock === 'Ambas') setShowSwitch(true);
    else {
      setFormValues(prev => ({
        ...prev,
        isIncome: {
          ...prev.isIncome,
          value: movementTypeSelected?.sumaStock === 'Suma',
        },
      }));
      setShowSwitch(false);
    }
  }, [movementTypeSelected]);

  useEffect(() => {
    if (
      supplyId?.value &&
      supplyId.value !== '' &&
      depositOrigin.value !== '' &&
      location.value !== ''
    ) {
      getNroLotsBySupplyAndDeposit(supplyId.value, depositOrigin.value, location.value);
    }
  }, [supplyId, depositOrigin, location]);

  return (
    <Container maxWidth='lg'>
      <Loading
        key='loading-new-stockmovement'
        loading={isLoading || isLoadingSupplies || isLoadingDeposits || isLoadCampaigns}
      />
      <Paper variant='outlined' sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}>
        <Box className='text-center'>
          <SyncAltIcon />
        </Box>
        <Typography component='h1' variant='h4' align='center' sx={{ mt: 1, mb: 7 }}>
          {t('new_stock_movement')}
        </Typography>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems='center' justifyContent='flex-start'>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={formValues.typeMovement.isError}>
                <InputLabel id='typeMovement'>{t('movement_type')}</InputLabel>
                <Select
                  labelId='typeMovement'
                  name='typeMovement'
                  value={formValues.typeMovement.value}
                  label={t('movement_type')}
                  onChange={onChangeMovementType}
                >
                  {movementsType.map(movement => (
                    <MenuItem key={movement._id} value={movement._id}>
                      {movement.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formValues.typeMovement.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant='outlined'
                type='text'
                label={t('_reason')}
                name='detail'
                error={formValues.detail.isError}
                helperText={formValues.detail.message}
                value={formValues.detail.value}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position='start' />,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                variant='outlined'
                type='date'
                label={t('_date')}
                name='operationDate'
                error={formValues.operationDate.isError}
                helperText={formValues.operationDate.message}
                value={formValues.operationDate.value}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position='start' />,
                }}
                inputProps={{
                  max: getShortDate(), // Establece la fecha mínima permitida como la fecha actual
                }}
                fullWidth
              />
            </Grid>
            {movementsType.filter(x => x.name === TypeMovement.TransferenciaDeposito).length ? (
              <>
                <Grid key='supply-transfer-deposit' item xs={6} sm={3}>
                  <AutocompleteSupply
                    value={supplySelected}
                    options={supplies}
                    error={formValues.supplyId?.isError ?? false}
                    helperText={formValues.supplyId?.message}
                    onChange={supply => {
                      if (supply?._id) {
                        setSupplySelected(supply);
                        handleFormValueChange('supplyId', supply._id);
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant='body1' align='left'>
                    <b>Tipo de insumo:</b> {supplySelected?.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body1' align='left'>
                    <b>Descripcion:</b> {supplySelected?.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant='h5' align='left'>
                    {t('_origin')}
                  </Typography>
                </Grid>
                <Grid key='deposit-origin' item xs={6} sm={4}>
                  <FormControl fullWidth error={formValues.depositId.isError}>
                    <InputLabel id='deposit'>{t('_warehouse')}</InputLabel>
                    <Select
                      labelId='deposit'
                      name='origin'
                      value={formValues.depositId.value}
                      label={t('_warehouse')}
                      onChange={onChangeDeposit}
                    >
                      {deposits.map(deposit => (
                        <MenuItem key={deposit._id} value={deposit._id}>
                          {deposit.description}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formValues.depositId.message}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControl fullWidth error={formValues.location.isError}>
                    <InputLabel id='location'>{t('_location')}</InputLabel>
                    <Select
                      labelId='location'
                      name='origin'
                      value={formValues.location.value}
                      label={t('_location')}
                      onChange={onChangeLocation}
                    >
                      {depositSelected?.locations.map(l => (
                        <MenuItem key={l} value={l}>
                          {l}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formValues.location.message}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  {supplySelected?.stockByLot && (
                    <FormControl fullWidth error={formValues.nroLot.isError}>
                      {/* Cambiar esto a un mapeo de lots (depositId, supplyId, location) */}
                      <InputLabel id='lot'>{t('lot_number')}</InputLabel>
                      <Select
                        labelId='lot'
                        name='nroLot'
                        value={formValues.nroLot.value}
                        label={t('lot_number')}
                        onChange={onChangeNroLot}
                      >
                        {stockByLots.map(({ nroLot }) => (
                          <MenuItem key={nroLot} value={nroLot}>
                            {nroLot}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{formValues.nroLot.message}</FormHelperText>
                    </FormControl>
                  )}
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    variant='outlined'
                    type='number'
                    label={t('_quantity')}
                    name='amount'
                    error={formValues.amount.isError}
                    helperText={formValues.amount.message}
                    value={formValues.amount.value}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position='start' />,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='body1' align='left'>
                    Unidad de Medidas: <b>{supplySelected?.unitMeasurement}</b>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant='h5' align='left'>
                    {t('_destination')}
                  </Typography>
                </Grid>
                <Grid key='deposit-destination' item xs={6} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='deposit-dest'>{t('_warehouse')}</InputLabel>
                    <Select
                      labelId='deposit-dest'
                      name='destination'
                      value={depositDestinationSelected?._id}
                      label={t('_warehouse')}
                      onChange={onChangeDeposit}
                    >
                      {depositsToBeAllocated.map(deposit => (
                        <MenuItem key={deposit._id} value={deposit._id}>
                          {deposit.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='location-dest'>{t('_location')}</InputLabel>
                    <Select
                      labelId='location-dest'
                      name='destination'
                      value={locationDestinationSelected}
                      label={t('_location')}
                      onChange={onChangeLocation}
                    >
                      {depositDestinationSelected?.locations.map(l => (
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
                    <Box display='flex' justifyContent='center' alignItems='center'>
                      <Typography variant='body1' display='inline-block'>
                        {t('_output')}
                      </Typography>
                      <Switch
                        name='isIncome'
                        checked={formValues.isIncome.value}
                        onChange={handleCheckboxChange}
                      />
                      <Typography variant='body1' display='inline-block'>
                        {t('_input')}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid key='supply-movement' item xs={12} sm={3}>
                  <AutocompleteSupply
                    value={supplySelected}
                    options={supplies}
                    error={formValues.supplyId?.isError ?? false}
                    helperText={formValues.supplyId?.message}
                    onChange={supply => {
                      if (supply?._id) {
                        setSupplySelected(supply);
                        handleFormValueChange('supplyId', supply._id);
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <ListItemText
                      sx={{ backgroundColor: '#f4f4f4', px: 1 }}
                      primary={<Typography variant='subtitle2'>Tipo de insumo:</Typography>}
                      secondary={
                        <Typography letterSpacing={1} variant='subtitle1'>
                          {supplySelected ? supplySelected.type : '-'}
                        </Typography>
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth error={formValues.depositId.isError}>
                    <InputLabel id='deposit'>{t('_warehouse')}</InputLabel>
                    <Select
                      labelId='deposit'
                      name='origin'
                      value={formValues.depositId.value}
                      label={t('_warehouse')}
                      onChange={onChangeDeposit}
                    >
                      {deposits.map(deposit => (
                        <MenuItem key={deposit._id} value={deposit._id}>
                          {deposit.description}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formValues.depositId.message}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth error={formValues.location.isError}>
                    <InputLabel id='location'>{t('id_location')}</InputLabel>
                    <Select
                      labelId='location'
                      name='origin'
                      value={formValues.location.value}
                      label={t('id_location')}
                      onChange={onChangeLocation}
                    >
                      {depositSelected?.locations.map(loc => (
                        <MenuItem key={loc} value={loc}>
                          {loc}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formValues.location.message}</FormHelperText>
                  </FormControl>
                </Grid>
                {supplySelected?.stockByLot && (
                  <>
                    <Grid item xs={6} sm={3}>
                      {formValues.isIncome.value ? (
                        <TextField
                          key='nroLot-input'
                          variant='outlined'
                          type='text'
                          label='Nro Lote'
                          name='nroLot'
                          error={formValues.nroLot.isError}
                          helperText={formValues.nroLot.message}
                          value={formValues.nroLot.value}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position='start' />,
                          }}
                          fullWidth
                        />
                      ) : (
                        <FormControl
                          key='nroLot-select'
                          fullWidth
                          error={formValues.nroLot.isError}
                        >
                          {/* Cambiar esto a un mapeo de lots (depositId, supplyId, location) */}
                          <InputLabel id='lot'>Nro Lote</InputLabel>
                          <Select
                            labelId='lot'
                            name='nroLot'
                            value={formValues.nroLot.value}
                            label='Nro Lote'
                            onChange={onChangeNroLot}
                          >
                            {stockByLots?.map(({ nroLot }) => (
                              <MenuItem key={nroLot} value={nroLot}>
                                {nroLot}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{formValues.nroLot.message}</FormHelperText>
                        </FormControl>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        variant='outlined'
                        type='date'
                        label='Fecha vencimiento'
                        name='dueDate'
                        error={formValues.dueDate.isError}
                        helperText={formValues.dueDate.message}
                        value={formValues.dueDate.value}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: <InputAdornment position='start' />,
                        }}
                        fullWidth
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={6} sm={3}>
                  <TextField
                    variant='outlined'
                    type='number'
                    label='Cantidad'
                    name='amount'
                    error={formValues.amount.isError}
                    helperText={formValues.amount.message}
                    value={formValues.amount.value}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position='start' />,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <ListItemText
                      sx={{ backgroundColor: '#f4f4f4', px: 1 }}
                      primary={<Typography variant='subtitle2'>UM:</Typography>}
                      secondary={
                        <Typography letterSpacing={1} variant='subtitle1'>
                          {supplySelected ? supplySelected?.unitMeasurement : '-'}
                        </Typography>
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    variant='outlined'
                    type='text'
                    label={t('_receipt')}
                    name='voucher'
                    error={formValues.voucher.isError}
                    helperText={formValues.voucher.message}
                    value={formValues.voucher.value}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position='start' />,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  {/* <FormControl fullWidth>
                    <ListItemText
                      sx={{ backgroundColor: '#f4f4f4', px: 1 }}
                      primary={<Typography variant='subtitle2'>Moneda</Typography>}
                      secondary={
                        <Typography letterSpacing={1} variant='subtitle1' fontWeight={600}>
                          {user?.currency}
                        </Typography>
                      }
                    />
                  </FormControl> */}
                </Grid>
                <Grid item xs={6} sm={4}>
                  {/* <TextField
                    variant='outlined'
                    type='number'
                    label={t('total_value')}
                    name='totalValue'
                    error={formValues.totalValue.isError}
                    helperText={formValues.totalValue.message}
                    value={formValues.totalValue.value}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position='start' />,
                    }}
                    fullWidth
                  /> */}
                </Grid>
                <Grid item xs={6} sm={5}>
                  <FormControl
                    key='campaign-select'
                    fullWidth
                    error={formValues.campaignId.isError}
                  >
                    <InputLabel id='campaign'>{t('_campaign')}</InputLabel>
                    <Select
                      labelId='campaign'
                      name='campaignId'
                      value={formValues.campaignId.value}
                      label={t('_campaign')}
                      onChange={handleSelectChange}
                    >
                      {campaigns?.map(c => (
                        <MenuItem key={c.campaignId} value={c.campaignId}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formValues.campaignId.message}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}
                >
                  <Button
                    component='label'
                    variant='contained'
                    sx={{ mr: 1 }}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload
                    <Input type='file' hidden onChange={handleFileUpload} />
                  </Button>
                  {formValues.documentFile?.value?.originalName ? (
                    <Grid sx={{ display: 'flex', alignItems: 'baseline' }}>
                      <label
                        title={formValues.documentFile?.value?.originalName}
                        style={{
                          margin: '10px',
                          width: '200px',
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                        }}
                      >
                        {formValues.documentFile?.value?.originalName}
                      </label>
                      <IconButton onClick={() => handleRemoveFile()} color='error'>
                        <CancelIcon fontSize='medium' />
                      </IconButton>
                    </Grid>
                  ) : (
                    <Typography
                      variant='body1'
                      sx={{
                        pl: 1,
                        display: 'inline-block',
                      }}
                    >
                      Ningún archivo seleccionado
                    </Typography>
                  )}
                </Grid>
              </>
            )}
          </Grid>
          <Grid
            container
            spacing={1}
            alignItems='center'
            justifyContent='space-around'
            sx={{ mt: 3 }}
          >
            <Grid item xs={12} sm={3}>
              <Button variant='contained' color='inherit' onClick={onClickCancel}>
                {t('id_cancel')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                type='submit'
                variant='contained'
                disabled={
                  !supplySelected ||
                  !depositSelected ||
                  !movementTypeSelected ||
                  !formValues.amount.value
                }
                color='primary'
              >
                {t('_add')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};
