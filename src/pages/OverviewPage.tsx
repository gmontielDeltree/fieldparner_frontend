
import React, { useState } from 'react';
import { AppLayout, DataTable } from '../components';
import { Presupuestos, ColumnProps } from '../types';
import { Box, Button, Fab, FormControl, Grid, InputLabel, MenuItem, Pagination, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';


const columns: ColumnProps[] = [
    { text: 'Nro', align: 'left' },
    { text: 'Proveedor/Cliente', align: 'center' },
    { text: 'Estado', align: 'center' },
    { text: 'Moneda', align: 'center' },
    { text: 'Total Presupuesto', align: 'center' }];

const data: Presupuestos[] = [
    { nro: '00100', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00101', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00102', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00103', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00104', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
];

export const OverviewPage: React.FC = () => {

    const [estado, setEstado] = useState('');
    const [periodo, setPeriodo] = useState('');

    const handleChangeEstado = (event: SelectChangeEvent): void => {
        setEstado(event.target.value as string);
    };

    const handleChangePeriodo = (event: SelectChangeEvent): void => {
        setPeriodo(event.target.value as string);
    };


    return (
        <AppLayout>
            <Grid
                container
                spacing={2}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2, mt: { sm: 2 } }}
            >
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel id="label-estado-equipo">Estado</InputLabel>
                        <Select
                            labelId="label-estado-equipo"
                            id="select-estado"
                            value={estado}
                            label="Estado"
                            onChange={handleChangeEstado}
                        >
                            <MenuItem value={"Activo"}>Activo</MenuItem>
                            <MenuItem value={"Fuera de servicio"}>Fuera de servicio</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Número de Cliente"
                        variant="outlined"
                        type='text'
                        placeholder='Ingrese el número de Cliente'
                        fullWidth />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Proveedor"
                        variant="outlined"
                        type='text'
                        placeholder='Nombre del Proveedor'
                        fullWidth />
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel id="label-periodo">Periodo</InputLabel>
                        <Select
                            labelId="label-periodo"
                            id="select-periodo"
                            value={periodo}
                            label="Periodo"
                            onChange={handleChangePeriodo}
                        >
                            <MenuItem value={"Ultimos 30 dias"}>Últimos 30 días</MenuItem>
                            <MenuItem value={"3 meses"}>3 meses</MenuItem>
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
        </AppLayout>
    )
}
