import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages';

export const PublicRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path='/auth/login' element={<LoginPage />} />
            <Route path="/*" element={<Navigate to="/init/auth/login" />} />
        </Routes>
    )
}
