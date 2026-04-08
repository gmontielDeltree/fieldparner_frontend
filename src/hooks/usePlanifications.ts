import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { ILaboresPlanificacion } from "../interfaces/planification";
import {
  Actividad,
  DetallesAplicacion,
  LineaDosis,
  LineaLabor,
  LineaServicio,
} from "../interfaces/activity";
import { Contratista } from "../interfaces/contractor";
import { Crop } from "../interfaces/input";
import { Insumo } from "../interfaces/insumos";
import { listar_ejecuciones_por_depo } from "../../owncomponents/depositos/depositos-funciones";
import { useLabores } from "./useLabores";
import { NotificationService } from "../services/notificationService";
import { resolveSupplyDosificacion } from "../utils/supplyDose";

export const usePlanActividad = () => {
  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  const { user } = useAppSelector((state) => state.auth);

  const { t } = useTranslation();
  const { getLaborFromId } = useLabores();

  const saveActividad = async (
    actividadDoc: IActividadPlanificacion,
    lineasInsumos?,
    lineasLabores?,
  ) => {
    await db.put(actividadDoc);
    await db.get(actividadDoc.cicloId).then((doc) => {
      let d = doc as unknown as ICiclosPlanificacion;
      d.actividadesIds = [...new Set([...d.actividadesIds, actividadDoc._id])];
      db.put(d);
    });
    if (lineasInsumos) {
      await db
        .bulkDocs(lineasInsumos)
        .then(() => console.log(t("inputLinesStoredLog"), lineasInsumos));
    }
    if (lineasLabores) {
      await db
        .bulkDocs(lineasLabores)
        .then(() => console.log(t("workLinesStoredLog"), lineasLabores));
    }
  };

  const getLineasInsumos = async (lineasIds: string[]) => {
    let d = await db.allDocs({ keys: lineasIds, include_docs: true });
    let docs = d.rows.map((r) => r.doc);
    return docs as IInsumosPlanificacion[];
  };

  const getLineasServicios = async (lineasIds: string[]) => {
    let d = await db.allDocs({ keys: lineasIds, include_docs: true });
    let docs = d.rows.map((r) => r.doc);
    return docs as ILaboresPlanificacion[];
  };
  const getActividadesByCiclo = (cicloId) => { };

  const removeActividad = async (actividadId) => {
    let act: IActividadPlanificacion = await db.get(actividadId);
    let cicloParent: ICiclosPlanificacion = await db.get(act.cicloId);
    cicloParent.actividadesIds = cicloParent.actividadesIds.filter(
      (id) => id !== actividadId,
    );
    // Update cicloParent
    db.put(cicloParent);

    // Remove Lineas de insumos
    let lineas = only_docs(
      await db.allDocs({ include_docs: true, keys: act.insumosLineasIds }),
    );
    lineas = lineas.map((l) => {
      l["_deleted"] = true;
      return l;
    });
    db.bulkDocs(lineas);

    // Remove Lineas de labores
    lineas = only_docs(
      await db.allDocs({ include_docs: true, keys: act.laboresLineasIds }),
    );
    lineas = lineas.map((l) => {
      l["_deleted"] = true;
      return l;
    });
    db.bulkDocs(lineas);

    // Finally remove the doc
    db.remove(act);
  };

  const programarActividadPlanificada = async (
    actividad: IActividadPlanificacion,
  ) => {
    console.log(t("scheduleTodoLog"), actividad);
    let uuid = uuidv7();

    let ciclo: ICiclosPlanificacion = await dbContext.fields.get(
      actividad.cicloId,
    );
    let cultivo: Crop = await dbContext.crops.get(ciclo.cultivoId);

    let dosis: LineaDosis = [];
    let bunch_of_promises = await Promise.all(
      actividad.insumosLineasIds.map(async (id) => {
        let linea: IInsumosPlanificacion = await dbContext.fields.get(id);
        let insumo: Insumo = await dbContext.supplies.get(linea.insumoId);

        let nuevaLinea: LineaDosis = {
          insumo: insumo,
          uuid: uuidv7(),
          dosificacion: resolveSupplyDosificacion(linea, actividad.area) || 0,
          dosis: resolveSupplyDosificacion(linea, actividad.area) || 0,
          total: linea.totalCantidad,
          precio_estimado: linea.precioUnitario,
          deposito: null,
        };

        dosis.push(nuevaLinea);
      }),
    );

    let servicios: LineaServicio = [];
    let bunch_of_servicios = await Promise.all(
      actividad.laboresLineasIds.map(async (id) => {
        let linea: ILaboresPlanificacion = await dbContext.fields.get(id);
        let labor = getLaborFromId(linea.laborId);
        console.log(t("workLineLog"), linea);



        let nuevaLinea: LineaServicio = {
          servicio: labor?.name || "",
          contratista: actividad.contratista,
          costo_total: linea.totalCosto,
          comentario: linea.comentario || "",
          uuid: uuidv7(),
          unidades: actividad.area,
          precio_unidad: linea.costoPorHectarea,
        };

        servicios.push(nuevaLinea);
      }),
    );

    console.log("AASSSS");
    let detalles: Detalles = {
      fecha_ejecucion_tentativa: actividad.fecha,
      dosis: dosis,
      cultivo: cultivo,
      costo_labor: servicios,
      hectareas: actividad.area,
      servicios: servicios,
    };

    let nuevaActividad: Actividad = {
      _id: `actividad:${uuid}`,
      lote_uuid: actividad.loteId,
      contratista: actividad.contratista,
      uuid: uuid,
      tipo: actividad.tipo,
      detalles: detalles,
      comentario: t("fromPlanning"),
      estado: "pendiente",
      condiciones: {
        humedad_max: 80,
        humedad_min: 30,
        temperatura_max: 25,
        temperatura_min: 15,
        velocidad_max: 15,
        velocidad_min: 0,
      },
      accountId: user?.accountId || undefined,
    };
    console.log(t("newActivityLog"), nuevaActividad);

    dbContext.fields.put(nuevaActividad).then(() => {
      Promise.resolve("fdfdf");
    });
  };



  const getCicloSortedActivities = async (ciclo: ICiclosPlanificacion) => {
    let ids = ciclo.actividadesIds
    let docs = await db.allDocs<IActividadPlanificacion>({ keys: ids, include_docs: true })

    let sorted = docs.rows.sort((a, b) => (a.doc?.fecha.localeCompare(b.doc?.fecha) ? 1 : -1))

    let soloIds = sorted.map((a) => a.doc?._id)

    console.log(t("sortedLog"), docs, sorted, soloIds)
    return soloIds
  }

  return {
    saveActividad,
    removeActividad,
    getLineasServicios,
    getLineasInsumos,
    programarActividadPlanificada,
    getCicloSortedActivities,
  };
};

