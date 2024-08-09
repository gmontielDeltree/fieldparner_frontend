import { Campaign } from "@types";
import {
  IActividadPlanificacion,
  ICiclosPlanificacion,
  IInsumosPlanificacion,
  ILaboresPlanificacion,
  TTipoActividadPlanificada,
} from "../../interfaces/planification";
import { get_lote_doc, only_docs } from "../../../owncomponents/helpers";
import { dbContext } from "../../services";
import * as XLSX from "xlsx";

import xlstempalte from "./templates/InformeCampanas.xlsx";
import { pdf } from "@react-pdf/renderer";
import { InformePorCultivoPDF } from "./pdfReports/informePorCultivo";

const db = dbContext.Fields as unknown as PouchDB.Database;

const downloadBlob = (blob: any, name = "file.txt") => {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  // Remove link from body
  document.body.removeChild(link);
};

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

interface InformePorCultivoData {
  cultivoId: string;
  superficie: number;
  nombre: string;
  totalCostoInsumos: number;
  totalCostoLabores: number;
  ingresoCosechado: number;
  cosechado: number;
  rindePromedio: number;
  precioPromedio: number;
  costoInsumosPorHa: number;
  costoLaboresPorHa: number;
  margenBruto: number;
  rendimiento: number;
  rindeEquilibrio: number;
  precioEquilibrio: number;
  ingresoPorHa: number;
}

interface In {
  [idCultivo: string]: InformePorCultivoData;
}

async function downloadInformePorCultivoXLS(data: In, campana: Campaign) {
  console.log("Data Informes", data);
  var workbook = XLSX.read(await (await fetch(xlstempalte)).arrayBuffer());
  let worksheet = workbook.Sheets["Hoja1"];
  let counter = 2;

  const addValue = (row, col, value) => {
    XLSX.utils.sheet_add_aoa(worksheet, [[value]], {
      origin: { r: row, c: col },
    });
  };

  for (const [key, value] of Object.entries(data)) {
    let row = 1;

    // Columna de cultivo
    addValue(row, counter, value.nombre);
    row += 1;
    addValue(row, counter, value.superficie);
    row += 1;
    addValue(row, counter, value.rindePromedio);
    row += 1;
    addValue(row, counter, value.cosechado);
    row += 1;
    addValue(row, counter, value.precioPromedio);
    row += 1;
    addValue(row, counter, value.ingresoCosechado);
    row += 1;
    addValue(row, counter, value.totalCostoInsumos);
    row += 1;
    addValue(row, counter, value.totalCostoLabores);
    row += 3;

    addValue(row, counter, value.ingresoPorHa);
    row += 1;
    addValue(row, counter, value.costoInsumosPorHa);
    row += 1;
    addValue(row, counter, value.costoLaboresPorHa);
    row += 2;

    addValue(row, counter, value.margenBruto);
    row += 1;
    addValue(row, counter, value.rendimiento * 100);
    row += 1;
    addValue(row, counter, value.precioEquilibrio);
    row += 1;
    addValue(row, counter, value.rindeEquilibrio);

    // Fin de la columna
    counter = counter + 1;
  }

  addValue(0, 0, "Plan de Campaña " + campana.campaignId);
  const COL_WIDTH = 150;

  /* Excel column "A" -> SheetJS column index 2 == XLSX.utils.decode_col("C") */
  var COL_INDEX = 0;

  /* create !cols array if it does not exist */
  if (!worksheet["!cols"]) worksheet["!cols"] = [];

  /* create column metadata object if it does not exist */
  if (!worksheet["!cols"][COL_INDEX])
    worksheet["!cols"][COL_INDEX] = { wch: 8 };

  /* set column width */
  worksheet["!cols"][COL_INDEX].wpx = COL_WIDTH;

  XLSX.writeFile(workbook, "ReportePorCultivo.xlsx");
  return "ffff";
}

async function downloadInformePorCultivoPdf(data: In, campaign: Campaign) {
  const blob = await pdf(
    <InformePorCultivoPDF data={data} campaign={campaign} />
  ).toBlob();

  downloadBlob(blob, "untitled.pdf");
}

