import * as d3 from "d3"
import {addColorScale} from 'plotty'

export interface IndiceEspectral {
  name: string;
  value: string;
  label: string;
  thresholds: number[];
  thresholds_labels: string[];
  colormap: string;
  domain: number[];
  colormap_fn: any;
  descripcion: string;
}


addColorScale("RdYlGn",[d3.interpolateRdYlGn(0), d3.interpolateRdYlGn(0.5),d3.interpolateRdYlGn(1)], [0, 0.5, 1])
addColorScale("Blues",[d3.interpolateBlues(0), d3.interpolateBlues(0.5),d3.interpolateBlues(1)], [0, 0.5, 1])


export const list_of_indexes: IndiceEspectral[] = [
  {
    name: "NDVI",
    label: "NDVI",
    value: "ndvi",
    domain: [-1, 1],
    thresholds: [-1, 0.2, 0.3, 1],
    thresholds_labels: ["no-vegetacion", "pradera", "denso"],
    colormap: "viridis",
    colormap_fn: d3.interpolateViridis,
    descripcion:"NDVI define valores de -1.0 a 1.0, donde los valores negativos se forman principalmente a partir de nubes, agua y nieve, y los valores cercanos a cero se forman principalmente a partir de rocas y suelo desnudo. Valores muy pequeños (0,1 o menos) de la función NDVI corresponden a áreas vacías de rocas, arena o nieve. Los valores moderados (de 0,2 a 0,3) representan arbustos y praderas, mientras que los valores altos (de 0,6 a 0,8) indican bosques templados y tropicales."
  },
    {
    name: "NDRE",
    label: "NDRE",
    value: "ndre",
    domain: [-1, 1],
    thresholds: [-1, 0.2, 0.6, 1],
    thresholds_labels: ["desnudo", "creciendo", "saludable"],
    colormap: "RdYlGn",
    colormap_fn: d3.interpolateRdYlGn,
    descripcion:"NDRE define valores de -1.0 a 1.0, donde de -1 a 0,2 indican suelo desnudo o un cultivo en desarrollo; 0,2 a 0,6 puede interpretarse como una planta enferma o un cultivo que aún no está maduro; 0,6 a 1 son buenos valores que indican cultivos sanos, maduros y maduros."
  },
    {
    name: "MSAVI",
    label: "MSAVI",
    value: "msavi",
    domain: [-1, 1],
    thresholds: [-1, 0.2, 0.4, 0.6],
    thresholds_labels: ["desnudo", "germinacíon", "saludable"],
    colormap: "RdYlGn",
    colormap_fn: d3.interpolateRdYlGn,
    descripcion: "Los valores de MSAVI van de -1 a 1, donde: -1 a 0.2 indican suelo desnudo; 0.2 a 0.4 es la etapa de germinación de la semilla; 0.4 a 0.6 es la etapa de desarrollo de la hoja. Cuando los valores superan 0,6, ya es hora de aplicar NDVI en su lugar. En otras palabras, la vegetación es lo suficientemente densa como para cubrir el suelo."
  },
    {
    name: "NDMI",
    label: "NDMI",
    value: "ndmi",
    domain: [-1, 1],
    thresholds: [-1, -0.5, 0.5, 1],
    thresholds_labels: ["estres","normal","anegamiento"],
    colormap: "Blues",
    colormap_fn: d3.interpolateBlues,
    descripcion: "El Índice de humedad de diferencia normalizada (NDMI) detecta los niveles de humedad en la vegetación mediante una combinación de bandas espectrales de infrarrojo cercano (NIR) e infrarrojo de onda corta (SWIR). El NDMI solo puede tener valores entre -1 y 1, lo que lo hace muy fácil. interpretar. El estrés hídrico estaría señalado por los valores negativos que se aproximan a -1, mientras que el +1 puede indicar anegamiento."
  },

];

export type IndicesResponse = {
  info: {
    band_descriptions: Array<Array<string>>;
    band_metadata: Array<[string, {}]>;
    bounds: Array<number>;
    colorinterp: Array<string>;
    colormap: any;
    count: number;
    driver: string;
    dtype: string;
    height: number;
    maxzoom: number;
    minzoom: number;
    nodata_type: string;
    offset: any;
    overviews: Array<any>;
    scale: any;
    width: number;
  };
  png_url: string;
  stats: {
    count: number;
    histogram: Array<Array<number>>;
    majority: number;
    masked_pixels: number;
    max: number;
    mean: number;
    median: number;
    min: number;
    minority: number;
    percentile_2: number;
    percentile_98: number;
    std: number;
    sum: number;
    unique: number;
    valid_percent: number;
    valid_pixels: number;
  };
  tiff_url: string;
};
