import { useDispatch } from 'react-redux';
import { fieldpartnerAPI } from '../config';
import {
  clearErrorMessage,
  finishLoading,
  onChecking,
  onLogin,
  onLogout,
  startLoading,
} from '../redux/auth';
import { useAppSelector } from './useRedux';
import {
  ErrorResponseAuth,
  ResponseAuthLogin,
  ResponseAuthRenew,
  User,
  UserLogin,
  UserRegister,
} from '../types';
import { AxiosError, HttpStatusCode } from 'axios';
import { useNavigate } from 'react-router-dom';
import { convertTimestampToDate } from '../helpers/dates';
import { useTranslation } from 'react-i18next';
import { useUser } from './useUsers';

const controller = '/auth';

export const useAuthStore = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, user, errorMessage, isLoading } = useAppSelector(state => state.auth);
  const { getModulesByUserId } = useUser();

  const startLogin = async ({ email, password }: UserLogin) => {
    dispatch(startLoading());
    try {
      // Código de testing comentado...

      // Código original
      const response = await fieldpartnerAPI.post<ResponseAuthLogin>(`${controller}/login`, {
        email,
        password,
      });
      if (response.data) {
        const { auth, user, modules } = response.data;
        const { accessToken, refreshToken, expiration } = auth;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(
          'token_expiration',
          convertTimestampToDate(expiration).getTime().toString(),
        );
        localStorage.setItem('user_session', JSON.stringify(user));
        dispatch(onLogin({ user, modules }));
      }
      dispatch(finishLoading());
      dispatch(clearErrorMessage());
    } catch (error: AxiosError<ErrorResponseAuth> | any) {
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        const code = responseError.code;
        const message = responseError.message;

        dispatch(onLogout(message));
        if (code === 'UserNotConfirmedException') {
          localStorage.setItem('username_temp', email);
          navigate('/init/auth/confirm');
        }
      }
      dispatch(finishLoading());
    }
  };

  const startRegister = async ({ email, password, name }: UserRegister) => {
    dispatch(startLoading());
    try {
      const response = await fieldpartnerAPI.post(`${controller}/register`, {
        email,
        password,
        name,
      });
      if (response.status === HttpStatusCode.Created) {
        localStorage.setItem('username_temp', email);
        dispatch(onLogout(t('confirm_account')));
        navigate('/init/auth/confirm');
        return dispatch(finishLoading());
      }
    } catch (error: AxiosError<ErrorResponseAuth> | any) {
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        const code = responseError.code;
        const message = responseError.message;

        if (code === 'UsernameExistsException') dispatch(onLogout(message));
        else dispatch(onLogout(error.response.data.message[1]));
      }
      dispatch(finishLoading());
    }
  };

  const startConfirm = async (confirmationCode: string) => {
    dispatch(startLoading());
    try {
      const email = localStorage.getItem('username_temp');
      if (!email) return dispatch(onLogout(''));

      const response = await fieldpartnerAPI.post(`${controller}/confirm`, {
        email,
        confirmationCode,
      });

      if (response.status === HttpStatusCode.Created) {
        localStorage.removeItem('username_temp');
        dispatch(onLogout(''));
        navigate('/init/auth/login');
        dispatch(finishLoading());
        return;
      }
    } catch (error) {
      dispatch(onLogout(t('try_again_later')));
      dispatch(clearErrorMessage());
      localStorage.removeItem('username_temp');
      dispatch(finishLoading());
    }
  };

  const checkAuthToken = async () => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userSession = localStorage.getItem('user_session');

    if (!token || !refreshToken || !userSession) return dispatch(onLogout(''));

    dispatch(onChecking());
    try {
      const expiration = localStorage.getItem('token_expiration');

      if (new Date().getTime() > Number(expiration)) {
        dispatch(onLogout(''));
        return;
      }

      const response = await fieldpartnerAPI.post<ResponseAuthRenew>(`${controller}/renew`, {
        refreshToken,
      });

      if (response.status === HttpStatusCode.Created) {
        const expiresIn = new Date().getTime() + response.data.expiration * 1000;
        //Si no devuelve AccessToken, se utiliza el token actual
        localStorage.setItem('accessToken', response.data.accessToken || token);
        localStorage.setItem('token_expiration', expiresIn.toString());
        const userLogin = JSON.parse(userSession || '') as User;
        const modules = await getModulesByUserId(userLogin.id);
        console.log('modules checkAuth', modules)
        dispatch(onLogin({ user: userLogin, modules }));
        const lastPath = localStorage.getItem('lastPath') || '/';
        navigate(lastPath, { replace: true });
      }
    } catch (error) {
      localStorage.clear();
      dispatch(onLogout(''));
    }
  };

  //  const checkAuthToken = async () => {
  //  dispatch(onChecking());
  // try {
  //   localStorage.setItem('accessToken', '');
  //  localStorage.setItem('token_expiration', '');

  //    const lastPath = localStorage.getItem('lastPath') || '/';

  //   dispatch(
  //     onLogin({
  //       user: {
  //         id: '12354',
  //         username: 'Rodrigo',
  //         accountId: 'test',
  //         licenceId: '1234',
  //         isAdmin: true, // o false según corresponda
  //         rol: "ADM",
  //         countryId: 'AR',
  //         photoName: '', // agregar si es necesario
  //         language: '', // agregar si es necesario
  //         currency: '',
  //         email: 'rgarro@deltree.com.ar',
  //       },
  //       modules: [], // agregar los módulos correspondientes o un array vacío
  //     }),
  //   );
  //  navigate(lastPath, { replace: true });
  // } catch (error) {
  // localStorage.clear();
  // dispatch(onLogout(''));
  // }
  // };

  const startLogout = () => {
    dispatch(startLoading());
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token_expiration');
      localStorage.removeItem('user_session');
      localStorage.removeItem('lastPath');

      dispatch(onLogout(t('user_logout_success')));
      navigate('/init/auth/login');
    } catch (error) {
      console.error('Error during logout: ', error);
      dispatch(onLogout(t('user_logout_error')));
    } finally {
      dispatch(finishLoading());
    }
  };

  const startForgotPassword = async (email: string, onSuccess?: () => void) => {
    dispatch(startLoading());
    try {
      const response = await fieldpartnerAPI.post(`${controller}/forgot-password`, {
        email,
      });

      if (response.status === HttpStatusCode.Created || response.status === HttpStatusCode.Ok) {
        dispatch(finishLoading());
        dispatch(clearErrorMessage());
        if (onSuccess) onSuccess();
      }
    } catch (error: AxiosError<ErrorResponseAuth> | any) {
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        const message = responseError.message;
        dispatch(onLogout(message));
      } else {
        dispatch(onLogout(t('try_again_later')));
      }
      dispatch(finishLoading());
    }
  };

  const startConfirmForgotPassword = async (
    email: string,
    confirmationCode: string,
    newPassword: string,
    onResult?: (success: boolean) => void,
  ) => {
    dispatch(startLoading());
    try {
      const response = await fieldpartnerAPI.post(`${controller}/confirm-forgot-password`, {
        email,
        confirmationCode,
        newPassword,
      });

      if (response.status === HttpStatusCode.Created || response.status === HttpStatusCode.Ok) {
        dispatch(clearErrorMessage());
        dispatch(finishLoading());
        if (onResult) onResult(true);
        return;
      }
    } catch (error: AxiosError<ErrorResponseAuth> | any) {
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        const message = responseError.message;
        dispatch(onLogout(message));
      } else {
        dispatch(onLogout(t('try_again_later')));
      }
      dispatch(finishLoading());
      if (onResult) onResult(false);
    }
  };

  const resendVerificationCode = async (email: string, onSuccess?: () => void) => {
    dispatch(startLoading());
    try {
      const response = await fieldpartnerAPI.post(`${controller}/resend-verification-code`, {
        email,
      });

      if (response.status === HttpStatusCode.Created || response.status === HttpStatusCode.Ok) {
        dispatch(clearErrorMessage());
        if (onSuccess) onSuccess();
      }
    } catch (error: AxiosError<ErrorResponseAuth> | any) {
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        const message = responseError.message;
        dispatch(onLogout(message));
      } else {
        dispatch(onLogout(t('try_again_later')));
      }
    }
    finally {
      dispatch(finishLoading());
    }
  };

  return {
    errorMessage,
    status,
    user,
    isLoading,
    checkAuthToken,
    startLogin,
    startRegister,
    startConfirm,
    startLogout,
    startForgotPassword,
    startConfirmForgotPassword,
    resendVerificationCode
  };
};
