import Swal from "sweetalert2";
import { useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import { IPlanificacion } from "../interfaces/planification";

export const usePlanification = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [planifications, setPlanifications] = useState<IPlanificacion[]>([]);
  const [planificationsByField, setPlanificationsByField] = useState<IPlanificacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  let db = dbContext.fields as unknown as PouchDB.Database<IPlanificacion>;

  const getPlanifications = async () => {
    setIsLoading(true);
    try {
      const result = await db.find({
        selector: { accountId: user?.accountId },
      });

      setIsLoading(false);
      if (result.docs) {
        const documents: IPlanificacion[] = result.docs.map(
          (row) => row as IPlanificacion
        );
        setPlanifications(documents);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error al cargar documentos:", error);
    }
  };



  const putPlanification = async (updateDeposit: IPlanificacion) => {
    setIsLoading(true);
    try {
      const response = await db.put(updateDeposit);
      setIsLoading(false);

      if (response.ok) {
        Swal.fire("Deposito", "Actualizado con exito.", "success");
      }

    } catch (error) {
      console.log("Error al actualizar el documento: ", error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
    }
  };

  const deletePlanification = async (deletePlanificationId: string) => {
    setIsLoading(true);
    try {
      const doc = await db.get(deletePlanificationId);

      const response = await db.remove(doc);
      setIsLoading(false);

      if (response.ok) Swal.fire("Plan", "Eliminado.", "success");
    } catch (error) {
      console.log("Error al actualizar el documento: ", error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
    }
  };


  const getPlanificationByField = async (campaingId:string,fieldId:string) =>{
 
    setIsLoading(false);

    let baseId = "plan:"+campaingId+":"+fieldId;

    let result = await db.allDocs({startkey:"", endkey:"",include_docs:true})

    if (result.rows) {
      const documents: IPlanificacion[] = result.rows.map(
        (row) => row.doc as IPlanificacion
      );
      setPlanificationsByField(documents)
    }
  }

  // const removeSupply = async () => {

  // }

  return {
    planifications,
    planificationsByField,
    isLoading,

    setPlanifications,
    getPlanifications,
    putPlanification,
    deletePlanification,
    getPlanificationByField,
  };
};
