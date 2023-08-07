import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
    ConfirmAuthPage,
    LoginPage,
    // RegisterPage
} from '../pages';
import { Grid, Paper } from '@mui/material';

export const PublicRoutes: React.FC = () => {
    return (

        <Grid container component="main" sx={{ height: '100vh' }}>
            {/* <CssBaseline /> */}
            <Grid item xs={12} sm={8} md={4} component={Paper} elevation={6} square>
                <Routes>
                    <Route path='/auth/login' element={<LoginPage />} />
                    {/* <Route path='/auth/register' element={<RegisterPage />} /> */}
                    <Route path='/auth/confirm' element={<ConfirmAuthPage />} />

                    <Route path="/*" element={<Navigate to="/init/auth/login" />} />
                </Routes>
            </Grid>
            <Grid
                item
                xs={false}
                sm={4}
                md={8}
                sx={{
                    backgroundImage: 'url(/assets/images/load-bg.jpg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
        </Grid>
    )
}