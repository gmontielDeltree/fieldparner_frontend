import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { ErrorResponseAuth, UserByAccount } from "../types";
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { fieldpartnerAPI } from '../config';
import { loadUsers, setUserActive } from '../redux/users';
import { NotificationService } from "../services/notificationService";

const controller = "/user-licence";

export const useUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserByAccount[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);


  const createUser = async (userDto: UserByAccount) => {
    setIsLoading(true);
    try {

      if (!user) throw new Error(t("user_not_found"));

      const newUser: UserByAccount = { ...userDto, accountId: user.accountId };
      const response = await fieldpartnerAPI.post(`${controller}`, newUser);

      if (response)
        NotificationService.showSuccess(t("user_registered_pending_email"), {}, t("user_label"));
      else
        NotificationService.showError(t("unexpected_error"), {}, t("error_label"));

      navigate('/init/overview/users');

    } catch (error: any) {
      console.log(t("registration_error"), error);
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        console.log(t("response_error"), responseError);
        if (responseError.code === "UsernameExistsException") {
          console.log(t("email_already_registered"));
          NotificationService.showError(t("email_already_registered"), {}, t("error_label"));
        } else if (responseError.message) {
          console.log(t("registration_error"), responseError.message);
          NotificationService.showError(responseError.message, {}, t("error_label"));
        } else {
          console.log(t("unknown_registration_error"));
          NotificationService.showError(t("registration_error_occurred"), {}, t("error_label"));
        }
      } else {
        console.log(t("unknown_registration_error"));
        NotificationService.showError(t("registration_error_occurred"), {}, t("error_label"));
      }
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getUsers = async () => {
    setIsLoading(true);
    try {
      //Obtener usuarios por id cuenta
      const response = await fieldpartnerAPI.get(`${controller}`);

      if (response) {
        const documents: UserByAccount[] = response.data.map((row: any) => row as UserByAccount);
        setUsers(documents);
        dispatch(loadUsers(documents));
      }
      else
        setUsers([]);

      setIsLoading(false);
    } catch (error) {
      console.log(error)
      NotificationService.showError(t("users_not_found"), {}, t("error_label"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  const updateUser = async (upUser: UserByAccount) => {
    setIsLoading(true);

    try {
      const userId = upUser._id;
      const bodyUser = {
        // name: upUser.name,
        // lastName: upUser.lastName,
        previousPassword: upUser.previousPassword,
        newPassword: upUser.newPassword,
        isAdmin: upUser.isAdmin,
        photoName: upUser.photoName,
        rol: upUser.rol,
        language: upUser.language,
        state: upUser.state
      }
      const response = await fieldpartnerAPI.patch(`${controller}/${userId}`, bodyUser);
      setIsLoading(false);

      if (response)
        NotificationService.showUpdated({ user: upUser.email }, t("user_label"));

    } catch (error) {
      console.log(error);
      NotificationService.showError(t("user_update_error"), {}, t("error_label"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updatePasswordUsers = async (updateUsers: UserByAccount, oldPassword: string) => {
    setIsLoading(true);

    console.log(t("update_password_executing"));

    if (!updateUsers.password?.trim()) {
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Obtener el usuario actual de la base de datos
      const currentUser = await dbContext.users.get(updateUsers.password);
      if (!currentUser) {
        setIsLoading(false);
        NotificationService.showError(t("user_not_found"), {}, t("error_label"));
        return;
      }

      // Comprobar si la contraseña anterior coincide
      if (currentUser.password !== oldPassword) {
        setIsLoading(false);
        NotificationService.showError(t("previous_password_mismatch"), {}, t("error_label"));
        return;
      }

      // Actualizar la contraseña
      const response = await dbContext.users.put(updateUsers);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showSuccess(t("password_updated"), {}, t("success_label"));

      navigate('/init/overview/users/');
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("password_update_error"), {}, t("error_label"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeUsers = async (UsersId: string, removeUsers: string) => {

    try {
      const response = await dbContext.users.remove(UsersId, removeUsers);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showDeleted({ id: UsersId }, t("origin_destination_label"));

      navigate('/init/overview/users/');
    } catch (error) {
      console.log(error)
      NotificationService.showError(t("no_destinations_procedences_found"), {}, t("error_label"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  const searchUsers = async (searchTerm: string) => {
    setIsLoading(true);

    try {
      const response = await dbContext.users.query('users-search-view', {
        startkey: searchTerm,
        endkey: searchTerm + '\uffff',
        include_docs: true,
      });

      setIsLoading(false);

      if (response.rows.length) {
        const searchResults: UserByAccount[] = response.rows.map(row => row.doc as UserByAccount);
        setUsers(searchResults);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      NotificationService.showError(t("error_during_search"), {}, t("error_label"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getUserById = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fieldpartnerAPI.get(`${controller}/${userId}`);

      if (response) {
        // const foundUser: UserByAccount = {
        //   email: response.data.email,
        //   isAdmin: response.data.isAdmin,
        //   name: response.data.name,
        //   lastName: response.data.lastName,
        //   language: response.data.language,
        //   photoName: response.data.photoName,
        //   state: response.data.state,
        //   rol: response.data.rol
        // };
        const foundUser = response.data as UserByAccount;
        dispatch(setUserActive(foundUser));
      }

      setIsLoading(false)
    } catch (error) {
      console.log('error', error)
      setIsLoading(false)
    }
  }


  return {
    //* Propiedades
    error,
    isLoading,
    users,
    conceptoError,

    //* Métodos
    createUser,
    getUsers,
    setUsers,
    updateUser,
    removeUsers,
    updatePasswordUsers,
    searchUsers,
    getUserById
  }
}