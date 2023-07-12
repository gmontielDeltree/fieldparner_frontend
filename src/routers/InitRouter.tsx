import { useEffect } from 'react'
import { useAuthStore } from '../hooks';
import { PublicRoutes } from './PublicRoutes';
import { OverviewRoutes } from './OverviewRoutes';

export const InitRouter = () => {

    const { status, checkAuthToken } = useAuthStore();
    // const authStatus = 'not-authenticated'; // 'authenticated'; // 'not-authenticated';

    useEffect(() => {
        checkAuthToken();
    }, [])


    if (status === 'checking') {
        return (
            <h3>Cargando...</h3>
        )
    }

    return (
        <>
            {
                (status === 'not-authenticated')
                    ? (<PublicRoutes />)
                    : (<OverviewRoutes />)
            }
        </>
    )
}
