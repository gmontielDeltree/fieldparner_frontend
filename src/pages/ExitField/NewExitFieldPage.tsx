import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography, Alert } from '@mui/material';
import { GeneralData, Loading, TemplateLayout, TransportDestination } from '../../components';
import {
    Agriculture as AgricultureIcon,
    ArrowRightAlt as ArrowRightAltIcon
} from '@mui/icons-material';
import { useBusiness, useExitField, useForm, useStockMovement, useVehicle } from '../../hooks';
import { Crop, Deposit, ExitFieldItem } from '../../types';
import { getShortDate } from '../../helpers/dates';
import { useTranslation } from 'react-i18next';
import { useField } from '../../hooks/useField';
import { StockItem, TipoStock } from '../../interfaces/stock';
import { validateStep, hasErrors } from '../../helpers/validation';

const initialState: ExitFieldItem = {
    creationDate: getShortDate(false, "-"),
    campaignId: "",
    fieldId: "",
    lotId: "",
    transportDocument: "",
    ticket: "",
    additionalInformation: "",
    vehicleId: "",
    chassis: "",
    depositId: "",
    destination: "",
    location: "",
    transportId: "",
    truckerId: "",
    truckTrailerId: "",
    harvesterId: "",
    cropId: "",
    grossWeight: 0,
    humidityPercentage: 0,
    kgNet: 0,
    mermaPercentage: 0,
    netWeight: 0,
    otherPercentage: 0,
    tareWeight: 0,
    totalMerma: 0,
    volatilePercentage: 0,
    accountId: "",
}

