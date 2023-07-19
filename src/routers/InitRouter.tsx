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


    // if (status === 'checking') {
    //     return (
    //         <Loading key="loading-auth" loading={true} />
    //     )
    // }

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
