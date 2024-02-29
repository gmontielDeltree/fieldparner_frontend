import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Users } from "../types";
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';

export const useUsers = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<Users[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const {t} = useTranslation();

  const createUsers = async (newUsers: Users) => {
    console.log("La función createUsers se está ejecutando");
  
    setIsLoading(true);
  
    if (!newUsers.name.trim()) {
      setConceptoError(true);
      setIsLoading(false);
      return; 
    }
  
    try {
      const response = await dbContext.users.post(newUsers);
  
      setIsLoading(false);
      if (response.ok)
        Swal.fire(t("origin_destination"), t("new_origin_destination"), 'success');
      else
        Swal.fire(t("origin_destination"), t("verify_mandatory_fields"), 'error');
  
      navigate('/init/overview/users/');
    } catch (error) {
      console.log(error);
      Swal.fire('Ups',  t("unexpected_error"), 'error');
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
        const documents: Users[] = response.rows.map(row => row.doc as Users);
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

  const updateUsers = async (updateUsers: Users) => {
    setIsLoading(true);

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
        const searchResults: Users[] = response.rows.map(row => row.doc as Users);
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
        searchUsers,
    }
}

