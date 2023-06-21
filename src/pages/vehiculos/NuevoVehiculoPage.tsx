import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Mantenimiento, TipoCombustible, TipoVehiculo, Vehiculo } from '../../types';
import { useAppDispatch, useForm } from '../../hooks';
import uuid4 from 'uuid4';
import { agregarNuevoVehiculo } from '../../redux/slices/vehiculo';
import { DatosGenerales, Especificaciones, Mantenimientos } from '../../components/NuevoVehiculo';

// const tipoVehiculos: string[] = Object.keys(TipoVehiculo);
// const tipoCombustibles: string[] = Object.keys(TipoCombustible);
const listaAños: string[] = ["1999", "2000", "2010"];
const dataMant: Mantenimiento[] = [
    {
        id: (new Date().getTime() - 100).toString(),
        fecha: new Date().toLocaleDateString(),
        kilometros: 900000,
        descripcion: 'Aceite, Filtros, Pastillas de Freno',
        observacion: 'Ajustar direcciones',
        proximo: new Date().toLocaleDateString()
    },
];

const initialState: Vehiculo = {
    tipoVehiculo: '',
    patente: '',
    marca: '',
    modelo: '',
    año: listaAños[0],
    tara: 0,
    neto: 0,
    tipoCombustible: '',
    capacidadCombustible: 0,
    unidadMedida: '',
    conectividad: '',
    nro: '',
    nroPoliza: '',
    seguro: '',
    tipoCobertura: '',
    propietario: '',
    ultimoMantenimiento: '',
    seguroFechaInicio: '',
    seguroFechaVencimiento: '',
    bruto: 0,
    otroTipoVehiculo: '',
    especificacionesTecnicas: [],
    mantenimientos: dataMant,
}


const steps = ['Datos Generales', 'Especificaciones Tecnicas', 'Mantenimientos'];

export const NuevoVehiculoPage: React.FC = () => {

    const dispatch = useAppDispatch();
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const { formulario, setFormulario, handleInputChange, handleSelectChange } = useForm(initialState);

    const getStepContent = useMemo(() => (step: number) => {
        switch (step) {
            case 0:
                return (<DatosGenerales
                    vehiculo={formulario}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange} />);
            case 1:
                return (<Especificaciones
                    vehiculo={formulario}
                    setVehiculo={setFormulario}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange} />);
            case 2:
                return (<Mantenimientos
                    vehiculo={formulario}
                    setVehiculo={setFormulario} />);
            default:
                throw new Error('Step no encontrado.');
        }
    }, [formulario, handleInputChange, handleSelectChange]);

    const onClickCancelar = useCallback(() => navigate('/overview/vehiculo'), []);

    const onClickAgregar = useCallback((e: any) => {
        e.preventDefault();
        const nuevoVehiculo = {
            ...formulario,
            nro: uuid4()
        };
        dispatch(agregarNuevoVehiculo(nuevoVehiculo));
        navigate('/overview/vehiculo');
    }, [formulario, dispatch]);

    const handleNext = () => {
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                margin: 0,
                ml: 2,
                mb: 1,
            }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 2 } }}>
                <Typography
                    component="h2"
                    align='center'
                    variant='h4'
                    sx={{ ml: { sm: 2 } }} >
                    Vehiculo
                </Typography>
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
                        sx={{ mt: { sm: 5 } }}>
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant="contained"
                                color='inherit'
                                onClick={(activeStep !== 0) ? handleBack : onClickCancelar}
                                sx={{ ml: 1 }}
                                fullWidth
                            >
                                {(activeStep !== 0) ? 'Volver' : 'Cancelar'}
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button
                                type='submit'
                                variant="contained"
                                color='primary'
                                onClick={handleNext}
                                fullWidth
                            >
                                {activeStep === steps.length - 1 ? 'Agregar' : 'Siguiente'}
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                type='submit'
                                variant="contained"
                                color='success'
                                onClick={handleNext}
                                fullWidth
                            >
                                Guardar
                            </Button>
                        </Grid>
                    </Grid>
                </>
            </Paper>
        </Container>
    )
}