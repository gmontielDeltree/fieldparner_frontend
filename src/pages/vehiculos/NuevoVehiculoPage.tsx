import React from 'react';
import { Box, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { TipoCombustible, TipoVehiculo, Vehiculo } from '../../types';
import { useForm } from '../../hooks';

const tipoVehiculos: string[] = Object.keys(TipoVehiculo);
const tipoCombustibles: string[] = Object.keys(TipoCombustible);
const listaAños: string[] = ["1999", "2000", "2010"];

const initialState: Vehiculo = {
    tipoVehiculo: TipoVehiculo.Camioneta,
    patente: '',
    marca: '',
    modelo: '',
    año: listaAños[0],
    tara: 0,
    neto: 0,
    tipoCombustible: TipoCombustible.Diesel,
    capacidadCombustible: 0,
    unidadMedida: '',
    conectividad: '',
    nro: '',
    nroPoliza: '',
    seguro: '',
    tipoCobertura: '',
    propietario: '',
    ultimoMantenimiento: '',
    seguroFechaInicio: '',
    seguroFechaVencimiento: '',
}


export const NuevoVehiculoPage: React.FC = () => {

    const {
        tipoVehiculo,
        patente,
        marca,
        modelo,
        año,
        tara,
        neto,
        tipoCombustible,
        capacidadCombustible,
        nroPoliza,
        seguro,
        seguroFechaInicio,
        seguroFechaVencimiento,
        tipoCobertura,
        unidadMedida,
        conectividad,
        propietario,
        ultimoMantenimiento,
        formulario,
        handleInputChange,
        handleSelectChange } = useForm(initialState);

    return (
        <>
            <Box
                component="div"
                display="flex"
                alignItems="center"
                sx={{ ml: { sm: 2 }, pt: 2 }}>
                <Typography component="h2" variant='h4' sx={{ ml: { sm: 2 } }} >
                    Nuevo Vehiculo
                </Typography>
            </Box>
            <Divider variant='middle' />
            <Box
                component="div"
                bgcolor="#ffff"
                sx={{
                    borderRadius: 2
                }}>
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2, mt: { sm: 2 } }}
                >
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="tipo-vehiculo">Tipo de Vehichulo</InputLabel>
                            <Select
                                labelId="tipo-vehiculo"
                                id="select-estado"
                                name="tipoVehiculo"
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
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Marca"
                            variant="outlined"
                            type='text'
                            name="marca"
                            value={marca}
                            onChange={handleInputChange}
                            placeholder='Marca'
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Modelo"
                            variant="outlined"
                            type='text'
                            name="modelo"
                            value={modelo}
                            onChange={handleInputChange}
                            placeholder='Modelo'
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Patente"
                            variant="outlined"
                            type='text'
                            name="patente"
                            value={patente}
                            onChange={handleInputChange}
                            placeholder='Patente'
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth>
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
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3} >
                        <TextField
                            label="Tara"
                            variant="outlined"
                            type='number'
                            name="tara"
                            value={tara}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">kg</InputAdornment>
                            }}
                            onChange={handleInputChange}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={3} >
                        <TextField
                            label="Neto"
                            variant="outlined"
                            type='number'
                            name="neto"
                            value={neto}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">kg</InputAdornment>
                            }}
                            onChange={handleInputChange}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="tipo-combustible">Tipo Combustible</InputLabel>
                            <Select
                                labelId="tipo-combustible"
                                id="select-combustible"
                                name="tipoCombustible"
                                value={tipoCombustible}
                                label="Tipo Combustible"
                                onChange={handleSelectChange}
                            >
                                {
                                    tipoCombustibles.map((value) =>
                                        (<MenuItem key={value} value={value}>{value.toString()}</MenuItem>)
                                    )
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Capacidad Combustible"
                            variant="outlined"
                            type='number'
                            name="capacidadCombustible"
                            value={capacidadCombustible}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">L</InputAdornment>
                            }}
                            onChange={handleInputChange}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Unidad de Medida"
                            variant="outlined"
                            type='text'
                            name="unidadMedida"
                            value={unidadMedida}
                            onChange={handleInputChange}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Conectividad"
                            variant="outlined"
                            type='text'
                            name="conectividad"
                            value={conectividad}
                            onChange={handleInputChange}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            // label="Propietario"
                            variant="outlined"
                            type='date'
                            name="propietario"
                            value={propietario}
                            onChange={handleInputChange}
                            fullWidth />
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}