export const useLineasInsumos = (lineasIds) => {
  const [lin, setLin] = useState();

  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  const getLineas = useCallback(async () => {
    if (lineasIds?.length > 0) {
      let dr = only_docs(
        await db.allDocs({ include_docs: true, keys: lineasIds }),
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
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);

  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  const getLineasInsumos = async () => {
    if (actividad?.insumosLineasIds.length) {
      let a = only_docs(
        await db.allDocs({
          include_docs: true,
          keys: actividad.insumosLineasIds,
        }),
      );
      console.log(a, db, actividad.insumosLineasIds);
      setLineasInsumos(a);
    } else if (actividad?.insumosLineasIds.length === 0) {
      setLineasInsumos([]);
    }
  };

  const getLineasLabores = async () => {
    if (actividad?.laboresLineasIds.length) {
      let a = only_docs(
        await db.allDocs({
          include_docs: true,
          keys: actividad.laboresLineasIds,
        }),
      );
      console.log(t("workLinesLog"), a, actividad.laboresLineasIds);
      setLineasLabores(a);
    } else if (actividad?.laboresLineasIds.length === 0) {
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

  const refreshActividad = () => {
    db.get(actividad?._id).then((a) => {
      setAct(a);
    });
  };

  return {
    ...actividad,
    lineasInsumos,
    lineasLabores,
    loading,
    actividad,
    refreshActividad,
  };
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
  const { t } = useTranslation();

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

  const saveCiclo = (campanaId, lotePId, cultivoId, startDate, endDate, zafra = '') => {
    console.log(t("savingCycleLog"), campanaId, cultivoId, 'zafra:', zafra);
    let c = { ...ciclo };

    if (!cicloId) {
      // Nuevo -> setOtroId
      c._id = `ciclo:${campanaId}:${lotePId}:${uuidv7()}`;
    }

    c.loteId = loteId;
    c.campanaId = campanaId;
    c.fechaFin = endDate;
    c.fechaInicio = startDate;
    c.cultivoId = cultivoId;

    // Agregar zafra si se proporciona
    if (zafra) {
      c.zafra = zafra;
    }

    db.put(c).then(() => console.log(t("saveCycleLog"), c, ciclo));
    setCiclo(c);
  };



  return [ciclo, saveCiclo];
};

export const useListaDeCiclos = () => {
  const [ciclos, setCiclos] = useState<ICiclosPlanificacion[]>([]);
  const { t } = useTranslation();

  let db =
    dbContext.fields as unknown as PouchDB.Database<ICiclosPlanificacion>;

  const getCiclos = async () => {
    let key = "ciclo:";
    let docsResp = only_docs(
      await db.allDocs({
        include_docs: true,
        startkey: key,
        endkey: key + "\ufff0",
      }),
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
      }),
    );
    setCiclos(docsResp);
  };

  const getCiclosFromCampanaAndLote = (campanaId, loteId) => {
    let fff = ciclos.filter(
      (c) => c.campanaId === campanaId && c.loteId === loteId,
    );
    return fff;
  };

  const getCiclosFromCampanaAndCampo = (campanaId, campoId) => {
    let fff = ciclos.filter(
      (c) => c.campanaId === campanaId && c.campoId === campoId,
    );
    return fff;
  };

  const removeCiclo = (cicloId) => {
    db.get(cicloId)
      .then((d) => db.remove(d))
      .then(getCiclos);
  };

  const saveCiclo = (
    campanaId,
    loteId,
    ciclo,
    cultivoId,
    startDate,
    endDate,
  ) => {
    // console.log("ACAAAAAAAAAAAAAAAA",campaingId)
    let c = { ...ciclo };

    if (!cicloId) {
      // Nuevo -> setOtroId
      c._id = `ciclo:${campanaId}:${loteId}:${uuidv7()}`;
    }

    c.fechaFin = endDate;
    c.fechaInicio = startDate;
    c.cultivoId = cultivoId;
    db.put(c).then(() => console.log(t("saveCycleLog"), c, ciclo));
    setCiclo(c);
  };

  useEffect(() => {
    getCiclos();
    console.count(t("usePlanHookLog"));
  }, []);

  return { ciclos, refreshCiclos, removeCiclo, getCiclosFromCampanaAndLote, getCiclosFromCampanaAndCampo };
};

export const useCiclos = (campaingId: string, loteId: string) => {
  const [ciclos, setCiclos] = useState([]);
  const { t } = useTranslation();

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
        }),
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
      }),
    );
    console.log(t("cyclesLog"), docsResp, campaingId, loteId);
    setCiclos(docsResp);
  }, [campaingId, loteId, t]);

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
  const { t } = useTranslation();
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
          (row) => row as IPlanificacion,
        );
        setPlanifications(documents);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(t("errorLoadingDocumentsLog"), error);
    }
  };

  const putPlanification = async (updateDeposit: IPlanificacion) => {
    setIsLoading(true);
    try {
      const response = await db.put(updateDeposit);
      setIsLoading(false);

      if (response.ok) {
        NotificationService.showSuccess(t("updatedSuccessfully"), null, t("deposit_label"));
      }
    } catch (error) {
      console.log(t("errorUpdatingDocumentLog"), error);
      NotificationService.showError(t("unexpectedError"), null, null);
      setIsLoading(false);
    }
  };

  const deletePlanification = async (deletePlanificationId: string) => {
    setIsLoading(true);
    try {
      const doc = await db.get(deletePlanificationId);

      const response = await db.remove(doc);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showDeleted({ id: deletePlanificationId }, t("plan_label"));
    } catch (error) {
      console.log(t("errorUpdatingDocumentLog"), error);
      NotificationService.showError(t("unexpectedError"), null, null);
      setIsLoading(false);
    }
  };

  const getPlanificationByField = async (
    campaingId: string,
    fieldId: string,
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
        (row) => row.doc as IPlanificacion,
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
