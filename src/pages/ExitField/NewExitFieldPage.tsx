import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { GeneralData, Loading, TemplateLayout, TransportDestination } from '../../components';
import {
    Agriculture as AgricultureIcon,
    ArrowRightAlt as ArrowRightAltIcon
} from '@mui/icons-material';
import { useBusiness, useCampaign, useCrops, useDeposit, useExitField, useForm, useSupply, useVehicle } from '../../hooks';
import { ExitField, SupplyType } from '../../types';
import { getShortDate } from '../../helpers/dates';
import { useTranslation } from 'react-i18next';
import { useField } from '../../hooks/useField';



const initialState: ExitField = {
    creationDate: getShortDate(false, "-"),
    campaignId: "",
    cultive: "",
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
    // const dispatch = useAppDispatch();
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

    const { supplies, getSupplies } = useSupply();
    const { businesses: socialEntities, getBusinesses } = useBusiness();
    const { campaigns, getCampaigns } = useCampaign();
    const { vehicles, getVehicles } = useVehicle();
    const { deposits, getDeposits } = useDeposit();
    const { isLoading, createExitField } = useExitField();
    const { dataCrops, getCrops } = useCrops();
    const { fields, getFields } = useField();


    const steps = [
        t("transport_destiny"),
        t("general_data"),
    ];

    const getStepContent = useMemo(
        () => (step: number) => {
            switch (step) {
                case 0:
                    return (
                        <GeneralData
                            key="general-data-exit-field"
                            formValues={formValues}
                            crops={supplies.filter(supply => supply.type.toLowerCase() === SupplyType.Cultivo.toLowerCase())}
                            campaigns={campaigns}
                            listFields={fields}
                            handleInputChange={handleInputChange}
                            handleSelectChange={handleSelectChange}
                            setFormValues={setFormValues}
                        />
                    );
                case 1:
                    return (
                        <TransportDestination
                            key="transport-destination-exit-field"
                            formValues={formValues}
                            vehicles={vehicles}
                            socialEntities={socialEntities}
                            deposits={deposits}
                            handleInputChange={handleInputChange}
                            handleSelectChange={handleSelectChange}
                            setFormValues={setFormValues}
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
            supplies,
            deposits,
            vehicles,
            socialEntities,
            campaigns,
            dataCrops,
            fields,
        ]
    );

    const onClickCancelar = () => {
        navigate("/init/overview/exit-field");
    };

    const handleNext = () => {
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const onClickSaveExitField = async () => {
        const { humidityPercentage, mermaPercentage, volatilePercentage, otherPercentage, grossWeight, tareWeight } = formValues;
        const totalMerma = Number(humidityPercentage) + Number(mermaPercentage) + Number(volatilePercentage) + Number(otherPercentage);
        const netWeight = Number(grossWeight - tareWeight);
        const kgNet = (netWeight - ((netWeight * totalMerma) / 100));
        console.log('formValues', { ...formValues, totalMerma, netWeight, kgNet });
        await createExitField({ ...formValues, totalMerma, netWeight, kgNet });
        reset();
        navigate("/init/overview/exit-field");
    }

    useEffect(() => {
        getSupplies();
        getBusinesses();
        getVehicles();
        getDeposits();
        getCampaigns();
        getCrops();
        getFields();
    }, [])


    return (
        <TemplateLayout key="new-exit-field-page" viewMap={true}>
            {isLoading && <Loading loading={true} />}
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
                        </Grid>
                    </>
                </Paper>
            </Container>
        </TemplateLayout>
    )
}
