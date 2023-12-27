import React from 'react';
import { Box, Grid, InputAdornment, TextField } from '@mui/material';
import { Mantenimiento, Vehicle } from '../../types';
import MaintenanceTable from '../DataTable/MaintenanceTable';


const columns = ['Fecha', 'Kilometros', 'Descripcion', 'Observaciones', 'Proximo mantenimiento'];

export interface MantenimientosProps {
    vehiculo: Vehicle;
    setVehiculo: React.Dispatch<React.SetStateAction<Vehicle>>;
}


export const Mantenimientos: React.FC<MantenimientosProps> = ({
    vehiculo,
    setVehiculo
}) => {

    // const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>(vehiculo.mantenimientos);
    const {
        vehicleType,
        make,
        model,
    } = vehiculo;

    const handleAddMaintenance = (maintenance: Mantenimiento) => {
        setVehiculo(prevState => ({
            ...prevState,
            maintenances: [maintenance, ...prevState.maintenances]
        }))
    };

    const handleDeleteMaintenance = (id: string) => {
        setVehiculo(prevState => ({
            ...prevState,
            maintenances: prevState.maintenances.filter(
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
                        value={vehicleType}
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
                        value={make}
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
                        value={model}
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
                    rows={vehiculo.maintenances}
                    handleAddRow={handleAddMaintenance}
                    deleteRow={handleDeleteMaintenance}
                />
            </Box>
        </>
    )
}