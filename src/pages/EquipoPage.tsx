
import React, { useMemo, useState } from 'react';
import { AppLayout, DataTable } from '../components';
import { Equipo, ColumnProps, TipoVehiculo } from '../types';
import { Box, Button, Fab, FormControl, Grid, InputLabel, MenuItem, Pagination, Select, TextField, Typography } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useForm } from '../hooks';
import { Equipos as DataEquipos } from '../data/Equipos';


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

export const EquipoPage: React.FC = () => {

    const [data, setData] = useState<Equipo[]>(DataEquipos);

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
        setData(data.filter(
            (equipo) =>
                (equipo.tipoVehiculo === tipoVehiculo) &&
                (marca && equipo.marca === marca) &&
                (patente && equipo.patente === patente) &&
                (modelo && equipo.modelo === modelo)
        ));
    }

    return (
        <AppLayout>
            <Typography component="h2" variant='h4' sx={{ ml: { sm: 5 } }} >
                Equipos
            </Typography>
            <Box bgcolor="#ffff" sx={{ borderRadius: 2 }}>
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2, mt: { sm: 2 } }}
                >
                    <Grid item xs={3}>
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
                    <Grid item xs={3}>
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
                    <Grid item xs={2}>
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
                    <Grid item xs={2}>
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
                    <Grid item xs={1}>
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
                        <Grid item >
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
                                startIcon={<AddIcon />}>
                                Nuevo Equipo
                            </Button>
                        </Grid>
                        <Grid item>
                            <Fab color="inherit" size='small' aria-label="edit">
                                <DownloadIcon />
                            </Fab>
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        display="flex"
                        justifyContent="flex-end"
                        alignItems="center">
                        <Typography>Mostrando: {5}</Typography>
                        <Pagination
                            count={5}
                            page={1}
                            onChange={() => console.log('onChangePagination')} />
                    </Grid>
                </Box>
                <Box component="div" sx={{ p: 1 }}>
                    <DataTable
                        key="datatable-equipo"
                        columns={columns}
                        data={data} />
                </Box>
            </Box>
        </AppLayout>
    )
}
