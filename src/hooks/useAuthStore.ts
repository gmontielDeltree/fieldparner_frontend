import { useDispatch } from 'react-redux';
import { fieldpartnerAPI } from '../config';
import { clearErrorMessage, finishLoading, onChecking, onLogin, onLogout, startLoading } from '../redux/auth';
import { useAppSelector } from './useRedux';
import { ErrorResponseAuth, ResponseAuthLogin, ResponseAuthRenew, UserLogin, UserRegister } from '@types';
import { AxiosError, HttpStatusCode } from 'axios';
import { useNavigate } from 'react-router-dom';

const controller = '/auth';

export const useAuthStore = () => {

    const {
        status,
        user,
        errorMessage,
        isLoading } = useAppSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const startLogin = async ({ email, password }: UserLogin) => {
        // dispatch(onChecking());
        dispatch(startLoading());
        try {
            const response = await fieldpartnerAPI.post<ResponseAuthLogin>(`${controller}/login`, {
                email, password
            });
            if (response.data) {
                const { accessToken, refreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('token_init_date', new Date().getTime().toString());
                dispatch(onLogin({ email, id: new Date().getTime().toString() }));
            }
            dispatch(finishLoading());
            dispatch(clearErrorMessage());

        } catch (error: AxiosError<ErrorResponseAuth> | any) {
            if (error.response && error.response.data) {
                const responseError: ErrorResponseAuth = error.response.data;
                const code = responseError.code;
                const message = responseError.message;

                dispatch(onLogout(message));
                if (code === "UserNotConfirmedException") {
                    localStorage.setItem('username_temp', email);
                    navigate("/init/auth/confirm");
                }
            }
            dispatch(finishLoading());
            // dispatch(onLogout('Incorrect username or password.'));
            // dispatch(clearErrorMessage());
        }
    }

    const startRegister = async ({ email, password, name }: UserRegister) => {
        // dispatch(onChecking());
        dispatch(startLoading());
        try {
            const response = await fieldpartnerAPI.post(`${controller}/register`, {
                email, password, name
            });
            if (response.status === HttpStatusCode.Created) {
                //Seteamos el email del usuario
                localStorage.setItem('username_temp', email);
                //Luego redireccionamos a pagina de confirmar email
                dispatch(onLogout('Confirm account.'));
                navigate('/init/auth/confirm');
                return dispatch(finishLoading());
            }

        } catch (error: AxiosError<ErrorResponseAuth> | any) {
            if (error.response && error.response.data) {
                const responseError: ErrorResponseAuth = error.response.data;
                const code = responseError.code;
                const message = responseError.message;

                if (code === "UsernameExistsException")
                    dispatch(onLogout(message));
                else
                    dispatch(onLogout(error.response.data.message[1]));
            }
            dispatch(finishLoading());
        }
    }

    const startConfirm = async (confirmationCode: string) => {
        dispatch(startLoading());
        try {
            const email = localStorage.getItem('username_temp');
            if (!email) return dispatch(onLogout(""));

            const response = await fieldpartnerAPI.post(`${controller}/confirm`, {
                email, confirmationCode
            });

            if (response.status === HttpStatusCode.Created) {
                localStorage.removeItem('username_temp');
                dispatch(onLogout(""));
                navigate('/init/auth/login');
                return dispatch(finishLoading());
            }

        } catch (error) {
            dispatch(onLogout('Por favor volve a intentar en unos minutos.'));
            dispatch(clearErrorMessage());
            localStorage.removeItem('username_temp');
            dispatch(finishLoading());
        }
    }

    const checkAuthToken = async () => {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!token || !refreshToken) return dispatch(onLogout(""));
        dispatch(onChecking())
        try {
            // const { data } = await authApi.get('auth/renew');
            const response = await fieldpartnerAPI.post<ResponseAuthRenew>(`${controller}/renew`, { refreshToken });

            if (response.status === HttpStatusCode.Ok) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('token-init-date', new Date().getTime().toString());
            }
            //TODO: obtener el usuario.
            dispatch(onLogin({ email: 'german_montiel@sadasd', id: new Date().getTime().toString() }));
        } catch (error) {
            localStorage.clear();
            dispatch(onLogout(""));
        }
    }

    const startLogout = () => {
        localStorage.clear();
        dispatch(onLogout(""));
    }


    return {
        //* Propiedades
        errorMessage,
        status,
        user,
        isLoading,

        //* Métodos
        checkAuthToken,
        startLogin,
        startLogout,
        startRegister,
        startConfirm
    }

}