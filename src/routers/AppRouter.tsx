import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { old_routes } from "../old_routes";
import { InitRouter } from './InitRouter';


export const AppRouter: React.FC = () => {

    // Todas las rutas de la app
    const router = createBrowserRouter([
        ...old_routes, // old_routes es la parte "vieja" de la app
        { path: '/init/*', element: <InitRouter /> }
    ],);

    return <RouterProvider router={router} />

}

/*
{ path: "/auth/*", element: <PublicRoutes /> }, //Rutas publicas
{ path: "/overview/*", element: <OverviewRoutes /> } //Rutas privadasb
*/