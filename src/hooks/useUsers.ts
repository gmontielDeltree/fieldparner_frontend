import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { ErrorResponseAuth, UserByAccount } from "../types";
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { fieldpartnerAPI } from '../config';
import { setUserActive } from '../redux/users';


const controller = "/user";

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

      if (!user) throw new Error("User not found. ");

      const newUser: UserByAccount = { ...userDto, accountId: user.accountId };
      const response = await fieldpartnerAPI.post(`${controller}`, newUser);

      if (response)
        Swal.fire('Usuario', 'Usuario registrado (pendiente a confirmar emal).', 'success');
      else
        Swal.fire('Error', 'Ocurrio un error inesperado.', 'error');

      navigate('/init/overview/users');

    } catch (error: any) {
      console.log("Error durante el registro:", error);
      if (error.response && error.response.data) {
        const responseError: ErrorResponseAuth = error.response.data;
        console.log("Error de respuesta:", responseError);
        if (responseError.code === "UsernameExistsException") {
          console.log("Correo electrónico ya registrado.");
          Swal.fire('Error', 'Correo electrónico ya registrado.', 'error');
        } else if (responseError.message) {
          console.log("Error durante el registro:", responseError.message);
          Swal.fire('Error', responseError.message, 'error');
        } else {
          console.log("Error desconocido durante el registro.");
          Swal.fire('Error', 'Ha ocurrido un error durante el registro.', 'error');
        }
      } else {
        console.log("Error desconocido durante el registro.");
        Swal.fire('Error', 'Ha ocurrido un error durante el registro.', 'error');
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
        console.log('documents', documents)
        setUsers(documents);
      }
      else
        setUsers([]);

      setIsLoading(false);
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  const updateUser = async (upUser: UserByAccount) => {
    setIsLoading(true);

    try {
      const userId = upUser._id;
      const bodyUser = {
        name: upUser.name,
        lastName: upUser.lastName,
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
        Swal.fire("Usuario", "Usuario actualizado.", 'success');
      
    } catch (error) {
      console.log(error);
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updatePasswordUsers = async (updateUsers: UserByAccount, oldPassword: string) => {
    setIsLoading(true);

    console.log("La función updatepasswordUsers se está ejecutando");

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
        Swal.fire('Error', 'Usuario no encontrado', 'error');
        return;
      }

      // Comprobar si la contraseña anterior coincide
      if (currentUser.password !== oldPassword) {
        setIsLoading(false);
        Swal.fire('Error', 'La contraseña anterior no coincide', 'error');
        return;
      }

      // Actualizar la contraseña
      const response = await dbContext.users.put(updateUsers);
      setIsLoading(false);

      if (response.ok)
        Swal.fire('Éxito', 'Contraseña actualizada', 'success');

      navigate('/init/overview/users/');
    } catch (error) {
      console.log(error);
      Swal.fire('Error', 'Ocurrió un error al actualizar la contraseña', 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeUsers = async (UsersId: string, removeUsers: string) => {

    try {
      const response = await dbContext.users.remove(UsersId, removeUsers);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_deleted"), 'success');

      navigate('/init/overview/users/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
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
      Swal.fire('Error', t("error_during_search"), 'error');
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

