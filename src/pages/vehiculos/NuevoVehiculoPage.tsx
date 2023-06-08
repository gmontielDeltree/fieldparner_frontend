import React, { useCallback } from 'react';
import { Box, Button, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TipoCombustible, TipoVehiculo, Vehiculo } from '../../types';
import { useAppDispatch, useForm } from '../../hooks';
import uuid4 from 'uuid4';
import { agregarNuevoVehiculo } from '../../redux/slices/vehiculo';
import { FolderOpen as FolderOpenIcon, Security as SecurityIcon } from '@mui/icons-material';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
// import SecurityIcon from '@mui/icons-material/Security';

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
    const dispatch = useAppDispatch();
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
    const navigate = useNavigate();

    const onClickCancelar = useCallback(() => navigate('/overview/vehiculo'), []);

    const onClickAgregar = useCallback((e: any) => {
        e.preventDefault();
        const nuevoVehiculo = {
            ...formulario,
            nro: uuid4()
        };
        dispatch(agregarNuevoVehiculo(nuevoVehiculo));
        navigate('/overview/vehiculo');
    }, [formulario, dispatch]);

    return (
        <>
            <Box
                component="div"
                bgcolor="#ffff"
                sx={{
                    mt: 5,
                    height: '95%',
                    borderRadius: 2
                }}>
                <Box
                    component="div"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ ml: { sm: 2 }, pt: 3 }}>
                    <Typography component="h2" variant='h4' sx={{ ml: { sm: 2 } }} >
                        Nuevo Vehiculo
                    </Typography>
                </Box>
                <Divider variant='middle' />
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2, mt: { sm: 2 } }}
                >
                    <Grid item xs={12} display="flex" alignItems="center">
                        <FolderOpenIcon sx={{ mx: 1 }} />
                        <Typography variant='h5'>
                            Datos Generales
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="tipo-vehiculo">Tipo de Vehichulo</InputLabel>
                            <Select
                                labelId="tipo-vehiculo"
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
                            required
                            variant="outlined"
                            type='text'
                            name="marca"
                            value={marca}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Modelo"
                            required
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
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Patente"
                            required
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
                    {/* <Grid item xs={12}> <Divider variant='fullWidth' /> </Grid> */}
                    <Grid item xs={12} display="flex" alignItems="center">
                        <FolderOpenIcon sx={{ mx: 1 }} />
                        <Typography variant='h5'>
                            Caracteristicas
                        </Typography>
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
                    {/* <Grid item xs={12}> <Divider variant='fullWidth' /> </Grid> */}
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
                            label="Propietario"
                            variant="outlined"
                            type='text'
                            name="propietario"
                            value={propietario}
                            onChange={handleInputChange} />
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            id='ultimoMantenimiento'
                            variant="outlined"
                            type='date'
                            label="Ultimo mantenimiento"
                            name="ultimoMantenimiento"
                            value={ultimoMantenimiento}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth />
                    </Grid>
                    {/* <Grid item xs={12}> <Divider variant='fullWidth' /> </Grid> */}
                    <Grid item xs={12} display="flex" alignItems="center">
                        <SecurityIcon sx={{ mx: 1 }} />
                        <Typography variant='h5'>
                            Seguro
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Compañía de seguro"
                            variant="outlined"
                            type='text'
                            name="seguro"
                            value={seguro}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }} />
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Tipo de Cobertura"
                            variant="outlined"
                            type='text'
                            name="tipoCobertura"
                            value={tipoCobertura}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }} />
                    </Grid>
                    <Grid item xs={12} sm={4} >
                        <TextField
                            label="Numero de Póliza"
                            variant="outlined"
                            type='text'
                            name="nroPoliza"
                            value={nroPoliza}
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
                <Box >
                    <Grid
                        container
                        spacing={2}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ mt: { sm: 3 } }}>
                        <Grid item xs={12} sm={5}>
                            <Button
                                variant="contained"
                                color='inherit'
                                onClick={onClickCancelar}
                                sx={{ ml: 1 }}
                                fullWidth
                            >
                                Cancelar
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <Button
                                type='submit'
                                variant="contained"
                                color='primary'
                                onClick={onClickAgregar}
                                sx={{ ml: 1 }}
                                fullWidth
                            >
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    )
}
