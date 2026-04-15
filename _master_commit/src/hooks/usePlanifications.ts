import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import { useOrder } from "./useOrder";
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
import { getMatchingSupplyStocks } from "../utils/stockAllocation";
import {
  OrderStatus,
  WithdrawalOrder,
  WithdrawalOrderType,
} from "../types";
import { Stock } from "../interfaces/stock";

const isSowingPlanActivity = (actividad?: Partial<IActividadPlanificacion> | null) =>
  (actividad?.tipo || "").toLowerCase() === "siembra";

const getPlanLineDepositId = (linea?: Partial<IInsumosPlanificacion> | null) =>
  linea?.depositoId || (linea?.deposito as any)?._id || "";

const getPlanLineNroLote = (linea?: Partial<IInsumosPlanificacion> | null) =>
  (linea?.nroLote || "").toString().trim();

const getPlanLineUbicacion = (linea?: Partial<IInsumosPlanificacion> | null) =>
  (linea?.ubicacion || "").toString().trim();

const normalizeReservationValue = (value?: string | number | null) =>
  String(value ?? "").trim().toLowerCase();

const hasSameReservationData = (
  previousLine: Partial<IInsumosPlanificacion> | null,
  nextLine: Partial<IInsumosPlanificacion> | null,
) => {
  if (!previousLine || !nextLine) return false;

  return (
    String(previousLine.insumoId || "") === String(nextLine.insumoId || "") &&
    Number(previousLine.totalCantidad || 0) === Number(nextLine.totalCantidad || 0) &&
    Number(previousLine.dosis || 0) === Number(nextLine.dosis || 0) &&
    Number(previousLine.hectareas || 0) === Number(nextLine.hectareas || 0) &&
    getPlanLineDepositId(previousLine) === getPlanLineDepositId(nextLine) &&
    getPlanLineUbicacion(previousLine) === getPlanLineUbicacion(nextLine) &&
    getPlanLineNroLote(previousLine) === getPlanLineNroLote(nextLine)
  );
};

