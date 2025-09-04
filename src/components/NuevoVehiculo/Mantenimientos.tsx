import React, { SetStateAction } from 'react';
import { Box, Button, Grid, IconButton, Input, InputAdornment, TextField, Typography } from '@mui/material';
import { Mantenimiento, Vehicle } from '../../types';
import MaintenanceTable from '../DataTable/MaintenanceTable';
import {
    Cancel as CancelIcon,
    CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {  useFileUploadHook } from './useDatosGenerales';


export interface MantenimientosProps {
    vehiculo: Vehicle;
    setVehiculo: React.Dispatch<React.SetStateAction<Vehicle>>;
    setFilesUpload: React.Dispatch<SetStateAction<File[]>>;
    cancelFile: (indexToRemove: number) => void;
}


export const Mantenimientos: React.FC<MantenimientosProps> = ({
    vehiculo,
    setVehiculo,
    setFilesUpload,
    cancelFile
}) => {
    const { t } = useTranslation();

    const { handleFileUpload, handleRemoveFile } = useFileUploadHook({
        setFilesUpload,
        onFileChange: (dataFileName) => setVehiculo(prev => ({ ...prev, documentVehicleFile: dataFileName })),
        cancelFile: (index = 0) => cancelFile(index), // Proporciona valor por defecto
        onFileRemove: () => setVehiculo(prev => ({ ...prev, documentVehicleFile: { originalName: '', uniqueName: '' } })),
        fileTypePrefix: "maintenance-doc",
        acceptedFileTypes: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        returnBasicFile: false,
        initialFileName: vehiculo.documentVehicleFile?.originalName
    });
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

    const updateMaintenance = (id: string, updatedMaintenance: Mantenimiento) => {
        setVehiculo(prevState => ({
            ...prevState,
            maintenances: prevState.maintenances.map(
                x => x.id === id ? updatedMaintenance : x
            )
        }));
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
                        label={t('vehicleType')}
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
                        label={t('brand')}
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
                        label={t('model')}
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
                        {t('document')}
                        <Input
                            type="file"
                            hidden
                            onChange={handleFileUpload} />
                    </Button>
                    {documentVehicleFile ? (
                        <>
                            <label
                                title={documentVehicleFile.originalName}
                                style={{
                                    margin: "10px",
                                    width: "240px",
                                    display: "inline-block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}>
                                {documentVehicleFile.originalName}
                            </label>
                            <IconButton onClick={() => handleRemoveFile(0)} color="error">
                                <CancelIcon fontSize="medium" />
                            </IconButton>
                        </>
                    ) :
                        <Typography variant="body1" sx={{ ml: 1, display: "inline-block" }}>
                            {t('noFileSelected')}
                        </Typography>
                    }
                </Grid>
            </Grid>
            <Box component="div" sx={{ mt: 3 }}>
                <MaintenanceTable
                    key="table-mantenimiento"
                    columns={[ t('realized'), t('date'), t('kilometers'), t('description'), t('observations'), t('nextMaintenance')]}
                    rows={vehiculo.maintenances}
                    handleAddRow={handleAddMaintenance}
                    deleteRow={handleDeleteMaintenance}
                    updateMaintenance={updateMaintenance}
                />
            </Box>
        </>
    )
}