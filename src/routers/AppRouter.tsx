import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { InitRouter } from './InitRouter';


export const AppRouter: React.FC = () => {

    // Todas las rutas de la app
    const router = createBrowserRouter([
        { path: '/init/*', element: <InitRouter /> },
        { path: "*", element:<Navigate to="/init/*" replace />}
    ],);

    console.count("AppRouter Render")
    return <RouterProvider router={router} />

}

/*
{ path: "/auth/*", element: <PublicRoutes /> }, //Rutas publicas
{ path: "/overview/*", element: <OverviewRoutes /> } //Rutas privadasb
*/