import Swal from "sweetalert2";
import { useCallback, useEffect, useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import {
  IActividadPlanificacion,
  ICiclosPlanificacion,
  IPlanificacion,
} from "../interfaces/planification";
import { only_docs } from "../../owncomponents/helpers";
import { formatISO } from "date-fns";
import { uuidv7 } from "uuidv7";
import { Ciclo } from '../components/Planification/Ciclo';

export const usePlanificationActividad = (actividadId: string) => {
  const [actividad, setAct] = useState<IActividadPlanificacion>();

  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  useEffect(() => {
    db.get(actividadId).then((a) => setAct(a));
  }, []);

  return actividad;
};

export const useCiclo = ({
  campaingId,
  loteId,
  cicloId,
}: {
  campaingId: string;
  loteId: string;
  cicloId:string
}) => {
  const { user } = useAppSelector((state) => state.auth);


  const [ciclo, setCiclo] = useState<ICiclosPlanificacion>({
    _id: `ciclo:${campaingId}:${loteId}:${uuidv7()}`,
    actividadesIds: [],
    fechaFin: formatISO(new Date()),
    fechaInicio: formatISO(new Date()),
    campanaId: campaingId,
    loteId: loteId,
    cultivoId: "",
    campoId: "",
    accountId: user?.accountId || "",
    created: { userId: user?.accountId || "", date: formatISO(new Date()) },
    modified: { userId: user?.accountId || "", date: formatISO(new Date()) },
  });

  let db =
    dbContext.fields as unknown as PouchDB.Database<ICiclosPlanificacion>;

  const saveCiclo = useCallback((cultivoId, startDate, endDate) => {

    let c = { ...ciclo };

    if(!cicloId) {
      // Nuevo -> setOtroId
      c._id = `ciclo:${campaingId}:${loteId}:${uuidv7()}`
    }

    c.fechaFin = endDate;
    c.fechaInicio = startDate;
    c.cultivoId = cultivoId;
    db.put(c).then(() => console.log("saveCiclo", c, ciclo));
    setCiclo(c);
  }, []);

  return [ciclo, saveCiclo];
};

export const useCiclos = (campaingId: string, loteId: string) => {
  const [ciclos, setCiclos] = useState([]);

  let db =
    dbContext.fields as unknown as PouchDB.Database<ICiclosPlanificacion>;

  const getCiclos = async (campaingId, loteId) => {
    let key = "ciclo:" + campaingId + ":" + loteId;
    let docsResp = only_docs(
      await db.allDocs({
        include_docs: true,
        startkey: key,
        endkey: key + "\ufff0",
      })
    );
    console.log("CICLOS", docsResp, campaingId, loteId);
    setCiclos(docsResp);
  };

  const refreshCiclos = useCallback(async () => {
    let key = "ciclo:" + campaingId + ":" + loteId;
    let docsResp = only_docs(
      await db.allDocs({
        include_docs: true,
        startkey: key,
        endkey: key + "\ufff0",
      })
    );
    console.log("CICLOS", docsResp, campaingId, loteId);
    setCiclos(docsResp);
  }, [campaingId,loteId])

  useEffect(() => {
    getCiclos(campaingId, loteId);
  }, [campaingId, loteId]);

  return [ciclos, refreshCiclos] as const;
};
export const usePlanification = (campaingId: string, campoId: string) => {
  const { user } = useAppSelector((state) => state.auth);
  const [planifications, setPlanifications] = useState<IPlanificacion[]>([]);
  const [planificationsByField, setPlanificationsByField] = useState<
    IPlanificacion[]
  >([]);
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

  const getPlanificationByField = async (
    campaingId: string,
    fieldId: string
  ) => {
    setIsLoading(false);

    let baseId = "plan:" + campaingId + ":" + fieldId;

    let result = await db.allDocs({
      startkey: "",
      endkey: "",
      include_docs: true,
    });

    if (result.rows) {
      const documents: IPlanificacion[] = result.rows.map(
        (row) => row.doc as IPlanificacion
      );
      setPlanificationsByField(documents);
    }
  };

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
