import { Button, FormControl, FormHelperText, Grid, IconButton, Input, InputAdornment, InputLabel, ListItemText, MenuItem, Paper, Select, TextField, Typography, Card, CardContent, Divider, Autocomplete } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Company } from '../../interfaces/company';
import { Campaign, Crop } from '../../types';
import { Business } from '../../interfaces/socialEntity';
import {
    CloudUpload as CloudUploadIcon,
    Cancel as CancelIcon,
    Business as BusinessIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import i18n from '../../i18n';
import { CertificateDeposit, CertificatePDFResponse } from '../../interfaces/certificate-deposit';
import NotificationService from '../../services/notificationService';

interface HeaderFormProps {
    formData: CertificateDeposit;
    campaigns: Campaign[];
    providers: Business[];
    companies: Company[];
    errors: Record<string, string>;
    updateFormData: (path: string, value: any) => void;
    deleteFile: () => void;
    fileUpload: (file: File) => void;
    changeDepositary: (depositary: Business) => void;
    changeDepositors: (depositors: Company) => void;
    onPdfProcessed?: (data: CertificatePDFResponse) => void;
    onProcessingChange?: (isProcessing: boolean) => void;
}

export const HeaderForm: React.FC<HeaderFormProps> = ({
    formData,
    campaigns,
    providers,
    companies,
    errors,
    updateFormData,
    deleteFile,
    fileUpload,
    changeDepositary,
    changeDepositors,
    onPdfProcessed,
    onProcessingChange
}) => {
    const [selectedDepositary, setSelectedDepositary] = useState<Business | null>(null);
    const [selectedDepositors, setSelectedDepositors] = useState<Company | null>(null);
    const [isProcessingPDF, setIsProcessingPDF] = useState<boolean>(false);

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const processCertificatePDF = async (base64Pdf: string): Promise<CertificatePDFResponse | null> => {
        try {
            const apiUrl = import.meta.env.VITE_AUTH_API;
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${apiUrl}certificado-deposito/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                },
                body: JSON.stringify({ base64Pdf }),
            });

            return response.json();
        } catch (error) {
            console.error('Error al procesar el certificado PDF:', error);
            NotificationService.showError('Error al procesar el certificado PDF');
            return null;
        }
    };

    const removeFile = () => {
        updateFormData('archivoCertificado', '');
        deleteFile();
    };

    const generateUniqueId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const onChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            try {
                setIsProcessingPDF(true);
                onProcessingChange?.(true);

                let fileNameOriginal = file.name;
                let extensionPos = fileNameOriginal.lastIndexOf(".");
                let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

                const uniqueId = generateUniqueId();
                const newFileName = `certificado-deposito_${uniqueId}${fileType}`;

                const renamedFile = new File([file], newFileName, { type: file.type });
                fileUpload(renamedFile);
                updateFormData('archivoCertificado', newFileName);

                if (fileType.toLowerCase() === '.pdf') {
                    const base64 = await convertFileToBase64(file);
                    const pdfData = await processCertificatePDF(base64);

                    if (onPdfProcessed && pdfData) {
                        onPdfProcessed(pdfData);
                    }
                }
            } catch (error) {
                console.error('Error al procesar el PDF:', error);
                NotificationService.showError('Hubo un error al procesar el PDF');
            } finally {
                setIsProcessingPDF(false);
                onProcessingChange?.(false);
            }
        }
    };

    useEffect(() => {
        if (formData.depositario.cuit && providers) {
            const foundDepositary = providers.find(x => x.cuit === formData.depositario.cuit);
            if (foundDepositary) {
                setSelectedDepositary(foundDepositary);
                changeDepositary(foundDepositary);
            }
        }
    }, [formData.depositario.cuit, providers]);

    useEffect(() => {
        if (formData.depositante.cuit && companies) {
            const foundCompany = companies.find(x => x.trybutaryCode === formData.depositante.cuit);
            if (foundCompany) {
                changeDepositors(foundCompany);
                setSelectedDepositors(foundCompany);
            }
        }
    }, [formData.depositante.cuit, companies]);

    return (
        <Grid container spacing={2} sx={{ px: 1 }}>
            {/* Sección: Información General */}
            <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    Información General
                </Typography>
            </Grid>

            {/* Primera fila */}
            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="COE"
                    name="coe"
                    value={formData.certificacionElectronicaGranos.coe}
                    onChange={(e) => updateFormData('certificacionElectronicaGranos.coe', e.target.value)}
                    error={!!errors['certificacionElectronicaGranos.coe']}
                    helperText={errors['certificacionElectronicaGranos.coe']}
                    fullWidth
                />
            </Grid>

            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="date"
                    label="Fecha Emisión"
                    name="fechaEmision"
                    value={formData.certificacionElectronicaGranos.fechaEmision}
                    onChange={(e) => updateFormData('certificacionElectronicaGranos.fechaEmision', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
            </Grid>

            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Tipo Certificado"
                    name="tipoCertificado"
                    value={formData.certificacionElectronicaGranos.tipoCertificado}
                    onChange={(e) => updateFormData('certificacionElectronicaGranos.tipoCertificado', e.target.value)}
                    fullWidth
                />
            </Grid>

            <Grid item xs={12} sm={3}>
                <Autocomplete
                    freeSolo
                    options={campaigns || []}
                    getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        return option.name || option.description || '';
                    }}
                    value={campaigns?.find(c => c.campaignId === formData.campaniaId) || (formData.certificacionElectronicaGranos.campana ? String(formData.certificacionElectronicaGranos.campana) : '')}
                    onChange={(_, newValue) => {
                        if (typeof newValue === 'string') {
                            updateFormData('campaniaId', newValue);
                        } else if (newValue) {
                            updateFormData('campaniaId', newValue.campaignId);
                        } else {
                            updateFormData('campaniaId', '');
                        }
                    }}
                    onInputChange={(_, newInputValue) => {
                        if (!campaigns?.find(c => (c.name || c.description) === newInputValue)) {
                            updateFormData('campaniaId', newInputValue);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Campaña" variant="outlined" />
                    )}
                    fullWidth
                />
            </Grid>

            {/* Segunda fila */}
            <Grid item xs={12} sm={4}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Grano y Tipo"
                    name="granoYTipo"
                    value={formData.certificacionElectronicaGranos.granoYTipo}
                    onChange={(e) => updateFormData('certificacionElectronicaGranos.granoYTipo', e.target.value)}
                    fullWidth
                />
            </Grid>

            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Planta N°"
                    name="plantaNro"
                    value={formData.plantaNro}
                    onChange={(e) => updateFormData('plantaNro', e.target.value)}
                    fullWidth
                />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    disabled={isProcessingPDF}
                    color={formData.archivoCertificado ? "success" : "primary"}
                    sx={{ minWidth: 140 }}
                >
                    {isProcessingPDF ? 'Procesando...' : 'Cargar PDF'}
                    <Input
                        type="file"
                        hidden
                        inputProps={{ accept: 'application/pdf' }}
                        onChange={onChangeFile}
                    />
                </Button>
                {formData.archivoCertificado ? (
                    <>
                        <Typography
                            variant="body2"
                            sx={{
                                ml: 1,
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}
                            title={formData.archivoCertificado}
                        >
                            {formData.archivoCertificado}
                        </Typography>
                        <IconButton onClick={removeFile} color="error" disabled={isProcessingPDF} size="small">
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </>
                ) : (
                    <Typography variant="body2" sx={{ ml: 1 }} color="text.secondary">
                        {isProcessingPDF ? 'Procesando...' : 'Sin archivo'}
                    </Typography>
                )}
            </Grid>

            {/* Sección: Depositario y Depositante */}
            <Grid item xs={12} sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Card Depositario */}
            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" />
                            Depositario
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Autocomplete
                                    freeSolo
                                    options={providers || []}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'string') return option;
                                        return option.razonSocial || '';
                                    }}
                                    value={providers?.find(x => x.cuit === formData.depositario.cuit) || formData.depositario.razonSocial || ''}
                                    onChange={(_, newValue) => {
                                        if (typeof newValue === 'string') {
                                            updateFormData('depositario.razonSocial', newValue);
                                        } else if (newValue) {
                                            updateFormData('depositario.cuit', newValue.cuit);
                                            updateFormData('depositario.razonSocial', newValue.razonSocial);
                                            updateFormData('depositario.domicilio', newValue.domicilio || '');
                                            updateFormData('depositario.localidad', newValue.localidad || '');
                                            updateFormData('depositario.provincia', newValue.provincia || '');
                                            setSelectedDepositary(newValue);
                                            changeDepositary(newValue);
                                        } else {
                                            updateFormData('depositario.cuit', '');
                                            updateFormData('depositario.razonSocial', '');
                                        }
                                    }}
                                    onInputChange={(_, newInputValue) => {
                                        if (!providers?.find(x => x.razonSocial === newInputValue)) {
                                            updateFormData('depositario.razonSocial', newInputValue);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Razón Social"
                                            variant="outlined"
                                            error={!!errors['depositario.cuit']}
                                            helperText={errors['depositario.cuit']}
                                        />
                                    )}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">CUIT</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositario.cuit || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">IVA</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositario.iva || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Domicilio</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositario.domicilio || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Localidad</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositario.localidad || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Provincia</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositario.provincia || '-'}</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Card Depositante */}
            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="secondary" />
                            Depositante
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Autocomplete
                                    freeSolo
                                    options={companies || []}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'string') return option;
                                        return option.socialReason || '';
                                    }}
                                    value={companies?.find(x => x.trybutaryCode === formData.depositante.cuit) || formData.depositante.razonSocial || ''}
                                    onChange={(_, newValue) => {
                                        if (typeof newValue === 'string') {
                                            updateFormData('depositante.razonSocial', newValue);
                                        } else if (newValue) {
                                            updateFormData('depositante.cuit', newValue.trybutaryCode);
                                            updateFormData('depositante.razonSocial', newValue.socialReason);
                                            updateFormData('depositante.domicilio', newValue.address || '');
                                            updateFormData('depositante.localidad', newValue.locality || '');
                                            updateFormData('depositante.provincia', newValue.province || '');
                                            setSelectedDepositors(newValue);
                                            changeDepositors(newValue);
                                        } else {
                                            updateFormData('depositante.cuit', '');
                                            updateFormData('depositante.razonSocial', '');
                                        }
                                    }}
                                    onInputChange={(_, newInputValue) => {
                                        if (!companies?.find(x => x.socialReason === newInputValue)) {
                                            updateFormData('depositante.razonSocial', newInputValue);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Razón Social"
                                            variant="outlined"
                                            error={!!errors['depositante.cuit']}
                                            helperText={errors['depositante.cuit']}
                                        />
                                    )}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">CUIT</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositante.cuit || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">IVA</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositante.iva || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Domicilio</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositante.domicilio || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Localidad</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositante.localidad || '-'}</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Provincia</Typography>}
                                    secondary={<Typography variant="body2">{formData.depositante.provincia || '-'}</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};
