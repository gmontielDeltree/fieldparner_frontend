import React, { ChangeEvent, useCallback } from 'react';
import {
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    Box,
    ListItemText,
    FormHelperText
} from '@mui/material';
import { ExitField, ExitFieldItem, TipoEntidad, Vehicle, VehicleType } from '../../types';
import { LocalShipping as LocalShippingIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { BusinessItem } from '../../interfaces/socialEntity';


interface TransportDestinationProps {
    formValues: ExitFieldItem;
    socialEntities: BusinessItem[];
    vehicles: Vehicle[];
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    setFormValues: React.Dispatch<React.SetStateAction<ExitField>>;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
    errors?: Record<string, string>;
    showErrors?: boolean;
}


export const TransportDestination: React.FC<TransportDestinationProps> = ({
    formValues,
    socialEntities,
    vehicles,
    handleInputChange,
    handleSelectChange,
    setFormValues,
    errors = {},
    showErrors = false
}) => {
    const { humidityPercentage, mermaPercentage, volatilePercentage, otherPercentage, grossWeight, tareWeight } = formValues;
    const totalMerma = Number(humidityPercentage) + Number(mermaPercentage) + Number(volatilePercentage) + Number(otherPercentage);

    // Ensure positive values for gross and tare weights
    const safeGrossWeight = Math.max(0, Number(grossWeight) || 0);
    const safeTareWeight = Math.max(0, Number(tareWeight) || 0);

    // Ensure tare weight is not greater than gross weight
    const adjustedTareWeight = Math.min(safeTareWeight, safeGrossWeight);

    // Calculate net weight (ensuring it's never negative)
    console.log('safeGrossWeight', safeGrossWeight, "safeTareWeight", safeTareWeight);
    const netWeight = Math.max(0, safeGrossWeight - adjustedTareWeight);

    // Calculate kg net (ensuring it's never negative)
    console.log('netWeight', netWeight, 'totalMerma', totalMerma);
    const kgNet = Math.max(0, netWeight - ((netWeight * Math.min(100, totalMerma)) / 100));
    console.log('kgNet', kgNet);
    const { t, i18n } = useTranslation();

    // Helper function to determine if a field has an error
    const hasError = (field: string): boolean => Boolean(showErrors && errors[field]);

    // Helper function to format vehicle display text
    const formatVehicleDisplay = (vehicle: Vehicle) => {
        // Check if the vehicle has the necessary properties before trying to use them
        const brand = vehicle.make || '';
        const model = vehicle.model || '';
        const patent = vehicle.patent || '';
        const chassisNumber = vehicle.chassisNumber || '';

        // Return a formatted string combining multiple properties for better identification
        if (patent && chassisNumber) {
            return `${brand} ${model} - ${patent} (${chassisNumber})`;
        } else if (patent) {
            return `${brand} ${model} - ${patent}`;
        } else if (chassisNumber) {
            return `${brand} ${model} - ${chassisNumber}`;
        } else {
            return `${brand} ${model}`;
        }
    };

    // Add validation for numerical inputs to ensure they are positive
    const validatePositiveNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        // Convert to number and check if it's negative
        const numValue = parseFloat(value);

        // If it's a negative number, set it to 0
        if (numValue < 0) {
            event.target.value = "0";

            // Create a new event with the corrected value
            const newEvent = {
                target: {
                    name,
                    value: "0"
                }
            } as React.ChangeEvent<HTMLInputElement>;

            // Pass the corrected event to the original handler
            handleInputChange(newEvent);
            return false;
        }

        // For percentage fields, ensure they don't exceed 100%
        if (
            (name === "humidityPercentage" ||
                name === "mermaPercentage" ||
                name === "volatilePercentage" ||
                name === "otherPercentage") &&
            numValue > 100
        ) {
            event.target.value = "100";

            const newEvent = {
                target: {
                    name,
                    value: "100"
                }
            } as React.ChangeEvent<HTMLInputElement>;

            handleInputChange(newEvent);
            return false;
        }

        // For tareWeight, ensure it doesn't exceed grossWeight
        if (name === "tareWeight" && formValues.grossWeight && numValue > Number(formValues.grossWeight)) {
            // Limit tareWeight to grossWeight
            event.target.value = formValues.grossWeight.toString();

            const newEvent = {
                target: {
                    name,
                    value: formValues.grossWeight.toString()
                }
            } as React.ChangeEvent<HTMLInputElement>;

            handleInputChange(newEvent);
            return false;
        }

        return true;
    };

    // Removes leading zeros: "044" → "44", but preserves "0.5" and "0"
    const normalizeLeadingZeros = (event: React.ChangeEvent<HTMLInputElement>): React.ChangeEvent<HTMLInputElement> => {
        const { value, name } = event.target;
        if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
            const normalized = value.replace(/^0+/, '') || '0';
            const newEvent = {
                target: { name, value: normalized }
            } as React.ChangeEvent<HTMLInputElement>;
            return newEvent;
        }
        return event;
    };

    // Enhanced input change handler that first validates the input
    const handleValidatedInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const normalized = normalizeLeadingZeros(event);
        if (validatePositiveNumber(normalized)) {
            handleInputChange(normalized);
        }
    };

    // Handler for numeric fields that only need leading-zero normalization
    const handleNumericInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(normalizeLeadingZeros(event));
    };

    const onChangeVehicle = useCallback(({ target }: SelectChangeEvent) => {
        const { value, name } = target;
        const vehicleSelected = vehicles.find(v => v._id === value);
        if (!vehicleSelected) return;

        if (name.toLowerCase() === "vehicle")
            setFormValues(prevState => ({
                ...prevState,
                vehicleId: value,
                chassis: vehicleSelected.chassisNumber,
            }));
        else
            setFormValues(prevState => ({ ...prevState, truckTrailerId: value }));

    }, [vehicles, setFormValues]);

    return (
        <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Grid item xs={12} display="flex" alignItems="center" mb={2}>
                <LocalShippingIcon sx={{ mx: 1 }} />
                <Typography variant="h5">{t("carrier_kgs_destination")} </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>Campaña</Typography>}
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.campaign?.name || "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>Campo</Typography>}
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.field?.nombre || "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>Cultivo</Typography>}
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.crop ?
                                    i18n.language === "es" ?
                                        formValues.crop.descriptionES : i18n.language === "en" ?
                                            formValues.crop.descriptionEN : formValues.crop.descriptionPT : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl
                    key="transport-select"
                    fullWidth
                    error={hasError('transportId')}
                    required
                >
                    <InputLabel id="transporte">{t("_transportation")}</InputLabel>
                    <Select
                        labelId="transporte"
                        name="transportId"
                        value={formValues.transportId}
                        label={t("_transportation")}
                        onChange={handleSelectChange}
                    >
                        {socialEntities?.map((f) => (
                            <MenuItem key={f._id} value={f._id}>
                                {f.nombreCompleto || f.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                    {hasError('transportId') && <FormHelperText>{errors['transportId']}</FormHelperText>}
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl
                    key="trucker-select"
                    fullWidth
                    error={hasError('truckerId')}
                    required
                >
                    <InputLabel id="trucker">{t("truck_driver")} </InputLabel>
                    <Select
                        labelId="trucker"
                        name="truckerId"
                        value={formValues.truckerId}
                        label={t("truck_driver")}
                        onChange={handleSelectChange}
                    >
                        {socialEntities?.filter(s => s.tipoEntidad === TipoEntidad.FISICA).map((f) => (
                            <MenuItem key={f._id} value={f._id}>
                                {f.nombreCompleto || f.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                    {hasError('truckerId') && <FormHelperText>{errors['truckerId']}</FormHelperText>}
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl
                    key="vehicle-select"
                    fullWidth
                    error={hasError('vehicleId')}
                    required
                >
                    <InputLabel id="vehicle">{t("_vehicle")}</InputLabel>
                    <Select
                        labelId="vehicle"
                        name="vehicle"
                        value={formValues.vehicleId}
                        label={t("_vehicle")}
                        onChange={onChangeVehicle}
                    >
                        {vehicles?.map((vehicle) => (
                            <MenuItem key={vehicle._id} value={vehicle._id}>
                                {formatVehicleDisplay(vehicle)}
                            </MenuItem>
                        ))}
                    </Select>
                    {hasError('vehicleId') && <FormHelperText>{errors['vehicleId']}</FormHelperText>}
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl key="truck-trailer-select" fullWidth>
                    <InputLabel id="truckTrailer">{t("_trailer")}</InputLabel>
                    <Select
                        labelId="truckTrailer"
                        name="truckTrailer"
                        value={formValues.truckTrailerId}
                        label={t("_trailer")}
                        onChange={onChangeVehicle}
                    >
                        {vehicles.filter(v => v.vehicleType === VehicleType.Acoplado)?.map((vehicle) => (
                            <MenuItem key={vehicle._id} value={vehicle._id}>
                                {formatVehicleDisplay(vehicle)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={t("gross_weight")}
                    name="grossWeight"
                    value={formValues.grossWeight}
                    onChange={handleValidatedInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    inputProps={{
                        min: 0,
                        step: "0.01",
                        style: { textAlign: 'right' }
                    }}
                    fullWidth
                    error={hasError('grossWeight')}
                    helperText={hasError('grossWeight') ? errors['grossWeight'] : ''}
                    required
                />
            </Grid>
            <Grid item xs={6} sm={4}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={t("tare_weight")}
                    name="tareWeight"
                    value={formValues.tareWeight}
                    onChange={handleValidatedInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    inputProps={{
                        min: 0,
                        step: "0.01",
                        style: { textAlign: 'right' }
                    }}
                    fullWidth
                    error={hasError('tareWeight')}
                    helperText={hasError('tareWeight') ? errors['tareWeight'] : ''}
                    required
                />
            </Grid>
            <Grid item xs={6} sm={4}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={t("net_weight")}
                    disabled
                    name="netWeight"
                    value={Math.max(0, netWeight)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    inputProps={{
                        style: { textAlign: 'right' }
                    }}
                    fullWidth
                />
            </Grid>
            <Grid
                item
                xs={12}
                sm={12}
                my={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                spacing={1}>
                <Grid item xs={6} sm={2} display="flex" alignItems="center">
                    <TextField
                        variant="outlined"
                        type="number"
                        label={`% ${t("_humidity")}`}
                        name="humidityPercentage"
                        value={formValues.humidityPercentage}
                        onChange={handleNumericInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        inputProps={{
                            min: 0,
                            max: 100,
                            step: "0.1",
                            style: { textAlign: 'right' }
                        }}
                        fullWidth
                    />
                    <Box sx={{ mx: 1 }} ><b>+</b></Box>
                </Grid>
                <Grid item xs={6} sm={2} display="flex" alignItems="center">
                    <TextField
                        variant="outlined"
                        type="number"
                        label={`% ${t("_shrinkage")}`}
                        name="mermaPercentage"
                        value={formValues.mermaPercentage}
                        onChange={handleNumericInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        inputProps={{
                            min: 0,
                            max: 100,
                            step: "0.1",
                            style: { textAlign: 'right' }
                        }}
                        fullWidth
                    />
                    <Box sx={{ mx: 1 }} ><b>+</b></Box>
                </Grid>
                <Grid item xs={6} sm={2} display="flex" alignItems="center">
                    <TextField
                        variant="outlined"
                        type="number"
                        label={`% ${t("_volatile")}`}
                        name="volatilePercentage"
                        value={formValues.volatilePercentage}
                        onChange={handleNumericInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        inputProps={{
                            min: 0,
                            max: 100,
                            step: "0.1",
                            style: { textAlign: 'right' }
                        }}
                        fullWidth
                    />
                    <Box sx={{ mx: 1 }} ><b>+</b></Box>
                </Grid>
                <Grid item xs={6} sm={2} display="flex" alignItems="center">
                    <TextField
                        variant="outlined"
                        type="number"
                        label={`% ${t("_other")}`}
                        name="otherPercentage"
                        value={formValues.otherPercentage}
                        onChange={handleNumericInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        inputProps={{
                            min: 0,
                            max: 100,
                            step: "0.1",
                            style: { textAlign: 'right' }
                        }}
                        fullWidth
                    />
                    <Box sx={{ mx: 1 }} ><b>=</b></Box>
                </Grid>
                <Grid item xs={6} sm={2}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={`% ${t("total_shrinkage")}`}
                        disabled
                        value={totalMerma}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        inputProps={{
                            style: { textAlign: 'right' }
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6} sm={2} pl={1}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("net_kg")}
                        name="kgNet"
                        value={kgNet}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        inputProps={{
                            style: { textAlign: 'right' }
                        }}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid item xs={6} sm={3}>
                <FormControl key="harvester-select" fullWidth>
                    <InputLabel id="harvester">{t("_harvester")}</InputLabel>
                    <Select
                        labelId="harvester"
                        name="harvesterId"
                        value={formValues.harvesterId}
                        label="Cosechador"
                        onChange={handleSelectChange}
                    >
                        {socialEntities?.filter(s => s.tipoEntidad === TipoEntidad.FISICA).map((f) => (
                            <MenuItem key={f._id} value={f._id}>
                                {f.nombreCompleto}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label={t("_destination")}
                    name="destination"
                    value={formValues.destination}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                    error={hasError('destination')}
                    helperText={hasError('destination') ? errors['destination'] : ''}
                    required
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    variant="outlined"
                    type="text"
                    label={t("additional_information")}
                    name="additionalInformation"
                    value={formValues.additionalInformation}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
        </Grid>
    )
}