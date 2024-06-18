import { useDispatch } from "react-redux";
import { fieldpartnerAPI } from "../config";
import {
  clearErrorMessage,
  finishLoading,
  onChecking,
  onLogin,
  onLogout,
  startLoading
} from "../redux/auth";
import { useAppSelector } from "./useRedux";
import {
  ErrorResponseAuth,
  ResponseAuthLogin,
  ResponseAuthRenew,
  User,
  UserLogin,
  UserRegister
} from "../types";
import { AxiosError, HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";
import { convertTimestampToDate } from "../helpers/dates";

const controller = "/auth";

export const useAuthStore = () => {
  const { status, user, errorMessage, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const startLogin = async ({ email, password }: UserLogin) => {
    dispatch(startLoading());
    try {
      // Code for testing
      // const response = {
      //   data: {
      //     auth: {
      //       accessToken: "hardcodedAccessToken",
      //       refreshToken: "hardcodedRefreshToken",
      //       expiration: new Date().getTime() + 3600 * 1000,
      //     },
      //     user: {
      //       id: "123",
      //       firstName: "John",
      //       lastName: "Doe",
      //       accountId: "9edd9e74ced2e6643c8cdbbead0219cc",
      //       isAdmin: true,
      //       countryId: "US",
      //     },
      //   },
      // };

      // const { auth, user } = response.data;
      // const { accessToken, refreshToken, expiration } = auth;
      // localStorage.setItem("accessToken", accessToken);
      // localStorage.setItem("refreshToken", refreshToken);
      // localStorage.setItem(
      //   "token_expiration",
      //   convertTimestampToDate(expiration).getTime().toString()
      // );
      // localStorage.setItem("user_session", JSON.stringify(user));
      // dispatch(onLogin(user));
      // dispatch(finishLoading());
      // dispatch(clearErrorMessage());

      // Original code
      
      const response = await fieldpartnerAPI.post<ResponseAuthLogin>(
        `${controller}/login`,
        {
          email,
          password
        }
      );
      if (response.data) {
        const { auth, user } = response.data;
        const { accessToken, refreshToken, expiration } = auth;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem(
          "token_expiration",
          convertTimestampToDate(expiration).getTime().toString()
        );
        localStorage.setItem("user_session", JSON.stringify(user));
        dispatch(onLogin(user));
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
          localStorage.setItem("username_temp", email);
          navigate("/init/auth/confirm");
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
        name
      });
      if (response.status === HttpStatusCode.Created) {
        localStorage.setItem("username_temp", email);
        dispatch(onLogout("Confirm account."));
        navigate("/init/auth/confirm");
        return dispatch(finishLoading());
      }
    } catch (error: AxiosError<ErrorResponseAuth> | any) {
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        const code = responseError.code;
        const message = responseError.message;

        if (code === "UsernameExistsException") dispatch(onLogout(message));
        else dispatch(onLogout(error.response.data.message[1]));
      }
      dispatch(finishLoading());
    }
  };

  const startConfirm = async (confirmationCode: string) => {
    dispatch(startLoading());
    try {
      const email = localStorage.getItem("username_temp");
      if (!email) return dispatch(onLogout(""));

      const response = await fieldpartnerAPI.post(`${controller}/confirm`, {
        email,
        confirmationCode
      });

      if (response.status === HttpStatusCode.Created) {
        localStorage.removeItem("username_temp");
        dispatch(onLogout(""));
        navigate("/init/auth/login");
        return dispatch(finishLoading());
      }
    } catch (error) {
      dispatch(onLogout("Por favor volve a intentar en unos minutos."));
      dispatch(clearErrorMessage());
      localStorage.removeItem("username_temp");
      dispatch(finishLoading());
    }
  };

  // const checkAuthToken = async () => {
  //   const token = localStorage.getItem("accessToken");
  //   const refreshToken = localStorage.getItem("refreshToken");
  //   const userSession = localStorage.getItem("user_session");

  //   if (!token || !refreshToken || !userSession) return dispatch(onLogout(""));

  //   dispatch(onChecking());
  //   try {
  //     const expiration = localStorage.getItem("token_expiration");

  //     if (new Date().getTime() > Number(expiration)) {
  //       dispatch(onLogout(""));
  //       return;
  //     }

  //     const lastPath = localStorage.getItem("lastPath") || "/";
  //     navigate(lastPath, { replace: true });
  //     const userLogin = JSON.parse(userSession || "") as User;
  //     dispatch(onLogin(userLogin));

  //     const response = await fieldpartnerAPI.post<ResponseAuthRenew>(
  //       `${controller}/renew`,
  //       { refreshToken }
  //     );

  //     if (response.status === HttpStatusCode.Created) {
  //       const expiresIn = new Date().getTime() + response.data.ExpiresIn * 1000;
  //       localStorage.setItem("accessToken", response.data.AccessToken);
  //       localStorage.setItem("token_expiration", expiresIn.toString());
  //     }
  //   } catch (error) {
  //     localStorage.clear();
  //     dispatch(onLogout(""));
  //   }
  // };

  const startLogout = () => {
    dispatch(startLoading());
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token_expiration");
      localStorage.removeItem("user_session");
      localStorage.removeItem("lastPath");

      dispatch(onLogout("User logged out successfully."));

      navigate("/init/auth/login");
    } catch (error) {
      console.error("Error during logout: ", error);
      dispatch(onLogout("Error during logout."));
    } finally {
      dispatch(finishLoading());
    }
  };




  const checkAuthToken = async () => {

    dispatch(onChecking())
    try {
      localStorage.setItem('accessToken', "");
      localStorage.setItem('token_expiration', "");

      const lastPath = localStorage.getItem("lastPath") || "/";

      dispatch(onLogin({
        isAdmin: true, firstName: 'Rodrigo', accountId: "test", id: "asd123", lastName: "pepe",
        countryId: "Argentina"
      }));
      navigate(lastPath, { replace: true });

    } catch (error) {
      localStorage.clear();
      dispatch(onLogout(""));
    }
  }

  return {
    errorMessage,
    status,
    user,
    isLoading,
    checkAuthToken,
    startLogin,
    startRegister,
    startConfirm,
    startLogout
  };
};
