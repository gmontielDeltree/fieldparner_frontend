import Swal from "sweetalert2";
import { useCallback, useEffect, useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import {
  IActividadPlanificacion,
  ICiclosPlanificacion,
  IInsumosPlanificacion,
  IPlanificacion,
} from "../interfaces/planification";
import { only_docs } from "../../owncomponents/helpers";
import { formatISO } from "date-fns";
import { uuidv7 } from "uuidv7";
import { Ciclo } from "../components/Planification/Ciclo";
import { Row } from "reactstrap";
import { Loading } from "../components/Loading/index";
import async from "../../netlify/edge-functions/geo";
import { ILaboresPlanificacion } from '../interfaces/planification';

export const usePlanActividad = () => {
  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  const saveActividad = async (
    actividadDoc: IActividadPlanificacion,
    lineasInsumos?,
    lineasLabores?
  ) => {
    await db.put(actividadDoc);
    await db.get(actividadDoc.cicloId).then((doc) => {
      let d = doc as unknown as ICiclosPlanificacion;
      d.actividadesIds = [...new Set([...d.actividadesIds, actividadDoc._id])];
      db.put(d);
    });
    if (lineasInsumos) {
      await db.bulkDocs(lineasInsumos).then(() =>
        console.log("Lineas Insumos Guardadas", lineasInsumos)
      );
    }
    if (lineasLabores) {
      await db.bulkDocs(lineasLabores).then(() =>
        console.log("Lineas Labores Guardadas", lineasLabores)
      );
    }
  };

  const getLineasInsumos = async (lineasIds:string[])=>{
    let d = await db.allDocs({keys:lineasIds,include_docs:true})
    let docs = d.rows.map((r)=>r.doc)
    return docs as IInsumosPlanificacion[]

  }

  const getLineasServicios = async (lineasIds:string[])=>{
    let d = await db.allDocs({keys:lineasIds,include_docs:true})
    let docs = d.rows.map((r)=>r.doc)
    return docs as ILaboresPlanificacion[]

  }
  const getActividadesByCiclo = (cicloId) => {};

  const removeActividad = async (actividadId) => {
    let act: IActividadPlanificacion = await db.get(actividadId);
    let cicloParent: ICiclosPlanificacion = await db.get(act.cicloId);
    cicloParent.actividadesIds = cicloParent.actividadesIds.filter(
      (id) => id !== actividadId
    );
    // Update cicloParent
    db.put(cicloParent);

    // Remove Lineas de insumos
    let lineas = only_docs(
      await db.allDocs({ include_docs: true, keys: act.insumosLineasIds })
    );
    lineas = lineas.map((l) => {
      l["_deleted"] = true;
      return l;
    });
    db.bulkDocs(lineas);

    // Remove Lineas de labores
    lineas = only_docs(
      await db.allDocs({ include_docs: true, keys: act.laboresLineasIds })
    );
    lineas = lineas.map((l) => {
      l["_deleted"] = true;
      return l;
    });
    db.bulkDocs(lineas);

    // Finally remove the doc
    db.remove(act);
  };

  return {
    saveActividad,
    removeActividad,
    getLineasServicios,
    getLineasInsumos,
  };
};

export const useLineasInsumos = (lineasIds) => {
  const [lin, setLin] = useState();

  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  const getLineas = useCallback(async () => {
    if (lineasIds?.length > 0) {
      let dr = only_docs(
        await db.allDocs({ include_docs: true, keys: lineasIds })
      );
      setLin(dr);
    }
  }, [lineasIds]);

  useEffect(() => {
    getLineas();
  }, [lineasIds]);

  return lin;
};

export const usePlanificationActividad = (actividadId: string) => {
  const [actividad, setAct] = useState<IActividadPlanificacion>();
  const [lineasInsumos, setLineasInsumos] = useState([]);
  const [lineasLabores, setLineasLabores] = useState([]);
  

  const [loading, setLoading] = useState(true);

  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  const getLineasInsumos = async () => {
    if (actividad?.insumosLineasIds.length) {
      let a = only_docs(
        await db.allDocs({
          include_docs: true,
          keys: actividad.insumosLineasIds,
        })
      );
      console.log(a, db, actividad.insumosLineasIds);
      setLineasInsumos(a);
    }else if(actividad?.insumosLineasIds.length === 0){
      setLineasInsumos([]);
    }
  };

  const getLineasLabores = async () => {
    if (actividad?.laboresLineasIds.length) {
      let a = only_docs(
        await db.allDocs({
          include_docs: true,
          keys: actividad.laboresLineasIds,
        })
      );
      console.log("LINEAS LABORES ", a, actividad.laboresLineasIds);
      setLineasLabores(a);
    }else if(actividad?.laboresLineasIds.length === 0){
      setLineasLabores([]);
    }
  };

  const loadLines = async () => {
    await getLineasInsumos();
    await getLineasLabores();
    setLoading(false);
  };

  useEffect(() => {
    if (actividad) {
      loadLines();
    }
  }, [actividad]);

  useEffect(() => {
    db.get(actividadId).then((a) => {
      setAct(a);
    });
  }, []);

  const refreshActividad = ()=>{
    db.get(actividad?._id).then((a) => {
      setAct(a);
    });
  }

  return { ...actividad, lineasInsumos, lineasLabores, loading, actividad, refreshActividad };
};

export const useCiclo = ({
  campaingId,
  loteId,
  cicloId,
}: {
  campaingId: string;
  loteId: string;
  cicloId: string;
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

  const saveCiclo = 
    (campanaId, lotePId,cultivoId, startDate, endDate) => {
      console.log("Saving Cycle",campanaId,cultivoId)
      let c = { ...ciclo };

      if (!cicloId) {
        // Nuevo -> setOtroId
        c._id = `ciclo:${campanaId}:${lotePId}:${uuidv7()}`;
      }

      c.loteId= loteId;
      c.campanaId = campanaId;
      c.fechaFin = endDate;
      c.fechaInicio = startDate;
      c.cultivoId = cultivoId;
      db.put(c).then(() => console.log("saveCiclo", c, ciclo));
      setCiclo(c);
    };

  return [ciclo, saveCiclo];
};

export const useListaDeCiclos = () => {
  const [ciclos, setCiclos] = useState<ICiclosPlanificacion[]>([]);

  let db =
    dbContext.fields as unknown as PouchDB.Database<ICiclosPlanificacion>;

  const getCiclos = async () => {
    let key = "ciclo:";
    let docsResp = only_docs(
      await db.allDocs({
        include_docs: true,
        startkey: key,
        endkey: key + "\ufff0",
      })
    );
    // console.log("CICLOS", docsResp, campanaId, loteId);
    setCiclos(docsResp);
  };

  const refreshCiclos = async () => {
    let key = "ciclo:";
    let docsResp = only_docs(
      await db.allDocs({
        include_docs: true,
        startkey: key,
        endkey: key + "\ufff0",
      })
    );
    setCiclos(docsResp);
  };

  const getCiclosFromCampanaAndLote = (campanaId, loteId) => {
    let fff = ciclos.filter(
      (c) => c.campanaId === campanaId && c.loteId === loteId
    );
    return fff;
  };

  const removeCiclo = (cicloId) => {
    db.get(cicloId)
      .then((d) => db.remove(d))
      .then(getCiclos);
  };

  const saveCiclo = (campanaId, loteId, ciclo, cultivoId, startDate, endDate) => {
    // console.log("ACAAAAAAAAAAAAAAAA",campaingId)
    let c = { ...ciclo };

    if (!cicloId) {
      // Nuevo -> setOtroId
      c._id = `ciclo:${campanaId}:${loteId}:${uuidv7()}`;
    }


    c.fechaFin = endDate;
    c.fechaInicio = startDate;
    c.cultivoId = cultivoId;
    db.put(c).then(() => console.log("saveCiclo", c, ciclo));
    setCiclo(c);
  };

  useEffect(() => {
    getCiclos();
    console.count("usePlanHook")
  }, []);

  return { ciclos, refreshCiclos, removeCiclo, getCiclosFromCampanaAndLote };
};

export const useCiclos = (campaingId: string, loteId: string) => {
  const [ciclos, setCiclos] = useState([]);

  let db =
    dbContext.fields as unknown as PouchDB.Database<ICiclosPlanificacion>;

  const getCiclos = async (campanaId, loteId) => {
    if (campanaId && loteId) {
      let key = "ciclo:" + campanaId + ":" + loteId;
      let docsResp = only_docs(
        await db.allDocs({
          include_docs: true,
          startkey: key,
          endkey: key + "\ufff0",
        })
      );
      // console.log("CICLOS", docsResp, campanaId, loteId);
      setCiclos(docsResp);
    }
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
  }, [campaingId, loteId]);

  const removeCiclo = (cicloId) => {
    db.get(cicloId).then((d) => db.remove(d));
  };

  useEffect(() => {
    getCiclos(campaingId, loteId);
  }, [campaingId, loteId]);

  return { ciclos, refreshCiclos, removeCiclo };
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
