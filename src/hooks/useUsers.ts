import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { ErrorResponseAuth, UserByAccount } from "../types";
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { clearErrorMessage, finishLoading} from '../redux/auth';
import { fieldpartnerAPI } from '../config';
import { AxiosError, HttpStatusCode } from 'axios';



export const useUsers = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserByAccount[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const controller = "/auth";
  const { user } = useAppSelector((state) => state.auth);
  // const currentAccountId = useAppSelector(state => state.auth);

  // const startConfirm = async (confirmationCode: string) => {
    
  //   try {
  //     const email = localStorage.getItem("username_temp");
  //     // if (!email) return dispatch(onLogout(""));
  
  //     const response = await fieldpartnerAPI.post(`${controller}/confirm`, {
  //       email,
  //       confirmationCode
  //     });
  
  //     if (response.status === HttpStatusCode.Created) {
  //       localStorage.removeItem("username_temp");
  //       // Eliminar la siguiente línea para evitar cerrar la sesión
  //       // dispatch(onLogout(""));
  //       navigate("/init/overview/users");
  //       return dispatch(finishLoading());
  //     }
  //   } catch (error) {
  //     // dispatch(onLogout("Por favor volve a intentar en unos minutos."));
  //     dispatch(clearErrorMessage());
  //     localStorage.removeItem("username_temp");
  //     dispatch(finishLoading());
  //   }
  // };

  const startRegister = async ({ email, password, name }: UserByAccount) => {
    console.log("Iniciando registro...");
    
    try {
        console.log("Enviando solicitud de registro...");
        const response = await fieldpartnerAPI.post(`${controller}/register`, {
            email,
            password,
            name
        });
        console.log("Respuesta del servidor:", response);

        if (response.status === HttpStatusCode.Created) {
            console.log("Registro exitoso.");
            Swal.fire({
              icon: 'success',
              title: 'Creación exitosa',
              text: 'Usuario pendiente de validación'
          });
        }
    } catch (error: AxiosError<ErrorResponseAuth> | any) {
        console.error("Error durante el registro:", error);
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
    }
    dispatch(finishLoading());
};


// const createUsers = async (newUsers: UserByAccount) => {
//   console.log("La función createUsers se está ejecutando");

//   setIsLoading(true);

//   if (!newUsers.name.trim()) {
//       console.log("Nombre de usuario no válido:", newUsers.name);
//       setConceptoError(true);
//       setIsLoading(false);
//       return;
//   }

//   try {
//       // Aquí extraemos los datos necesarios de newUsers para llamar a startRegister
//       const { name, email, password, lastName, language, admin, userId: accountId, state, photoFile } = newUsers;

//       console.log("Datos extraídos:", { name, email, password, lastName, language, admin, accountId, state, photoFile });

//       // Llamamos a la función startRegister con los datos extraídos
//       await startRegister({ email, password, lastName, userId: accountId, admin, name, language, state, photoFile });

//       console.log("Registro exitoso");
//       navigate('/init/overview/users');
//   } catch (error: any) {
//       console.log("Error durante el registro:", error);
//       if (error.response && error.response.data) {
//           const responseError: ErrorResponseAuth = error.response.data;
//           console.log("Error de respuesta:", responseError);

//           if (responseError.code === "UsernameExistsException") {
//               console.log("Correo electrónico ya registrado.");
//               Swal.fire('Error', 'Correo electrónico ya registrado.', 'error');
//           } else if (responseError.message) {
//               console.log("Error durante el registro:", responseError.message);
//               Swal.fire('Error', responseError.message, 'error');
//           } else {
//               console.log("Error desconocido durante el registro.");
//               Swal.fire('Error', 'Ha ocurrido un error durante el registro.', 'error');
//           }
//       } else {
//           console.log("Error desconocido durante el registro.");
//           Swal.fire('Error', 'Ha ocurrido un error durante el registro.', 'error');
//       }
//       setIsLoading(false);
//       if (error) setError(error);
//   }
// };

const createUsers = async (newUsers: UserByAccount) => {
  console.log("La función createUsers se está ejecutando");

  setIsLoading(true);

  if (!newUsers.name.trim()) {
    console.log("Nombre de usuario no válido:", newUsers.name);
    setConceptoError(true);
    setIsLoading(false);
    return;
  }

  try {
    
    const { name, email, password, lastName, language, admin, userId, state, photoFile } = newUsers;
    console.log("Datos extraídos:", { name, email, password, lastName, language, admin, userId, state, photoFile, accountId: user?.accountId || '' });
    const userAccountId = user ? user.accountId : '';
    const userWithAccountId = { ...newUsers, accountId: userAccountId };
    await startRegister(userWithAccountId);
    console.log("Registro exitoso");
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
      const response = await dbContext.users.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: UserByAccount[] = response.rows.map(row => row.doc as UserByAccount);
        setUsers(documents);
      }
      else
        setUsers([]);

    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  const updateUsers = async (updateUsers: UserByAccount) => {
    setIsLoading(true);

    console.log("La función updateUsers se está ejecutando");

    if (!updateUsers.name.trim()) {
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.users.put(updateUsers);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_updated"), 'success');

      navigate('/init/overview/users/');
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
  
    if (!updateUsers.password.trim()) {
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
   

    return {
        //* Propiedades
        error,
        isLoading,
        users,
        conceptoError, 

        //* Métodos
        createUsers, 
        getUsers, 
        setUsers,
        updateUsers, 
        removeUsers,
        updatePasswordUsers,  
        searchUsers,
    }
}

