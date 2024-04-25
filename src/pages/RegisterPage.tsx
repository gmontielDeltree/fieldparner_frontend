import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
// import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useAppDispatch, useAuthStore, useFormValid } from '../hooks';
import { NavLink } from 'react-router-dom';
import { Alert, Checkbox, FormControlLabel } from '@mui/material';
import { onLogout } from '../redux/auth';
import { Loading } from '../components';
// import { Copyright } from '@mui/icons-material';



// TODO remove, this demo shouldn't need to reset the theme.

// como minimo 1 minúscula, 1 mayúscula , 1 número , 1 carácter especial y 8 carácteres de longitud.
const regexPassword = new RegExp(/(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,.\/?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/);
// palabra@palabra.com
const regexEmail = new RegExp(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/);
// Regex - Url con protocolo https
const regexUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/);

const initialState = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
};

const initialFormErrors = structuredClone(initialState);
export const RegisterPage: React.FC = () => {

    const dispatch = useAppDispatch();

    const {
        email,
        password,
        firstName,
        lastName,
        confirmPassword,
        formErrors,
        // setFormValues,
        setFormErrors,
        handleInputChange } = useFormValid(initialState, initialFormErrors);
    const { isLoading, errorMessage, startRegister } = useAuthStore();

    const validForm = (): boolean => {
        let valid = true;

        if (!(firstName || lastName)) {
            setFormErrors(prevState => ({
                ...prevState,
                firstName: !(firstName) ? 'Ingrese su nombre ' : '',
                lastName: !(lastName) ? 'Ingrese su apellido ' : ''
            }));
            valid = false;
        }
        if (email === '') {
            setFormErrors(prevState => ({
                ...prevState,
                email: 'Ingrese un email.'
            }));
            valid = false;
        }
        if (!regexEmail.test(email)) {
            setFormErrors(prevState => ({
                ...prevState,
                email: 'Ingrese un email válido.'
            }));
            valid = false;
        }
        if (!regexPassword.test(password)) {
            setFormErrors(prevState => ({
                ...prevState,
                password: 'La contraseña no cumple con los requisitos.'
            }));
            valid = false;
        }
        if (password === '') {
            setFormErrors(prevState => ({
                ...prevState,
                password: 'Introduzca una contraseña.'
            }));
            valid = false;
        }
        if (password.trim().toLowerCase() !== confirmPassword.trim().toLowerCase()) {
            setFormErrors(prevState => ({
                ...prevState,
                confirmPassword: 'La contraseña no coincide.',
            }));
            valid = false;
        }
        return valid;
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validForm()) {
            startRegister({
                email,
                password,
                name: `${firstName.trim()} ${lastName.trim()}`
            });
        }
    };

    useEffect(() => {
        return () => {
            dispatch(onLogout(""));
        }
    }, [dispatch])


    return (
        <Container component="main" maxWidth="sm">
            {
                isLoading && <Loading key="loading-auth" loading={true} />
            }
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box display="flex" sx={{ margin: 'auto', mb: 5, }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        backgroundImage: 'url(/assets/images/logos/agrootolss_logo_sol.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }} />
                    <Typography component="h4" variant='h4' ml={1} >FieldPartner</Typography>
                </Box>

                <Typography component="h1" variant="h5">
                    Nueva Cuenta
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="given-name"
                                name="firstName"
                                required
                                fullWidth
                                error={!!(formErrors["firstName"])}
                                helperText={formErrors["firstName"] || ''}
                                id="firstName"
                                value={firstName}
                                onChange={handleInputChange}
                                label="Nombre"
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                error={!!(formErrors["lastName"])}
                                helperText={formErrors["lastName"] || ''}
                                value={lastName}
                                onChange={handleInputChange}
                                label="Apellido"
                                name="lastName"
                                autoComplete="family-name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                error={!!(formErrors["email"])}
                                helperText={formErrors["email"] || ''}
                                type='email'
                                value={email}
                                onChange={handleInputChange}
                                autoComplete="email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                error={!!(formErrors["password"])}
                                helperText={formErrors["password"] || ''}
                                label="Contraseña"
                                value={password}
                                onChange={handleInputChange}
                                type="password"
                                id="password"
                                autoComplete="new-password"
                            />
                        </Grid>
                        <Grid item xs={12} >
                            {/* <Alert severity="warning">
                                <AlertTitle>La contraseña debe tener al menos:</AlertTitle>
                                <strong>-Una minúscula.</strong><br />
                                <strong>-Una mayúscula.</strong><br />
                                <strong>-Un carácter especial.</strong><br />
                                <strong>-Un número.</strong>
                            </Alert> */}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="confirmPassword"
                                error={!!(formErrors["confirmPassword"])}
                                helperText={formErrors["confirmPassword"] || ''}
                                label="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={handleInputChange}
                                type="password"
                                id="password"
                                autoComplete="new-password"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox value="allowExtraEmails" color="primary" />}
                                label="I want to receive inspiration, marketing promotions and updates via email."
                            />
                        </Grid>
                    </Grid>
                    {
                        errorMessage && (
                            <Alert severity="error" sx={{ my: 1 }} >{errorMessage}</Alert>
                        )
                    }
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Registrarse
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link component={NavLink} to="/init/auth/login" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            {/* <Copyright sx={{ mt: 5 }}>FieldParnert</Copyright> */}
        </Container >
    );
}