import React from 'react';
import { Box, Grid, InputAdornment, TextField } from '@mui/material';
import { Mantenimiento, Vehiculo } from '../../types';
import MaintenanceTable from '../DataTable/MaintenanceTable';


const columns = ['Fecha', 'Kilometros', 'Descripcion', 'Observaciones', 'Proximo mantenimiento'];

export interface MantenimientosProps {
    vehiculo: Vehiculo;
    setVehiculo: React.Dispatch<React.SetStateAction<Vehiculo>>;
}


export const Mantenimientos: React.FC<MantenimientosProps> = ({
    vehiculo,
    setVehiculo
}) => {

    // const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>(vehiculo.mantenimientos);
    const {
        tipoVehiculo,
        marca,
        modelo } = vehiculo;

    const handleAddMaintenance = (maintenance: Mantenimiento) => {
        setVehiculo(prevState => ({
            ...prevState,
            mantenimientos: [maintenance, ...prevState.mantenimientos]
        }))
        // setMantenimientos(prevState =>
        //     [maintenance, ...prevState]);
    };

    const handleDeleteMaintenance = (id: string) => {
        // setMantenimientos(mantenimientos.filter(
        //     x => x.id !== id
        // ));
        setVehiculo(prevState => ({
            ...prevState,
            mantenimientos: prevState.mantenimientos.filter(
                x => x.id !== id
            )
        }));
    }

    return (
        <>
            <Grid
                container
                spacing={2}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 1 }}
            >
                <Grid item xs={12} sm={4} >
                    <TextField
                        label="Tipo Vehiculo"
                        variant="outlined"
                        type='text'
                        disabled
                        value={tipoVehiculo}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={4} >
                    <TextField
                        label="Marca"
                        variant="outlined"
                        type='text'
                        disabled
                        value={marca}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
                <Grid item xs={12} sm={4} >
                    <TextField
                        label="Modelo"
                        variant="outlined"
                        type='text'
                        disabled
                        value={modelo}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth />
                </Grid>
            </Grid>
            <Box component="div" sx={{ mt: 3 }}>
                <MaintenanceTable
                    key="table-mantenimiento"
                    columns={columns}
                    rows={vehiculo.mantenimientos}
                    handleAddRow={handleAddMaintenance}
                    deleteRow={handleDeleteMaintenance}
                />
            </Box>
        </>
    )
}