export const ReporteDeCampanas = async (
  ciclos: ICiclosPlanificacion[],
  campaigns: Campaign[],
  cultivosHook,
  type: "pdf" | "xls",
  selectedCampaign: Campaign
) => {
  console.log("REPORTE CAMPANAS", ciclos, campaigns, cultivosHook);

  const reportServerUrl = "http://localhost:3000";
  const template = "./reporteCampanas.ods";
  const options = { convertTo: "pdf", lang: "fr-fr" };

  if (campaigns.length > 0) {
    let estaCampana = selectedCampaign; //(campaigns[1];
    let ciclosDeLaCampana = ciclos.filter(
      (c) => c.campanaId === estaCampana._id
    );

    console.log("ESTA CAMPÑA", estaCampana, ciclosDeLaCampana);

    let d = { cultivos: [] };

    let c = {};
    for (const ciclo of ciclosDeLaCampana) {
      let lote = await get_lote_doc(db, ciclo.loteId);
      if (!lote) {
        continue;
      }
      let actividadesExpandidasDelCiclo =
        await get_actividades_expandidas_del_ciclo(ciclo);

      console.log("AEC", actividadesExpandidasDelCiclo);
      //
      if (!(ciclo.cultivoId in c)) {
        c[ciclo.cultivoId] = { cultivoId: ciclo.cultivoId };
        c[ciclo.cultivoId].superficie = 0;
        c[ciclo.cultivoId].nombre = cultivosHook.getCropLabelFromId(
          ciclo.cultivoId
        );
        c[ciclo.cultivoId].totalCostoInsumos = 0;
        c[ciclo.cultivoId].totalCostoLabores = 0;
        c[ciclo.cultivoId].ingresoCosechado = 0;
        c[ciclo.cultivoId].cosechado = 0;
      }

      // Sumar el AREA SEMBRADA
      let siembras = actividadesExpandidasDelCiclo.filter(
        (a) => a.tipo === TTipoActividadPlanificada.SIEMBRA
      );
      c[ciclo.cultivoId].superficie += siembras.reduce(
        (pv, cv) => cv.area + pv,
        0
      );

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

    // Agregaciones Finales
    for (const [key, value] of Object.entries(c)) {
      value.rindePromedio = value.cosechado / value.superficie;
      value.precioPromedio =
        value.cosechado !== 0 ? value.ingresoCosechado / value.cosechado : 0;
      value.costoInsumosPorHa = value.totalCostoInsumos / value.superficie;
      value.costoLaboresPorHa = value.totalCostoLabores / value.superficie;
      value.margenBruto =
        value.ingresoCosechado -
        value.totalCostoInsumos -
        value.totalCostoLabores;
      value.rendimiento =
        value.margenBruto / (value.totalCostoInsumos + value.totalCostoLabores);
      value.rindeEquilibrio =
        (value.costoInsumosPorHa + value.costoLaboresPorHa) /
        value.precioPromedio;
      value.precioEquilibrio =
        (value.costoInsumosPorHa + value.costoLaboresPorHa) /
        value.rindePromedio;
      value.ingresoPorHa = value.ingresoCosechado / value.superficie;
    }

    d.cultivos = Object.values(c);

    console.log("CCCC", c, d);

    if (type === "pdf") {
      downloadInformePorCultivoPdf(c, selectedCampaign);
    } else if (type === "xls") {
      downloadInformePorCultivoXLS(c, selectedCampaign);
    }
    // let t = axios.post(reportServerUrl, {
    //     template: template,
    //     json: JSON.stringify(d),
    //     options:  JSON.stringify(options)
    //   }, {
    //     responseType: 'blob', // important
    //
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded'
    //     }
    // }).then((response)=>{
    //
    //
    //
    //     const href = window.URL.createObjectURL(response.data);
    //
    //     const anchorElement = document.createElement('a');
    //
    //     anchorElement.href = href;
    //     anchorElement.download = "InformeCampanas.xlsx";
    //
    //     document.body.appendChild(anchorElement);
    //     anchorElement.click();
    //
    //     document.body.removeChild(anchorElement);
    //     window.URL.revokeObjectURL(href);
    // }).catch((e)=>alert(e))
    //
  }
};

export const get_ingresos_egresos = async (ciclos: ICiclosPlanificacion[]) => {
  for (const ciclo of ciclos) {
    let lote = await get_lote_doc(db, ciclo.loteId);
    if (!lote) {
      continue;
    }
    let actividadesExpandidasDelCiclo =
      await get_actividades_expandidas_del_ciclo(ciclo);
    console.log("AEC", actividadesExpandidasDelCiclo);

    let egresos = 0;
    let ingresos = 0;

    for (const [key, value] of Object.entries(actividadesExpandidasDelCiclo)) {
      if (
        value.tipo === "cosecha" &&
        value.precioEstimadoCosecha !== undefined &&
        value.rindeEstimado !== undefined
      ) {
        ingresos =
          ingresos +
          value.area * value.precioEstimadoCosecha * value.rindeEstimado;
      }

      egresos =
        egresos +
        (value.expTotalCostoInsumos ? value.expTotalCostoInsumos : 0) +
        (value.expTotalCostoLabores ? value.expTotalCostoLabores : 0);
    }

    return [ingresos, egresos];
  }
};
