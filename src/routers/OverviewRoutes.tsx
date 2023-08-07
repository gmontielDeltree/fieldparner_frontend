import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
    ListaVehiculoPage,
    VehiculoPage
} from '../pages';
import { AppLayout } from '../components';


export const OverviewRoutes: React.FC = () => {
    return (
        <AppLayout key="app-layout">
            <Routes>
                <Route path='/overview/vehiculo' element={<ListaVehiculoPage />} />
                <Route path='/overview/vehiculo/nuevo' element={<VehiculoPage />} />
                <Route path='/overview/vehiculo/:vehiculo' element={<VehiculoPage />} />

                <Route path='/*' element={<Navigate to="/init/overview/vehiculo" />} />
            </Routes>
        </AppLayout>
    )
}
