import React, { SetStateAction } from 'react';
import { Box, Button, Grid, IconButton, Input, InputAdornment, TextField, Typography } from '@mui/material';
import { Mantenimiento, Vehicle } from '../../types';
import MaintenanceTable from '../DataTable/MaintenanceTable';
import {
    Cancel as CancelIcon,
    CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useFileUploadHook } from './useDatosGenerales';

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
    const { t } = useTranslation();

    const { fileDisplayName, handleFileUpload, handleRemoveFile } = useFileUploadHook({
        setFilesUpload,
        onFileChange: (fileName) => handleFormValueChange("documentVehicleFile", fileName),
        cancelFile,
        onFileRemove: () => handleFormValueChange("documentVehicleFile", ""),
        fileTypePrefix: "maintenance-doc",
        acceptedFileTypes: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        returnBasicFile: false,
        initialFileName: vehiculo.documentVehicleFile
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
                                title={fileDisplayName}
                                style={{
                                    margin: "10px",
                                    width: "240px",
                                    display: "inline-block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}>
                                {fileDisplayName}
                            </label>
                            <IconButton onClick={() =>handleRemoveFile(0)} color="error">
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
                    columns={[t('date'), t('kilometers'), t('description'), t('observations'), t('nextMaintenance')]}
                    rows={vehiculo.maintenances}
                    handleAddRow={handleAddMaintenance}
                    deleteRow={handleDeleteMaintenance}
                />
            </Box>
        </>
    )
}