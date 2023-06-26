import React, { ChangeEvent, useState } from 'react';
import { Box, Button, Fab, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { RowData, TipoCombustible, TipoVehiculo, Vehiculo } from '../../types';
import { Add as AddIcon, FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import EspecificationTable from '../DataTable/EspecificationTable';

const tipoCombustibles: string[] = Object.keys(TipoCombustible);

const columns = ['Especificacion', 'Descripcion'];

export interface EspecificacionesProps {
    vehiculo: Vehiculo;
    setVehiculo: React.Dispatch<React.SetStateAction<Vehiculo>>;
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
}


export const Especificaciones: React.FC<EspecificacionesProps> = ({
    vehiculo,
    handleInputChange,
    handleSelectChange,
    setVehiculo
}) => {

    // const [especificaciones, setEspecificaciones] = useState<RowData[]>([
    //     { name: 'Servicio', description: 'Cambio de aceite cada 10.000km' }
    // ]);

    const {
        tipoCombustible,
        capacidadCombustible,
        unidadMedida,
        conectividad,
        tara,
        bruto,
        neto,
        especificacionesTecnicas } = vehiculo;

    const handleAgregarEspecificacion = (row: RowData) => {
        setVehiculo(prevState => ({
            ...prevState,
            especificacionesTecnicas: [row, ...prevState.especificacionesTecnicas]
        }));

    };

    const handleEliminarEspecificacion = (row: RowData) => {
        setVehiculo(prevState => ({
            ...prevState,
            especificacionesTecnicas: prevState.especificacionesTecnicas.filter(
                x => x.name !== row.name
            )
        }));
    }

    return (
        <>
            <Box display="flex" alignItems="center" sx={{ m: 1, mb: 2 }}>
                <FolderOpenIcon sx={{ mx: 1 }} />
                <Typography variant="h5">
                    Características
                </Typography>
            </Box>
            <Grid
                container
                spacing={3}
                direction="row"
                alignItems="center"
                justifyContent="space-between">
                <Grid item xs={12} sm={4} >
                    <TextField
                        label="Tara"
                        variant="outlined"
                        type='number'
                        name="tara"
                        inputProps={{ min: '0' }}
                        value={(tara === 0) ? '' : tara}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">kg</InputAdornment>
                        }}
                        onChange={handleInputChange}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={4} >
                    <TextField
                        label="Bruto"
                        variant="outlined"
                        type='number'
                        name="bruto"
                        inputProps={{ min: '0' }}
                        value={(bruto === 0) ? '' : bruto}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">kg</InputAdornment>
                        }}
                        onChange={handleInputChange}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={4} >
                    <TextField
                        label="Neto"
                        variant="outlined"
                        type='number'
                        name="neto"
                        inputProps={{ min: '0' }}
                        value={(neto === 0) ? '' : neto}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">kg</InputAdornment>
                        }}
                        onChange={handleInputChange}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6} >
                    <TextField
                        label="Capacidad de Combustible"
                        variant="outlined"
                        type='number'
                        name="capacidadCombustible"
                        inputProps={{ min: '0' }}
                        value={(capacidadCombustible === 0) ? '' : capacidadCombustible}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">L</InputAdornment>
                        }}
                        onChange={handleInputChange}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        label="Unidad de Medida"
                        variant="outlined"
                        type='text'
                        name="unidadMedida"
                        value={unidadMedida}
                        onChange={handleInputChange}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        label="Conectividad"
                        variant="outlined"
                        type='text'
                        name="conectividad"
                        value={conectividad}
                        onChange={handleInputChange}
                        fullWidth />
                </Grid>
                {/* <Grid item xs={12} sm={1} justifyContent="flex-start">
                    <Fab
                        color="success"
                        aria-label="add"
                        size='medium'
                        onClick={() => handleAgregarEspecificacion()}
                    >
                        <AddIcon />
                    </Fab>
                </Grid> */}
            </Grid>
            <Box component="div" sx={{ mt: 3 }}>
                <EspecificationTable
                    key="tabla-especificaciones-tecnicas"
                    columns={columns}
                    rows={especificacionesTecnicas}
                    handleAddRow={handleAgregarEspecificacion}
                    deleteRow={handleEliminarEspecificacion}
                />
            </Box>
        </>
    )
}