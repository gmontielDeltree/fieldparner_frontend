import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
    VehiculosPage,
    NuevoVehiculoPage
} from '../pages';
import { AppLayout } from '../components';


export const OverviewRoutes: React.FC = () => {
    return (
        <AppLayout key="app-layout-main">
            <Routes>
                <Route path='/vehiculo' element={<VehiculosPage />} />
                <Route path='/vehiculo/nuevo' element={<NuevoVehiculoPage />} />

                <Route path='/*' element={<Navigate to="/overview" />} />
            </Routes>
        </AppLayout>
    )
}
