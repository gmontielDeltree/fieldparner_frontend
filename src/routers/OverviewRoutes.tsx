import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { EquipoPage } from '../pages';


export const OverviewRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path='/' element={<EquipoPage />} />

            <Route path='/*' element={<Navigate to="/overview" />} />
        </Routes>
    )
}
