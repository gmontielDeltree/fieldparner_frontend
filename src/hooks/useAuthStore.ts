import { useDispatch } from 'react-redux';
import { authApi } from '../config';
import { clearErrorMessage, onChecking, onLogin, onLogout } from '../redux/auth';
import { useAppSelector } from './useRedux';
import { UserLogin } from '@types';


export interface ResponseAuthLogin {
    accessToken: string;
    refreshToken: string;
}


export const useAuthStore = () => {

    const { status, user, errorMessage } = useAppSelector(state => state.auth);
    const dispatch = useDispatch();

    const startLogin = async ({ email, password }: UserLogin) => {
        dispatch(onChecking());
        try {
            const response = await authApi.post<ResponseAuthLogin>('/login', {
                email, password
            });
            if (response.data) {
                const { accessToken, refreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken)
                localStorage.setItem('refreshToken', refreshToken);
                dispatch(onLogin({ email, id: new Date().getTime().toString() }));
            }

        } catch (error) {
            dispatch(onLogout('Incorrect username or password.'));
            dispatch(clearErrorMessage());
        }
    }

    // const startRegister = async ({ email, password, name }) => {
    //     dispatch(onChecking());
    //     try {
    //         const response = await authApi.post<ResponseAuthLogin>('/login', {
    //             email, password, name
    //         });
    //         localStorage.setItem('token', data.token);
    //         localStorage.setItem('token-init-date', new Date().getTime());
    //         dispatch(onLogin({ name: data.name, uid: data.uid }));

    //     } catch (error) {
    //         dispatch(onLogout(error.response.data?.msg || '--'));
    //         setTimeout(() => {
    //             dispatch(clearErrorMessage());
    //         }, 10);
    //     }
    // }


    const checkAuthToken = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return dispatch(onLogout(""));

        try {
            // const { data } = await authApi.get('auth/renew');
            localStorage.setItem('accessToken', new Date().getDate().toString());
            localStorage.setItem('token-init-date', new Date().getTime().toString());
            dispatch(onLogin({ email: 'german_montiel@sadasd', id: new Date().getTime().toString() }));
        } catch (error) {
            localStorage.clear();
            dispatch(onLogout(""));
        }
    }

    // const startLogout = () => {
    //     localStorage.clear();
    //     dispatch(onLogout());
    // }



    return {
        //* Propiedades
        errorMessage,
        status,
        user,

        //* Métodos
        checkAuthToken,
        startLogin,
        // startLogout,
        // startRegister,
    }

}