export const usePlanActividad = () => {
  let db =
    dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;

  const { user } = useAppSelector((state) => state.auth);

  const { t } = useTranslation();
  const { getLaborFromId } = useLabores();
  const { createWithdrawalOrder } = useOrder();

  const getPlanSupplyLines = async (lineasIds: string[] = []) => {
    if (!lineasIds.length) return [] as IInsumosPlanificacion[];

    const response = await db.allDocs({
      keys: lineasIds,
      include_docs: true,
    });

    return response.rows
      .map((row) => row.doc)
      .filter(Boolean) as IInsumosPlanificacion[];
  };

  const getPlanServiceLines = async (lineasIds: string[] = []) => {
    if (!lineasIds.length) return [] as ILaboresPlanificacion[];

    const response = await db.allDocs({
      keys: lineasIds,
      include_docs: true,
    });

    return response.rows
      .map((row) => row.doc)
      .filter(Boolean) as ILaboresPlanificacion[];
  };

  const getWithdrawalCampaignId = async (campanaId?: string) => {
    if (!campanaId) return "";

    try {
      const campaign = await dbContext.campaigns.get(campanaId);
      return campaign.campaignId || campaign._id || campanaId;
    } catch (error) {
      try {
        const response = await dbContext.campaigns.find({
          selector: {
            campaignId: campanaId,
          },
        } as any);
        const campaign = response.docs[0] as any;
        return campaign?.campaignId || campaign?._id || campanaId;
      } catch {
        return campanaId;
      }
    }
  };

  const hasAppliedReservation = async (
    withdrawalOrder?: WithdrawalOrder | null,
    linea?: Partial<IInsumosPlanificacion> | null,
  ) => {
    if (!user || !withdrawalOrder?.order || !linea?.insumoId || !getPlanLineDepositId(linea)) {
      return false;
    }

    try {
      const orderNumber = withdrawalOrder.order;
      const latestOrder = withdrawalOrder._id
        ? await dbContext.withdrawalOrders.get(withdrawalOrder._id).catch(() => withdrawalOrder)
        : withdrawalOrder;

      const depositSupplyResult = await dbContext.depositSupplyOrder.find({
        selector: {
          accountId: user.accountId,
          order: orderNumber,
        },
      } as any);

      const matchingOrderLine = (depositSupplyResult.docs as any[]).find((doc) =>
        normalizeReservationValue(doc.supplyId) === normalizeReservationValue(linea.insumoId) &&
        normalizeReservationValue(doc.depositId) === normalizeReservationValue(getPlanLineDepositId(linea)) &&
        normalizeReservationValue(doc.location) === normalizeReservationValue(getPlanLineUbicacion(linea)) &&
        normalizeReservationValue(doc.nroLot) === normalizeReservationValue(getPlanLineNroLote(linea))
      );

      if (!matchingOrderLine) {
        return false;
      }

      const reservedAmount =
        Number(matchingOrderLine.originalAmount || 0) -
        Number(matchingOrderLine.withdrawalAmount || 0);

      if (reservedAmount <= 0) {
        return false;
      }

      const stockResult = await dbContext.stock.find({
        selector: {
          accountId: user.accountId,
          id: matchingOrderLine.supplyId,
          depositId: matchingOrderLine.depositId,
        },
      } as any);

      const matchingStock = getMatchingSupplyStocks(
        stockResult.docs as Stock[],
        {
          supplyId: matchingOrderLine.supplyId,
          depositId: matchingOrderLine.depositId,
          campaignId: latestOrder?.campaignId,
          location: matchingOrderLine.location,
          nroLot: matchingOrderLine.nroLot ? String(matchingOrderLine.nroLot) : "",
        },
      )[0];

      return Number(matchingStock?.reservedStock || 0) >= reservedAmount;
    } catch (error) {
      console.warn("Could not validate existing reservation state for annual planning line", error);
      return false;
    }
  };

  const releasePlannedWithdrawalOrder = async (withdrawalOrder?: WithdrawalOrder | null) => {
    if (!withdrawalOrder?._id || !withdrawalOrder?.order || !user) return;

    try {
      const latestOrder = await dbContext.withdrawalOrders.get(withdrawalOrder._id);
      const depositSupplyResult = await dbContext.depositSupplyOrder.find({
        selector: {
          accountId: user.accountId,
          order: latestOrder.order,
        },
      });

      for (const depositSupply of depositSupplyResult.docs as any[]) {
        const reservedAmount =
          Number(depositSupply.originalAmount || 0) -
          Number(depositSupply.withdrawalAmount || 0);

        if (reservedAmount <= 0) continue;

        try {
          const stockResult = await dbContext.stock.find({
            selector: {
              accountId: user.accountId,
              id: depositSupply.supplyId,
              depositId: depositSupply.depositId,
            },
          } as any);

          const stockDoc = getMatchingSupplyStocks(
            stockResult.docs as Stock[],
            {
              supplyId: depositSupply.supplyId,
              depositId: depositSupply.depositId,
              campaignId: latestOrder.campaignId,
              location: depositSupply.location,
              nroLot: depositSupply.nroLot ? String(depositSupply.nroLot) : "",
            },
          )[0] as any;

          if (stockDoc) {
            stockDoc.reservedStock = Math.max(
              0,
              Number(stockDoc.reservedStock || 0) - reservedAmount,
            );
            stockDoc.lastUpdate = new Date().toISOString();
            await dbContext.stock.put(stockDoc);
          }
        } catch (stockError) {
          console.error("Error releasing reserved stock for planned activity:", stockError);
        }
      }

      const docsToDelete = depositSupplyResult.docs.map((doc: any) => ({
        ...doc,
        _deleted: true,
      }));

      if (docsToDelete.length) {
        await dbContext.depositSupplyOrder.bulkDocs(docsToDelete);
      }

      await dbContext.withdrawalOrders.remove(latestOrder);
    } catch (error) {
      console.error("Error releasing planned withdrawal order:", error);
    }
  };

  const reserveStockForPlannedLines = async (
    actividadDoc: IActividadPlanificacion,
    lineasInsumos: IInsumosPlanificacion[] = [],
  ) => {
    if (!user || !lineasInsumos.length || !isSowingPlanActivity(actividadDoc)) {
      return lineasInsumos;
    }

    const campaignId = await getWithdrawalCampaignId(actividadDoc.campanaId);

    for (const linea of lineasInsumos) {
      if (linea.ordenRetiro?._id) continue;

      const depositId = getPlanLineDepositId(linea);
      if (!depositId) continue;

      try {
        const createdOrder = await createWithdrawalOrder(
          {
            accountId: user.accountId,
            type: WithdrawalOrderType.Automatica,
            creationDate: new Date().toISOString(),
            order: 0,
            reason: "Reserva de stock",
            campaignId,
            field: actividadDoc.campoId || "",
            state: OrderStatus.Pending,
            withdrawId: actividadDoc.contratista?._id || "",
          },
          [
            {
              accountId: user.accountId,
              order: 0,
              depositId,
              location: getPlanLineUbicacion(linea),
              supplyId: linea.insumoId,
              nroLot: getPlanLineNroLote(linea),
              withdrawalAmount: 0,
              originalAmount: Number(linea.totalCantidad || 0),
            } as any,
          ],
          WithdrawalOrderType.Automatica,
        );

        if (createdOrder) {
          linea.ordenRetiro = createdOrder;
        }
      } catch (error) {
        console.error("Error reserving stock for annual plan line:", error);
      }
    }

    return lineasInsumos;
  };

  const saveActividad = async (
    actividadDoc: IActividadPlanificacion,
    lineasInsumos?,
    lineasLabores?,
  ) => {
    const nextSupplyLines = (lineasInsumos || []) as IInsumosPlanificacion[];
    const nextServiceLines = (lineasLabores || []) as ILaboresPlanificacion[];
    const actividadDocToPersist = { ...actividadDoc };

    let previousActivity: IActividadPlanificacion | null = null;
    try {
      previousActivity = await db.get(actividadDoc._id);
      actividadDocToPersist._rev = previousActivity._rev;
    } catch (error: any) {
      if (error?.name !== "not_found") {
        throw error;
      }
    }

    const previousSupplyLines = previousActivity
      ? await getPlanSupplyLines(previousActivity.insumosLineasIds || [])
      : [];
    const previousServiceLines = previousActivity
      ? await getPlanServiceLines(previousActivity.laboresLineasIds || [])
      : [];

    const previousSupplyLineMap = new Map(
      previousSupplyLines.map((linea) => [linea._id, linea]),
    );
    const previousServiceLineMap = new Map(
      previousServiceLines.map((linea) => [linea._id, linea]),
    );

    const previousContextChanged = Boolean(
      previousActivity &&
      (
        String(previousActivity.campanaId || "") !== String(actividadDocToPersist.campanaId || "") ||
        String(previousActivity.campoId || "") !== String(actividadDocToPersist.campoId || "") ||
        String(previousActivity.contratista?._id || "") !== String(actividadDocToPersist.contratista?._id || "")
      ),
    );

    const ordersToRelease = new Map<string, WithdrawalOrder>();
    const linesNeedingReservation = new Set<string>();

    const mergedSupplyLines: IInsumosPlanificacion[] = [];

    for (const linea of nextSupplyLines) {
      const previousLine = previousSupplyLineMap.get(linea._id);
      const mergedLine = previousLine
        ? { ...previousLine, ...linea, _id: previousLine._id, _rev: previousLine._rev }
        : { ...linea };

      const reservationShouldBeReusable =
        isSowingPlanActivity(actividadDocToPersist) &&
        !previousContextChanged &&
        previousLine?.ordenRetiro &&
        hasSameReservationData(previousLine, mergedLine);

      const reservationIsApplied = reservationShouldBeReusable
        ? await hasAppliedReservation(previousLine?.ordenRetiro, mergedLine)
        : false;

      if (reservationShouldBeReusable && reservationIsApplied) {
        mergedLine.ordenRetiro = previousLine?.ordenRetiro || null;
      } else {
        if (previousLine?.ordenRetiro) {
          const orderKey = previousLine.ordenRetiro._id || String(previousLine.ordenRetiro.order);
          ordersToRelease.set(orderKey, previousLine.ordenRetiro);
        }
        mergedLine.ordenRetiro = null;
      }

      if (isSowingPlanActivity(actividadDocToPersist) && getPlanLineDepositId(mergedLine)) {
        if (!mergedLine.ordenRetiro?._id) {
          linesNeedingReservation.add(mergedLine._id);
        }
      }

      if (!isSowingPlanActivity(actividadDocToPersist)) {
        mergedLine.ordenRetiro = null;
      }

      mergedSupplyLines.push(mergedLine);
    }

    for (const previousLine of previousSupplyLines) {
      const stillExists = mergedSupplyLines.some((linea) => linea._id === previousLine._id);
      if (!stillExists && previousLine.ordenRetiro) {
        const orderKey = previousLine.ordenRetiro._id || String(previousLine.ordenRetiro.order);
        ordersToRelease.set(orderKey, previousLine.ordenRetiro);
      }
    }

    for (const withdrawalOrder of ordersToRelease.values()) {
      await releasePlannedWithdrawalOrder(withdrawalOrder);
    }

    await db.put(actividadDocToPersist);
    await db.get(actividadDocToPersist.cicloId).then((doc) => {
      let d = doc as unknown as ICiclosPlanificacion;
      d.actividadesIds = [...new Set([...d.actividadesIds, actividadDocToPersist._id])];
      return db.put(d);
    });

    if (mergedSupplyLines.length) {
      const response = await db.bulkDocs(mergedSupplyLines);
      response.forEach((result, index) => {
        if (result.ok && result.rev) {
          mergedSupplyLines[index]._rev = result.rev;
        }
      });
      console.log(t("inputLinesStoredLog"), mergedSupplyLines);
    }

    if (nextServiceLines.length) {
      const mergedServiceLines = nextServiceLines.map((linea) => {
        const previousLine = previousServiceLineMap.get(linea._id);
        return previousLine
          ? { ...previousLine, ...linea, _id: previousLine._id, _rev: previousLine._rev }
          : { ...linea };
      });

      await db
        .bulkDocs(mergedServiceLines)
        .then(() => console.log(t("workLinesStoredLog"), mergedServiceLines));
    }

    const removedSupplyLines = previousSupplyLines
      .filter((linea) => !mergedSupplyLines.some((nextLine) => nextLine._id === linea._id))
      .map((linea) => ({ ...linea, _deleted: true }));

    if (removedSupplyLines.length) {
      await db.bulkDocs(removedSupplyLines);
    }

    const removedServiceLines = previousServiceLines
      .filter((linea) => !nextServiceLines.some((nextLine) => nextLine._id === linea._id))
      .map((linea) => ({ ...linea, _deleted: true }));

    if (removedServiceLines.length) {
      await db.bulkDocs(removedServiceLines);
    }

    const linesToReserve = mergedSupplyLines.filter((linea) =>
      linesNeedingReservation.has(linea._id),
    );

    if (linesToReserve.length) {
      await reserveStockForPlannedLines(actividadDocToPersist, linesToReserve);
      await db.bulkDocs(linesToReserve);
    }
  };

  const getLineasInsumos = async (lineasIds: string[]) => {
    return getPlanSupplyLines(lineasIds);
  };

  const getLineasServicios = async (lineasIds: string[]) => {
    return getPlanServiceLines(lineasIds);
  };
  const getActividadesByCiclo = (cicloId) => { };

  const removeActividad = async (actividadId) => {
    let act: IActividadPlanificacion = await db.get(actividadId);
    let cicloParent: ICiclosPlanificacion = await db.get(act.cicloId);
    cicloParent.actividadesIds = cicloParent.actividadesIds.filter(
      (id) => id !== actividadId,
    );
    // Update cicloParent
    await db.put(cicloParent);

    // Remove Lineas de insumos
    let lineas = only_docs(
      await db.allDocs({ include_docs: true, keys: act.insumosLineasIds }),
    );

    const releaseCandidates = (lineas as IInsumosPlanificacion[])
      .map((linea) => linea?.ordenRetiro)
      .filter(Boolean) as WithdrawalOrder[];
    const uniqueOrders = new Map(
      releaseCandidates.map((order) => [order._id || String(order.order), order]),
    );

    for (const withdrawalOrder of uniqueOrders.values()) {
      await releasePlannedWithdrawalOrder(withdrawalOrder);
    }

    lineas = lineas.map((l) => {
      l["_deleted"] = true;
      return l;
    });
    await db.bulkDocs(lineas);

    // Remove Lineas de labores
    lineas = only_docs(
      await db.allDocs({ include_docs: true, keys: act.laboresLineasIds }),
    );
    lineas = lineas.map((l) => {
      l["_deleted"] = true;
      return l;
    });
    await db.bulkDocs(lineas);

    // Finally remove the doc
    await db.remove(act);
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
        let deposito = linea.deposito || null;

        if (!deposito && getPlanLineDepositId(linea)) {
          try {
            deposito = await dbContext.deposits.get(getPlanLineDepositId(linea));
          } catch (error) {
            console.warn("Could not load deposit for planned activity line", error);
          }
        }

        let nuevaLinea: LineaDosis = {
          insumo: insumo,
          uuid: uuidv7(),
          dosificacion: resolveSupplyDosificacion(linea, actividad.area) || 0,
          dosis: resolveSupplyDosificacion(linea, actividad.area) || 0,
          total: linea.totalCantidad,
          precio_estimado: linea.precioUnitario,
          deposito: deposito,
          ubicacion: linea.ubicacion || "",
          nro_lote: linea.nroLote || "",
          orden_de_retiro: linea.ordenRetiro || null,
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
