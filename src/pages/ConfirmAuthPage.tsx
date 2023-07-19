import { Alert, Box, Button, ButtonGroup, Container, Paper, TextField, Typography } from '@mui/material'
import React from 'react';
import { useAuthStore, useForm } from '../hooks'
import { Navigate } from 'react-router-dom';
import { Loading } from '../components';

export const ConfirmAuthPage: React.FC = () => {

    const {
        cod1, cod2, cod3, cod4, cod5, cod6, handleInputChange
    } = useForm({
        cod1: '',
        cod2: '',
        cod3: '',
        cod4: '',
        cod5: '',
        cod6: '',
    });
    const { isLoading, errorMessage, startConfirm } = useAuthStore();
    const email = localStorage.getItem("username_temp");

    const handleOnClickConfirm = () => {
        let confirmationCode = '' + cod1 + cod2 + cod3 + cod4 + cod5 + cod6;
        if (confirmationCode !== '')
            startConfirm(confirmationCode);
    }

    if (!email) {
        return <Navigate to="/init/auth/login" />
    }

    return (
        <Container maxWidth="sm" component={Paper}
            sx={{
                width: '100%',
                paddingLeft: 0,
                paddingRight: 0,
                // backgroundColor: '#f2f2f2'
            }}>
            {
                isLoading && <Loading key="loading-auth" loading={true} />
            }
            <Box
                sx={{
                    marginTop: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                <Box display="flex" sx={{ margin: 'auto', mb: 3, p: 3 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        backgroundImage: 'url(/assets/images/logos/agrootolss_logo_sol.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }} />
                    <Typography component="h5" variant='h5' ml={1} >FieldPartner</Typography>
                </Box>

                <Typography component="h4" variant="h4" textAlign="center" mb={2} >
                    Revisa tu correo
                </Typography>
                <Typography
                    component="h6"
                    variant="body1"
                    textAlign="center"
                    color={'GrayText'}
                    mb={3}
                >
                    Por favor, hemos enviado un código de verificación al correo electrónico,
                </Typography>
                <ButtonGroup variant="outlined" aria-label="outlined button group">
                    <TextField
                        sx={{ maxWidth: "40px" }}
                        color="primary"
                        type="text"
                        inputProps={{ maxLength: 1 }}
                        name="cod1"
                        value={cod1}
                        onChange={handleInputChange}
                        autoComplete='off'
                        autoFocus
                    />
                    <TextField
                        sx={{ maxWidth: "40px", mx: 1 }}
                        color="primary"
                        type="text"
                        inputProps={{ maxLength: 1 }}
                        name="cod2"
                        value={cod2}
                        onChange={handleInputChange}
                        autoComplete='off'
                        autoFocus
                    />
                    <TextField
                        sx={{ maxWidth: "40px" }}
                        color="primary"
                        type="text"
                        inputProps={{ maxLength: 1 }}
                        name="cod3"
                        value={cod3}
                        onChange={handleInputChange}
                        autoComplete='off'
                        autoFocus
                    />
                    <TextField
                        sx={{ maxWidth: "40px", mx: 1 }}
                        color="primary"
                        type="text"
                        inputProps={{ maxLength: 1 }}
                        name="cod4"
                        value={cod4}
                        onChange={handleInputChange}
                        autoComplete='off'
                        autoFocus
                    />
                    <TextField
                        sx={{ maxWidth: "40px" }}
                        color="primary"
                        type="text"
                        inputProps={{ maxLength: 1 }}
                        name="cod5"
                        value={cod5}
                        onChange={handleInputChange}
                        autoComplete='off'
                        autoFocus
                    />
                    <TextField
                        sx={{ maxWidth: "40px", mx: 1 }}
                        color="primary"
                        type="text"
                        inputProps={{ maxLength: 1 }}
                        name="cod6"
                        value={cod6}
                        onChange={handleInputChange}
                        autoComplete='off'
                        autoFocus
                    />
                </ButtonGroup>
                {
                    errorMessage && (
                        <Alert severity="error" sx={{ my: 2 }} >{errorMessage}</Alert>
                    )
                }
                <Button
                    type="button"
                    color='primary'
                    fullWidth
                    variant="contained"
                    onClick={() => handleOnClickConfirm()}
                    sx={{ mt: 3, mb: 2 }}
                >
                    CONFIRMAR
                </Button>
            </Box>
        </Container>
    )
}
