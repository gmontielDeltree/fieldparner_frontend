import { useState, useEffect } from 'react';
import { dbContext } from '../services';
import { Ejecucion } from '../interfaces/activity';

export const useExecutions = () => {
  const [executions, setExecutions] = useState<Ejecucion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = dbContext.fields;

  const getExecutions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener todas las ejecuciones
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'ejecucion:',
        endkey: 'ejecucion:\ufff0'
      });
      
      const executionsData = result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id && doc._id.startsWith('ejecucion:'));
      
      setExecutions(executionsData as Ejecucion[]);
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
      
      setExecutions(result.docs as Ejecucion[]);
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