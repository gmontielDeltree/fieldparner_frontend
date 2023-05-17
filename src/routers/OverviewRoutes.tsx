import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { OverviewPage } from '../pages';


export const OverviewRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path='/' element={<OverviewPage />} />

            <Route path='/*' element={<Navigate to="/overview" />} />
        </Routes>
    )
}
