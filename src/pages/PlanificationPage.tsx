import React, { useEffect } from "react";
import { ActividadEditorBase } from "../components/Planification/ActividadEditorBase";
import {
  IActividadPlanificacion,
  ICiclosPlanificacion,
  IPlanificacion,
  TTipoActividadPlanificada,
} from "../interfaces/planification";
import { uuidv7 } from "uuidv7";
import { formatISO } from "date-fns";
import { usePlanification } from "../hooks/usePlanifications";
import { ActividadCardBase } from "../components/Planification/ActividadCardBase";
import { PlanificationByField } from "../components/Planification/PlanificationByField";
import { Grid } from "@mui/material";

export const PlanificationPage: React.FC = () => {
  const { planifications, getPlanifications, putPlanification } =
    usePlanification();

  useEffect(() => {
    getPlanifications();
  }, []);

  useEffect(() => {
    console.log("planificaciones", planifications);
  }, [planifications]);

  let actDoc: IActividadPlanificacion = {
    accountId: "ffdfs",
    _id: "plan:actividad:" + uuidv7(),
    insumos: [],
    labores: [],
    fecha: formatISO(new Date()),
    tipo: TTipoActividadPlanificada.COSECHA,
    area: 23.4,
    totalCosto: 2344,
    campanaId: "dddd",
    planId: "dddd",
    cicloId: "cicloid",
    campoId: "campoId",
    loteId: "loteId",
    ejecutada: false,
    created: { userId: "dfsdfd", date: "" },
    modified: { userId: "dfsdfd", date: "" },
  };

  let ciclo: ICiclosPlanificacion = {
    _id: "plan:ciclo:" + uuidv7(),
    accountId: "ffdss",
    campanaId: "campañaid",
    fechaInicio: formatISO(new Date()),
    fechaFin: formatISO(new Date()),
    actividades: [actDoc],
    planId: "dddd",
    campoId: "ddd",
    loteId: "ssssss",
    costoTotal: 2122,
    cultivoId: "sojaId",
    created: {
      userId: "dfsdf",
      date: "",
    },
    modified: {
      userId: "fdfsd",
      date: "",
    },
  };

  let plan: IPlanificacion = {
    ciclos: [ciclo],
    campanaId: "",
    locked: false,
    accountId: "",
    created: {
      userId: "",
      date: "",
    },
    modified: {
      userId: "",
      date: "",
    },
    _id: "plan:" + uuidv7(),
  };

  return (
    <>
      <div>
        <Grid container></Grid>

        <PlanificationByField
          planId="dsdsds"
          fieldId="dsdsds"
        ></PlanificationByField>

        <ActividadCardBase actividad={actDoc}></ActividadCardBase>

        <ActividadEditorBase
          actividadDoc={plan.ciclos[0].actividades[0]}
          onSave={() => {
            // Update doc
            console.log("SAVE ACTIVIDAD TODO");
            putPlanification(plan);
            getPlanifications();
          }}
        ></ActividadEditorBase>
      </div>
    </>
  );
};
