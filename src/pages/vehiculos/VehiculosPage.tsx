
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Loading } from '../../components';
import { ColumnProps, TipoVehiculo } from '../../types';
import { Box, Button, Fab, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    // Download as DownloadIcon,
    LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useForm, useAppDispatch, useAppSelector } from '../../hooks';
import { getVehiculos } from '../../redux/slices/vehiculo';




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

    const onClickBuscar = (): void => {
        // setData(prevState => prevState.filter(
        //     (equipo) =>
        //         (equipo.tipoVehiculo === tipoVehiculo) ||
        //         (marca && equipo.marca === marca) ||
        //         (patente && equipo.patente === patente) ||
        //         (modelo && equipo.modelo === modelo)
        // ));
    }

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
                            placeholder='Patente'
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
                        <FormControl fullWidth>
                            <InputLabel id="marca">Marca</InputLabel>
                            <Select
                                labelId="marca"
                                id="select-estado"
                                name="marca"
                                value={marca}
                                label="Marca"
                                onChange={handleSelectChange}
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
                        <FormControl fullWidth>
                            <InputLabel id="modelo">Modelo</InputLabel>
                            <Select
                                labelId="modelo"
                                id="select-estado"
                                name="modelo"
                                value={modelo}
                                label="Modelo"
                                onChange={handleSelectChange}
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
                    sx={{ p: { sm: 2 } }} >
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                    >
                        <Grid item>
                            <Button
                                variant="contained"
                                color="inherit"
                                onClick={() => onClickBuscar()}
                                startIcon={<SearchIcon />}>
                                Buscar
                            </Button>
                        </Grid>
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
                        data={vehiculos} />
                </Box>
            </Box>
        </>
    )
}
