import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { ErrorResponseAuth, UpdateUserDTO, UserByAccount } from "../types";
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { fieldpartnerAPI } from '../config';
import { loadUsers, setUserActive } from '../redux/users';
import { NotificationService } from "../services/notificationService";
import { onLogout } from '../redux/auth';
import { NewUserDto } from '../interfaces/user-accounts';
import { ModulesUsers } from '../interfaces/menuModules';

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


  const createUser = async (userDto: NewUserDto) => {
    setIsLoading(true);
    try {

      if (!user) throw new Error(t("user_not_found"));
      const dataUser = { ...userDto, modulePermissions: userDto.modulePermissions.map(Number) };
      console.log('dataUser', dataUser);
      debugger;
      const response = await fieldpartnerAPI.post(`${controller}`, dataUser);

      if (response)
        NotificationService.showSuccess(t("user_registered_pending_email"), {}, t("user_label"));
      else
        NotificationService.showError(t("unexpected_error"), {}, t("error_label"));

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
      if (error) setError(error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const getUsers = async () => {
    setIsLoading(true);
    try {
      //Obtener usuarios por id cuenta
      const response = await fieldpartnerAPI.get(`${controller}`, {
        headers: {
          "Authorization": localStorage.getItem("accessToken")
        }
      });

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

  const updateUser = async (updateUser: UpdateUserDTO) => {
    setIsLoading(true);

    if (!user) {
      console.log("user not found");
      dispatch(onLogout(t("sessionExpired"))); return;
    }

    try {
      const userId = user.id;

      const response = await fieldpartnerAPI.patch(`${controller}/${userId}`, updateUser);

      if (response)
        NotificationService.showUpdated({ user: updateUser.username }, t("user_label"));

    } catch (error) {
      console.log(error);
      NotificationService.showError(t("user_update_error"), {}, t("error_label"));
      if (error) setError(error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {

      if (!user) {
        console.log("user not found");
        dispatch(onLogout(t("sessionExpired"))); return;
      }
      const cognitoId = user.id;
      await fieldpartnerAPI.post(`${controller}/change-password`, { id: cognitoId, oldPassword, newPassword });

    } catch (error) {
      console.log(error);
      NotificationService.showError("Error al cambiar la contraseña", {}, t("error_label"));
      if (error) setError(error);
    }
    finally {
      setIsLoading(false);
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
        const foundUser = response.data as UserByAccount;
        dispatch(setUserActive(foundUser));
      }

      setIsLoading(false)
    } catch (error) {
      console.log('error', error)
      setIsLoading(false)
    }
  }

  const disableUser = async (userId: string, username: string) => {
    setIsLoading(true);
    try {
      const response = await fieldpartnerAPI.delete(`${controller}/${userId}`);

      if (response) {
        NotificationService.showSuccess(t("user_disabled_successfully", { user: username }), {}, t("user_label"));
        await getUsers(); // Reload users list
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("user_disable_error"), {}, t("error_label"));
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
 * Obtiene los permisos (IDs de MenuModules) asignados a un usuario específico
 * @param userId - ID del usuario
 * @returns Array de MenuModules donde el usuario tiene permiso
 */
  const getModulesByUserId = async (userId: string): Promise<ModulesUsers[]> => {
    try {
      // Consultar la base de datos local PouchDB para ModulesUsers
      const response = await dbContext.modulesUsers.find({
        selector: { userId: userId }
      });
      
      if (response.docs.length) {
        return response.docs;
      }

      return [];
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      NotificationService.showError(t("error_loading_permissions"), {}, t("error_label"));
      return [];
    }
  };

  /**
   * Actualiza la información básica del usuario (username, rol, language, photoName)
   * @param userId - ID del usuario
   * @param updateData - Datos a actualizar
   */
  const updateUserInfo = async (userId: string, updateData: { username?: string; rol?: string; language?: string; photoName?: string }) => {
    setIsLoading(true);
    try {
      const response = await fieldpartnerAPI.patch(`${controller}/${userId}`, updateData);

      if (response) {
        NotificationService.showSuccess(t("user_updated_successfully", { user: updateData.username }), {}, t("user_label"));
        await getUsers(); // Recargar lista de usuarios
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("user_update_error"), {}, t("error_label"));
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualiza los permisos de módulos del usuario
   * Esta función "pisa" todos los permisos anteriores y asigna los nuevos
   * @param userId - ID del usuario
   * @param modulePermissions - Array de IDs de módulos a asignar
   */
  const updateUserPermissions = async (userId: string, modulePermissions: number[]) => {
    setIsLoading(true);
    try {
      if (!user) {
        console.log("user not found");
        dispatch(onLogout(t("sessionExpired")));
        return;
      }
      // Endpoint específico para actualizar permisos
      // Este endpoint debe implementar la lógica de "pisar" permisos anteriores
      const response = await fieldpartnerAPI.post(`${controller}/permissions`, {
        modulePermissions,
        userId
      });

      if (response) {
        NotificationService.showSuccess(t("permissions_updated_successfully"), {}, t("user_label"));
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("permissions_update_error"), {}, t("error_label"));
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  };



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
    // updatePasswordUsers,
    searchUsers,
    getUserById,
    changePassword,
    disableUser,
    getModulesByUserId,
    updateUserInfo,
    updateUserPermissions
  }
}