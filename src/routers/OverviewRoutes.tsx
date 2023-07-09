import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
    ListaVehiculoPage,
    VehiculoPage
} from '../pages';
import { AppLayout } from '../components';


export const OverviewRoutes: React.FC = () => {
    return (
        <AppLayout key="app-layout-main">
            <Routes>
                <Route path='/vehiculo' element={<ListaVehiculoPage />} />
                <Route path='/vehiculo/nuevo' element={<VehiculoPage />} />
                <Route path='/vehiculo/:vehiculo' element={<VehiculoPage />} />
                {/* <Route path='/' /> */}

                <Route path='/*' element={<Navigate to="/overview" />} />
            </Routes>
        </AppLayout>
    )
}
