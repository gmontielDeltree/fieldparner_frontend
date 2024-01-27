import React, { useEffect, useState } from "react";
import {
  IActividadPlanificacion,
  ICiclosPlanificacion,
  IPlanificacion,
  TTipoActividadPlanificada,
} from "../interfaces/planification";
import { uuidv7 } from "uuidv7";
import { formatISO } from "date-fns";
import { PlanificationByField } from "../components/Planification/PlanificationByField";
import { Grid, List, Paper } from "@mui/material";
import { useField } from "../hooks/useField";
import { useCampaign } from "../hooks";
import { ItemPlanificationByField } from "../components/Planification/ItemPlanificationByField";
import { useNavigate } from "react-router-dom";

export const PlanificationPage: React.FC = () => {
  const navigation = useNavigate();

  const { fields, getFields } = useField();
  const { campaigns, getCampaigns } = useCampaign();

  const [selCampanaId, setSelCampanaId] = useState();
  const [selCampoId, setSelCampoId] = useState();

  useEffect(() => {
    getCampaigns();
    getFields();
  }, []);

  useEffect(() => {
    console.log("campos", fields);
    console.log("campañas", campaigns);
  }, [fields, campaigns]);

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
      


     
        <Grid container>
          <Grid item>
            <Paper sx={{ maxHeight: "100%" }}>
              Planificaciones
              <List sx={{ maxHeight: "100vh", overflowY: "auto" }}>
                {fields === undefined && <li>"No hay campos"</li>}
                {fields?.map((campo, i) => (
                  <ItemPlanificationByField
                    key={i}
                    campo={campo}
                    campanas={campaigns}
                    onCampaignClick={(campana, lote) => {
                      setSelCampanaId(campana._id)
                      setSelCampoId(campo._id)
                      console.log("CLICK!!!",campana,campo)
                    }}
                  />
                ))}
              </List>
            </Paper>
          </Grid>

          {selCampanaId && selCampoId && (
            <Grid item xs={6}>
      
              <Paper>
                <PlanificationByField
                campaignId={selCampanaId}
                fieldId={selCampoId}
              />
              </Paper>

            </Grid>
          )}
        </Grid>

      

        {/* 
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
        ></ActividadEditorBase> */}
      
    </>
  );
};
