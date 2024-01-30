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
    Divider,
    Box
} from '@mui/material';
import { Business, Deposit, ExitField, TipoEntidad, Vehicle, VehicleType } from '../../types';
import { LocalShipping as LocalShippingIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';


interface TransportDestinationProps {
    formValues: ExitField;
    deposits: Deposit[];
    socialEntities: Business[];
    vehicles: Vehicle[];
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    setFormValues: React.Dispatch<React.SetStateAction<ExitField>>;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

//TODO: Camionero y Cosechador tienen q ser de tipo entidad fisica?

export const TransportDestination: React.FC<TransportDestinationProps> = ({
    formValues,
    deposits,
    socialEntities,
    vehicles,
    handleInputChange,
    handleSelectChange,
    setFormValues
}) => {
    const { humidityPercentage, mermaPercentage, volatilePercentage, otherPercentage, grossWeight, tareWeight } = formValues;
    const totalMerma = Number(humidityPercentage) + Number(mermaPercentage) + Number(volatilePercentage) + Number(otherPercentage);
    const netWeight = Number(grossWeight - tareWeight);
    const kgNet = (netWeight - ((netWeight * totalMerma) / 100));
    const {t} = useTranslation();

    const onChangeDeposit = ({ target }: SelectChangeEvent) => {
        const { value } = target;
        const depositSelected = deposits.find((deposit) => deposit._id === value);

        if (depositSelected) {
            setFormValues(prevState => ({
                ...prevState,
                depositId: value,
                deposit: depositSelected
            }));
        }
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

    }, []);

    return (
        <Grid
            container
            spacing={1}
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Grid item xs={12} display="flex" alignItems="center" mb={2}>
                <LocalShippingIcon sx={{ mx: 1 }} />
                <Typography variant="h5">{t("carrier_kgs_destination")} </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="transport-select" fullWidth>
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
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="trucker-select" fullWidth>
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
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    variant="outlined"
                    type="text"
                    label={t("_crop")}
                    disabled
                    value={formValues.cultive}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl key="vehicle-select" fullWidth>
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
                                {vehicle.chassisNumber}
                            </MenuItem>
                        ))}
                    </Select>
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
                                {vehicle.chassisNumber}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={12} my={2}>
                <Divider variant='middle' sx={{ border: "1px solid black" }} />
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={t("gross_weight")}
                    name="grossWeight"
                    value={formValues.grossWeight}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={t("tare_weight")}
                    name="tareWeight"
                    value={formValues.tareWeight}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={t("net_weight")}
                    disabled
                    name="netWeight"
                    value={netWeight}
                    // onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <FormControl fullWidth>
                    <InputLabel id="deposit">{t("_warehouse")}</InputLabel>
                    <Select
                        labelId="deposit"
                        name="depositId"
                        value={formValues.depositId}
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
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
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
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
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
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
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
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
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
                        // name="totalMerma"
                        value={totalMerma}
                        // onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
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
                        // onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid xs={12} sm={12} my={1}>
                <Divider variant='middle' sx={{ border: "1px solid black" }} />
            </Grid>
            <Grid item xs={6} sm={3}>
                {/* <TextField
                    variant="outlined"
                    type="text"
                    label='Cosechador'
                    name="harvester"
                    value={formValues.harvester}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                /> */}
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
            {/* <Grid item sm={4} /> */}
        </Grid>
    )
}
