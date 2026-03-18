import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
    ConfirmAuthPage,
    ForgotPasswordPage,
    LoginPage,
    RegisterPage
} from '../pages';
import { Box } from '@mui/material';

export const PublicRoutes: React.FC = () => {
    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                backgroundImage: 'url(/assets/images/load-bg.jpg)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(2px)',
                },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 420,
                    mx: 2,
                    my: 4,
                }}
            >
                <Routes>
                    <Route path='/auth/login' element={<LoginPage />} />
                    <Route path='/auth/register' element={<RegisterPage />} />
                    <Route path='/auth/confirm' element={<ConfirmAuthPage />} />
                    <Route path='/auth/forgot-password' element={<ForgotPasswordPage />} />
                    <Route path="/*" element={<Navigate to="/init/auth/login" />} />
                </Routes>
            </Box>
        </Box>
    )
}
