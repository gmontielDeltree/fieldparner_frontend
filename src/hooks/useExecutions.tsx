import { useState, useEffect } from 'react';
import { dbContext } from '../services';
import { Ejecucion } from '../interfaces/activity';
import { useAppSelector } from './useRedux';

export const useExecutions = () => {
  const { user } = useAppSelector(state => state.auth);
  const [executions, setExecutions] = useState<Ejecucion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = dbContext.fields;

  //TODO: Las execuciones deben tener una campaña asociada, por ende podemos filtrar por accountId a través de la campaña
  const getExecutions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error(t("user_not_logged"));
      // Obtener todas las ejecuciones
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'ejecucion:',
        endkey: 'ejecucion:\ufff0'
      });

      let executionsData = result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id && doc._id.startsWith('ejecucion:')) as unknown as Ejecucion[];
      let executionOfAccounts = executionsData.filter(exec => exec?.campaña?.accountId === user?.accountId);

      setExecutions(executionOfAccounts);
    } catch (err) {
      console.error('Error fetching executions:', err);
      setError('Error al obtener las ejecuciones');
      setExecutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener ejecuciones por campaña
  const getExecutionsByCampaign = async (campaignId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await db.find({
        selector: {
          _id: { $gte: 'ejecucion:', $lt: 'ejecucion:\ufff0' },
          'campaña.campaignId': campaignId
        }
      });

      setExecutions(result.docs as unknown as Ejecucion[]);
      return result.docs;
    } catch (err) {
      console.error('Error fetching executions by campaign:', err);
      setError('Error al obtener las ejecuciones de la campaña');
      setExecutions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getExecutions();
  }, []);

  return {
    executions,
    isLoading,
    error,
    getExecutions,
    getExecutionsByCampaign
  };
};