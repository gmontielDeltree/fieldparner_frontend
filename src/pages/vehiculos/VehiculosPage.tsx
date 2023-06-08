
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Loading } from '../../components';
import { ColumnProps, TipoVehiculo } from '../../types';
import { Box, Button, Fab, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    // Download as DownloadIcon,
    LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useForm, useAppDispatch, useAppSelector } from '../../hooks';
import { cargarVehiculos, getVehiculos } from '../../redux/slices/vehiculo';




const columns: ColumnProps[] = [
    { text: 'Patente', align: 'left' },
    { text: 'Tipo Vehiculo', align: 'center' },
    { text: 'Marca', align: 'center' },
    { text: 'Modelo', align: 'center' },
    { text: 'Año', align: 'center' }];
const tipoVehiculos: string[] = Object.keys(TipoVehiculo);
const listaAños: string[] = ["1999", "2000", "2010"];
const filtros = {
    tipoVehiculo: 'Todos',
    patente: '',
    marca: '',
    modelo: '',
    año: listaAños[0],
}

export const VehiculosPage: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector(state => state.ui);
    const { vehiculos } = useAppSelector(state => state.vehiculo);
    const {
        tipoVehiculo,
        patente,
        marca,
        modelo,
        año,
        handleInputChange,
        handleSelectChange } = useForm(filtros);
    const listaTipoVehiculos = useMemo(() => ["Todos", ...tipoVehiculos], []);

    const filteredVehiculos = vehiculos.filter(
        item =>
            (item.patente && item.patente.toLowerCase().includes(patente.toLowerCase())) ||
            (marca && item.marca.toLowerCase().includes(marca.toLowerCase())) ||
            (modelo && item.modelo.toLowerCase().includes(modelo.toLowerCase())) ||
            ((tipoVehiculo.toLowerCase() !== 'todos') && item.tipoVehiculo.toLowerCase().includes(tipoVehiculo.toLowerCase()))
    );
    console.log(filteredVehiculos);

    // const onClickBuscar = (): void => {
    //     let filtered = [...vehiculos];
    //     if (patente !== '') {
    //         filtered = filtered.filter(
    //             item =>
    //                 (item.patente && item.patente.toLowerCase().includes(patente.toLowerCase())),
    //         );
    //     }
    //     if (marca !== '') {
    //         filtered = filtered.filter(
    //             item =>
    //                 (item.marca && item.marca.toLowerCase().includes(marca.toLowerCase())),
    //         );
    //     }
    //     if (modelo !== '') {
    //         filtered = filtered.filter(
    //             item =>
    //                 (item.modelo && item.modelo.toLowerCase().includes(modelo.toLowerCase())),
    //         );
    //     }
    //     dispatch(cargarVehiculos(filtered));
    // }

    const onClickNuevoVehiculo = () => navigate('/overview/vehiculo/nuevo');

    useEffect(() => {
        dispatch(getVehiculos());
    }, [dispatch]);

    return (
        <>
            {
                isLoading && (<Loading loading={true} />)
            }
            <Box
                component="div"
                display="flex"
                alignItems="center"
                sx={{ ml: { sm: 2 }, pt: 2 }}>
                <LocalShippingIcon />
                <Typography component="h2" variant='h4' sx={{ ml: { sm: 2 } }} >
                    Vehiculos
                </Typography>
            </Box>
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
                    <Grid item xs={12} sm={6} >
                        <TextField
                            label="Patente"
                            variant="outlined"
                            type='text'
                            name="patente"
                            value={patente}
                            onChange={handleInputChange}
                            inputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="tipo-vehiculo">Tipo de Vehichulo</InputLabel>
                            <Select
                                labelId="tipo-vehiculo"
                                id="select-estado"
                                name="tipoVehiculo"
                                value={tipoVehiculo}
                                label="Tipo de Vehiculo"
                                onChange={handleSelectChange}
                                inputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                            >
                                {
                                    listaTipoVehiculos.map((value) =>
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
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
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
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                </Grid>
                <Box
                    component="div"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: { sm: 2 }, my: 1 }} >
                    <Grid
                        container
                        spacing={2}
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        {/* <Grid item>
                            <Button
                                variant="contained"
                                color="inherit"
                                onClick={() => onClickBuscar()}
                                startIcon={<SearchIcon />}>
                                Buscar
                            </Button>
                        </Grid> */}
                        <Grid item >
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<AddIcon />}
                                onClick={onClickNuevoVehiculo}
                            >
                                Nuevo Vehiculo
                            </Button>
                        </Grid>
                        {/* <Grid item>
                            <Fab color="inherit" size='small' aria-label="edit">
                                <DownloadIcon />
                            </Fab>
                        </Grid> */}
                    </Grid>
                </Box>
                {/* <Box
                    component="div"
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ p: { sm: 2 } }}>
                    <Typography display="inline" >Pages: {5}</Typography>
                    <Pagination
                        className='d-inline-block'
                        count={5}
                        page={1}
                        onChange={() => console.log('onChangePagination')} />
                </Box> */}

                <Box
                    component="div"
                    sx={{ p: 1 }}>
                    <DataTable
                        key="datatable-equipo"
                        isLoading={isLoading}
                        columns={columns}
                        data={filteredVehiculos} />
                </Box>
            </Box>
        </>
    )
}
