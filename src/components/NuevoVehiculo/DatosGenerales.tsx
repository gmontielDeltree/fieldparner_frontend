import React, { ChangeEvent } from 'react';
import {
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography
} from '@mui/material';
import { TipoCombustible, TipoVehiculo, Vehiculo } from '../../types';
import { useAppSelector, useForm } from '../../hooks';
import { FolderOpen as FolderOpenIcon, Security as SecurityIcon } from '@mui/icons-material';


const tipoVehiculos: string[] = Object.keys(TipoVehiculo);

const initialState: Vehiculo = {
    tipoVehiculo: '',
    patente: '',
    marca: '',
    modelo: '',
    año: "",
    tara: 0,
    neto: 0,
    tipoCombustible: '',
    capacidadCombustible: 0,
    unidadMedida: '',
    conectividad: '',
    _id: '',
    nroPoliza: '',
    seguro: '',
    tipoCobertura: '',
    propietario: '',
    ultimoMantenimiento: '',
    seguroFechaInicio: '',
    seguroFechaVencimiento: '',
    bruto: 0,
    otroTipoVehiculo: '',
    especificacionesTecnicas: [],
    mantenimientos: [],
}

export interface DatosGeneralesProps {
    vehiculo: Vehiculo;
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
    handleYearChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
}

export const DatosGenerales: React.FC<DatosGeneralesProps> = ({
    vehiculo,
    handleInputChange,
    handleSelectChange,
    handleYearChange }) => {

    const { vehiculoActivo } = useAppSelector(state => state.vehiculo);
    const disabledFields = !!(vehiculoActivo);

    const {
        tipoVehiculo,
        patente,
        marca,
        modelo,
        año,
        propietario,
        nroPoliza,
        seguro,
        seguroFechaInicio,
        seguroFechaVencimiento,
        tipoCobertura,
        otroTipoVehiculo,
    } = vehiculo;

    return (
        <>
            <Grid
                container
                spacing={3}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Grid item xs={12} display="flex" alignItems="center">
                    <FolderOpenIcon sx={{ mx: 1 }} />
                    <Typography variant="h5">
                        Datos Generales
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel id="tipo-vehiculo">Tipo de Vehichulo</InputLabel>
                        <Select
                            labelId="tipo-vehiculo"
                            name="tipoVehiculo"
                            disabled={disabledFields}
                            value={tipoVehiculo}
                            label="Tipo de Vehiculo"
                            onChange={handleSelectChange}
                        >
                            {
                                tipoVehiculos.map((value) =>
                                    (<MenuItem key={value} value={value}>{value.toString()}</MenuItem>)
                                )
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Otro"
                        variant="outlined"
                        type='text'
                        name="otroTipoVehiculo"
                        placeholder='Tipo de Vehiculo'
                        value={otroTipoVehiculo}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <TextField
                        label="Marca"
                        required
                        variant="outlined"
                        disabled={disabledFields}
                        type='text'
                        name="marca"
                        value={marca}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <TextField
                        label="Modelo"
                        required
                        disabled={disabledFields}
                        variant="outlined"
                        type='text'
                        name="modelo"
                        value={modelo}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={2}>
                    {/* <DatePicker
                        label={"Año"}
                        value={año}
                        minDate={new Dayjs().year(1900)}
                        maxDate={new Dayjs(new Date())}
                        views={["year"]}
                        onChange={(newValue) => {
                            if (newValue && newValue.year()) console.log(newValue.year().toString());
                            // setValue(newValue);
                        }}
                    /> */}
                    <TextField
                        type="text"
                        label="Año"
                        name="año"
                        value={año}
                        onChange={handleYearChange}
                        inputProps={{
                            maxLength: 4,
                            pattern: '[0-9]*',
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                    />
                    {/* <FormControl fullWidth>
                        <InputLabel id="año-equipo">Año</InputLabel>
                        <Select
                            labelId="año-equipo"
                            id="select-periodo"
                            name="año"
                            value={año}
                            label="Año"
                            onChange={handleSelectChange}
                        >
                            {
                                listaAños.map((value) =>
                                    (<MenuItem key={value} value={value}>{value.toString()}</MenuItem>)
                                )
                            }
                        </Select>
                    </FormControl> */}
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        label="Patente"
                        variant="outlined"
                        type='text'
                        name="patente"
                        value={patente}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        label="Propietario"
                        variant="outlined"
                        type='text'
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        name="propietario"
                        value={propietario}
                        fullWidth
                        onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} display="flex" alignItems="center" >
                    <SecurityIcon sx={{ mx: 1 }} />
                    <Typography variant='h5' >
                        Seguro
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        label="Compañía de seguro"
                        variant="outlined"
                        type='text'
                        name="seguro"
                        value={seguro}
                        fullWidth
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }} />
                </Grid>
                <Grid item xs={12} sm={3} >
                    <TextField
                        label="Tipo de Cobertura"
                        variant="outlined"
                        type='text'
                        name="tipoCobertura"
                        value={tipoCobertura}
                        fullWidth
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }} />
                </Grid>
                <Grid item xs={12} sm={3} >
                    <TextField
                        label="Numero de Póliza"
                        variant="outlined"
                        type='text'
                        name="nroPoliza"
                        value={nroPoliza}
                        fullWidth
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }} />
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        variant="outlined"
                        type='date'
                        label="Fecha de Inicio del Seguro"
                        name="seguroFechaInicio"
                        value={seguroFechaInicio}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        variant="outlined"
                        type='date'
                        label="Fecha Vencimiento del Seguro"
                        name="seguroFechaVencimiento"
                        value={seguroFechaVencimiento}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
            </Grid>
        </>
    )
}
