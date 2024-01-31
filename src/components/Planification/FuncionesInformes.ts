import { Campaign } from "@types";
import {
  IActividadPlanificacion,
  ICiclosPlanificacion,
  IInsumosPlanificacion,
  ILaboresPlanificacion,
  TTipoActividadPlanificada,
} from "../../interfaces/planification";
import { Crop } from "../../interfaces/input";
import {
  get_lote_detalles_by_uuid,
  get_lote_doc,
  only_docs,
} from "../../../owncomponents/helpers";
import { usePlanification } from "../../hooks/usePlanifications";
import { dbContext } from "../../services";
import axios from "axios";

const db = dbContext.fields as unknown as PouchDB.Database;

const calcTotal = (
  linInsumos: IInsumosPlanificacion[],
  linLabores: ILaboresPlanificacion[]
) => {
  let totalI = linInsumos.reduce((acc, lin) => lin.totalCosto + acc, 0);
  let totalL = linLabores.reduce((acc, lin) => lin.totalCosto + acc, 0);
  return totalI + totalL;
};

const get_actividades_expandidas_del_ciclo = async (
  ciclo: ICiclosPlanificacion
) => {
  let actividadIds = ciclo.actividadesIds;

  let actDocs: IActividadPlanificacion[] = only_docs(
    await db.allDocs({ keys: actividadIds, include_docs: true })
  );

  let expanded = await Promise.all(
    actDocs.map(async (d) => {
      let insumos: IInsumosPlanificacion[] = only_docs(
        await db.allDocs({ keys: d.insumosLineasIds, include_docs: true })
      );

      let labores: ILaboresPlanificacion[] = only_docs(
        await db.allDocs({ keys: d.laboresLineasIds, include_docs: true })
      );

      console.log(insumos);

      let expTotalCostoInsumos = insumos.reduce(
        (acc, i) => acc + i.totalCantidad * i.precioUnitario,
        0
      );
      let expTotalCostoLabores = labores.reduce(
        (acc, i) => acc + i.totalCosto,
        0
      );
      return {
        ...d,
        insumos,
        labores,
        expTotalCostoInsumos,
        expTotalCostoLabores,
      };
    })
  );

  return expanded as IActividadPlanificacion[];
};

export const ReporteDeCampanas = async (
  ciclos: ICiclosPlanificacion[],
  campaigns: Campaign[],
  cultivosHook
) => {
  console.log("REPORTE CAMPANAS", ciclos, campaigns, cultivosHook);

  const reportServerUrl = "http://localhost:3000";
  const template = "./reporteCampanas.ods";
  const options = { convertTo: "pdf",lang: "fr-fr" };

  if (campaigns.length > 0) {
    let estaCampana = campaigns[0];
    let ciclosDeLaCampana = ciclos.filter(
      (c) => c.campanaId === estaCampana._id
    );

    let d = { cultivos: [] };

    let c = {};
    for (const ciclo of ciclosDeLaCampana) {
      let lote = await get_lote_doc(db, ciclo.loteId);
      let actividadesExpandidasDelCiclo =
        await get_actividades_expandidas_del_ciclo(ciclo);

      console.log("AEC", actividadesExpandidasDelCiclo);
      //
      if (!(ciclo.cultivoId in c)) {
        c[ciclo.cultivoId] = { cultivoId: ciclo.cultivoId };
        c[ciclo.cultivoId].superficie = 0;
        c[ciclo.cultivoId].nombre = cultivosHook.getCropLabelFromId(ciclo.cultivoId);
        c[ciclo.cultivoId].totalCostoInsumos = 0
        c[ciclo.cultivoId].totalCostoLabores = 0
        c[ciclo.cultivoId].ingresoCosechado = 0
        c[ciclo.cultivoId].cosechado = 0
      }

      c[ciclo.cultivoId].superficie += lote.properties.hectareas;

      // Buscar la cosecha dentro del ciclo
      let cosecha = actividadesExpandidasDelCiclo.find(
        (a) => a.tipo === TTipoActividadPlanificada.COSECHA
      );
      if (cosecha) {
        if (cosecha.rindeEstimado) {
          let precioPorTn = cosecha.precioEstimadoCosecha ?? 0;
          c[ciclo.cultivoId].cosechado += cosecha.area * cosecha.rindeEstimado;
          c[ciclo.cultivoId].ingresoCosechado +=
            cosecha.area * cosecha.rindeEstimado * precioPorTn;
        }
      }

      //--- Gastos
      // Insumos
      let totalGastosInsumos = actividadesExpandidasDelCiclo.reduce(
        (acc, act) => acc + act.expTotalCostoInsumos,
        0
      );

      // Labores
      let totalGastosLabores = actividadesExpandidasDelCiclo.reduce(
        (acc, act) => acc + act.expTotalCostoLabores,
        0
      );

      c[ciclo.cultivoId].totalCostoInsumos += totalGastosInsumos;
      c[ciclo.cultivoId].totalCostoLabores += totalGastosLabores;
    } // Fin loop Ciclo

    console.log("CCCC", c, d);
    
    // Agregaciones Finales
    for (const [key, value] of Object.entries(c)) {
        value.rindePromedio = value.cosechado / value.superficie 
        value.precioPromedio = value.cosechado !== 0 ? value.ingresoCosechado / value.cosechado : 0
        value.costoInsumosPorHa = value.totalCostoInsumos / value.superficie
        value.costoLaboresPorHa = value.totalCostoLabores / value.superficie
        value.margenBruto = value.ingresoCosechado -  value.totalCostoInsumos - value.totalCostoInsumos
        value.rendimiento = value.margenBruto / (value.totalCostoInsumos + value.totalCostoInsumos)
        value.rindeEquilibrio = (value.costoInsumosPorHa + value.costoLaboresPorHa)/value.precioPromedio; 
        value.precioEquilibrio = (value.costoInsumosPorHa + value.costoLaboresPorHa)/value.rindePromedio;
        value.ingresoPorHa = (value.ingresoCosechado) / value.superficie;
      }

    d.cultivos = Object.values(c)

    let t = axios.post(reportServerUrl, {
        template: template,
        json: JSON.stringify(d),
        options:  JSON.stringify(options)
      }, {
        responseType: 'blob', // important

        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response)=>{



        const href = window.URL.createObjectURL(response.data);

        const anchorElement = document.createElement('a');
  
        anchorElement.href = href;
        anchorElement.download = "InformeCampanas.xlsx";
  
        document.body.appendChild(anchorElement);
        anchorElement.click();
  
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);
    }).catch((e)=>alert(e))



  }
};
