import { fieldpartnerAPI } from "../../config";
import { AppDispatch } from "../store"
import { uiFinishLoading, uiStartLoading } from "../ui"


export interface ResponseAuthLogin {
    accessToken: string;
    refreshToken: string;
}

const controller = '/auth';
export const startLogin = (email: string, password: string) => {

    return async (dispatch: AppDispatch) => {
        dispatch(uiStartLoading());
        try {
            const response = await fieldpartnerAPI.post<ResponseAuthLogin>(`${controller}/login`, {
                email, password
            });
            if (response.data) {
                const { accessToken, refreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken)
                localStorage.setItem('refreshToken', refreshToken);
            }

            dispatch(uiFinishLoading());
        } catch (error) {
            dispatch(uiFinishLoading());
            console.log(error);
        }
    }
}