export const NewExitFieldPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const { t } = useTranslation();
    const {
        formulario: formValues,
        handleInputChange,
        handleSelectChange,
        handleFormValueChange,
        setFormulario: setFormValues,
        reset
    } = useForm(initialState);

    // Form validation state
    const [errors, setErrors] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    const [loading, setLoading] = useState(false);
    const [stockFromCrops, setStockFromCrops] = useState<StockItem[]>([]);
    const [depositsFromCrop, setDepositsFromCrop] = useState<Deposit[]>([]);
    const { getStock } = useStockMovement();
    const { businesses: socialEntities, getBusinesses } = useBusiness();
    const { vehicles, getVehicles } = useVehicle();
    const { isLoading, createExitField } = useExitField();
    const { fields, getFields } = useField();

    const { campaignId, fieldId, lotId, cropId } = formValues;

    const steps = [
        t("general_data"),
        t("transport_destiny"),
    ];

    // Validate form on change
    useEffect(() => {
        setErrors(validateStep(formValues, activeStep));
    }, [formValues, activeStep]);

    const getStepContent = useMemo(
        () => (step: number) => {
            switch (step) {
                case 0:
                    return (
                        <GeneralData
                            key="general-data-exit-field"
                            formValues={formValues}
                            crops={stockFromCrops.filter(s => s.dataCrop).map((stock) => stock.dataCrop) as Crop[]}
                            deposits={depositsFromCrop}
                            listFields={fields}
                            handleInputChange={handleInputChange}
                            setFormValues={setFormValues}
                            errors={errors}
                            showErrors={showErrors}
                        />
                    );
                case 1:
                    return (
                        <TransportDestination
                            key="transport-destination-exit-field"
                            formValues={formValues}
                            vehicles={vehicles}
                            socialEntities={socialEntities}
                            handleInputChange={handleInputChange}
                            handleSelectChange={handleSelectChange}
                            setFormValues={setFormValues}
                            errors={errors}
                            showErrors={showErrors}
                        />
                    );
                default:
                    throw new Error("Step no encontrado.");
            }
        },
        [
            formValues,
            setFormValues,
            handleInputChange,
            handleSelectChange,
            handleFormValueChange,
            depositsFromCrop,
            vehicles,
            socialEntities,
            fields,
            stockFromCrops,
            errors,
            showErrors
        ]
    );

    const onClickCancelar = () => {
        navigate("/init/overview/exit-field");
    };

    const handleNext = () => {
        // Validate the current step before proceeding
        const stepErrors = validateStep(formValues, activeStep);

        if (hasErrors(stepErrors)) {
            setShowErrors(true);
            return;
        }

        setActiveStep(activeStep + 1);
        setShowErrors(false);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
        setShowErrors(false);
    };

    const onClickSaveExitField = async () => {
        // Validate the final step before saving
        const stepErrors = validateStep(formValues, activeStep);

        if (hasErrors(stepErrors)) {
            setShowErrors(true);
            return;
        }

        try {
            const { humidityPercentage, mermaPercentage, volatilePercentage, otherPercentage, grossWeight, tareWeight } = formValues;

            // Ensure all percentage values are valid numbers and not negative
            const safeHumidity = Math.max(0, Number(humidityPercentage) || 0);
            const safeMerma = Math.max(0, Number(mermaPercentage) || 0);
            const safeVolatile = Math.max(0, Number(volatilePercentage) || 0);
            const safeOther = Math.max(0, Number(otherPercentage) || 0);

            // Calculate total merma, ensuring it doesn't exceed 100%
            const totalMerma = Math.min(100, safeHumidity + safeMerma + safeVolatile + safeOther);

            // Ensure weights are valid numbers and not negative
            const safeGrossWeight = Math.max(0, Number(grossWeight) || 0);
            const safeTareWeight = Math.max(0, Number(tareWeight) || 0);

            // Ensure tare weight doesn't exceed gross weight
            const adjustedTareWeight = Math.min(safeTareWeight, safeGrossWeight);

            // Calculate net weight (ensuring it's never negative)
            const netWeight = Math.max(0, safeGrossWeight - adjustedTareWeight);

            // Calculate kg net (ensuring it's never negative)
            const kgNet = Math.max(0, netWeight - ((netWeight * totalMerma) / 100));

            await createExitField({
                ...formValues,
                // Ensure we send safe values
                humidityPercentage: safeHumidity,
                mermaPercentage: safeMerma,
                volatilePercentage: safeVolatile,
                otherPercentage: safeOther,
                grossWeight: safeGrossWeight,
                tareWeight: adjustedTareWeight,
                totalMerma,
                netWeight,
                kgNet
            });
            reset();
            navigate("/init/overview/exit-field");
        } catch (error) {
            console.error("Error al crear salida de campo:", error);
            Swal.fire('Error', 'No se pudo crear la salida de campo. Por favor, verifique los datos e intente nuevamente.', 'error');
        }
    }

    useEffect(() => {
        getBusinesses();
        getVehicles();
        getFields();
    }, [])

    useEffect(() => {
        const getCropsWithStock = async () => {
            setLoading(true);
            const responseStockTypeCrop = await getStock({
                tipo: TipoStock.CULTIVO,
                campaignId: campaignId,
                fieldId: fieldId,
                fieldLot: lotId
            }, true);
            if (responseStockTypeCrop?.length) setStockFromCrops(responseStockTypeCrop);
            setLoading(false);
        }

        if (campaignId && fieldId && lotId) {
            getCropsWithStock();
        }
    }, [campaignId, fieldId, lotId])

    useEffect(() => {
        const filterDepositsByCrop = () => {
            const deposits = stockFromCrops
                .filter(s => s.dataCrop?._id === cropId)
                .map(s => s.dataDeposit) as Deposit[];
            setDepositsFromCrop(deposits);
        }

        if (stockFromCrops.length && cropId) filterDepositsByCrop();
    }, [stockFromCrops, cropId])


    return (
        <TemplateLayout key="new-exit-field-page" viewMap={true}>
            {isLoading || loading && <Loading loading={true} />}
            <Container
                maxWidth="lg"
                sx={{
                    margin: 0,
                    p: { sm: 0, md: 0 },
                    mb: 1,
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{ p: { xs: 2, md: 1 } }}
                >
                    <Box
                        component="div"
                        display="flex"
                        alignItems="center"
                        sx={{ ml: { sm: 2 }, pt: 2 }}
                    >
                        <AgricultureIcon fontSize='large' /> <ArrowRightAltIcon fontSize='large' />
                        <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
                            {t("field_output")}
                        </Typography>
                    </Box>
                    <Stepper activeStep={activeStep} sx={{ pt: 5, pb: 5 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <>
                        {showErrors && hasErrors(errors) && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {t("form_validation_error")}
                            </Alert>
                        )}
                        {getStepContent(activeStep)}
                        <Grid
                            container
                            spacing={2}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: { sm: 5 } }}
                        >
                            <Grid item xs={12} sm={3}>
                                <Button
                                    variant="contained"
                                    color="inherit"
                                    onClick={activeStep !== 0 ? handleBack : onClickCancelar}
                                    sx={{ ml: 1 }}
                                >
                                    {activeStep !== 0 ? t("id_back") : t("id_cancel")}
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                {!(activeStep === steps.length - 1) && (
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        onClick={handleNext}
                                        fullWidth
                                    >
                                        {t("id_next")}
                                    </Button>
                                )}
                            </Grid>
                            {(activeStep === steps.length - 1) && (
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="success"
                                        onClick={() => onClickSaveExitField()}
                                        fullWidth
                                    >
                                        {t("_add")}
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </>
                </Paper>
            </Container>
        </TemplateLayout>
    )
}