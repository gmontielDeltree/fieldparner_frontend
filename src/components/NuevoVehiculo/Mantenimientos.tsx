import React, { SetStateAction } from 'react';
import { Box, Button, Grid, IconButton, Input, InputAdornment, TextField, Typography } from '@mui/material';
import { Mantenimiento, Vehicle } from '../../types';
import MaintenanceTable from '../DataTable/MaintenanceTable';
import {
    Cancel as CancelIcon,
    CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import uuid4 from 'uuid4';


const columns = ['Fecha', 'Kilometros', 'Descripcion', 'Observaciones', 'Proximo mantenimiento'];

export interface MantenimientosProps {
    vehiculo: Vehicle;
    setVehiculo: React.Dispatch<React.SetStateAction<Vehicle>>;
    handleFormValueChange: (key: string, value: string) => void;
    setFilesUpload: React.Dispatch<SetStateAction<File[]>>;
    cancelFile: (indexToRemove: number) => void;
}


export const Mantenimientos: React.FC<MantenimientosProps> = ({
    vehiculo,
    setVehiculo,
    handleFormValueChange,
    setFilesUpload,
    cancelFile
}) => {

    const {
        vehicleType,
        make,
        model,
        documentVehicleFile
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
    const removeFile = (index: number) => {
        handleFormValueChange("documentVehicleFile", "");
        cancelFile(index);
      }
    
      const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
          let fileNameOriginal = file.name;
          let extensionPos = fileNameOriginal.lastIndexOf(".");
          let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);
    
          const newFileName = `document-vehicle_${uuid4()}${fileType}`;
          const renamedFile = new File([file], newFileName, { type: file.type });
          setFilesUpload(prevState => [...prevState, renamedFile])
          handleFormValueChange("documentVehicleFile", newFileName);
        }
      };

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
                <Grid item xs={6} sm={6} sx={{ display: "flex", alignItems: "center", justifyContent: "start" }} >
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                    >
                        Documento
                        <Input
                            type="file"
                            hidden
                            onChange={handleFileUpload} />
                    </Button>
                    {documentVehicleFile ? (
                        <>
                            <label
                                title={documentVehicleFile}
                                style={{
                                    margin: "10px",
                                    width: "240px",
                                    display: "inline-block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}>
                                {documentVehicleFile}
                            </label>
                            <IconButton onClick={() => removeFile(0)} color="error">
                                <CancelIcon fontSize="medium" />
                            </IconButton>
                        </>
                    ) :
                        <Typography variant="body1" sx={{ ml: 1, display: "inline-block" }}>
                            Ningún archivo seleccionado
                        </Typography>
                    }
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