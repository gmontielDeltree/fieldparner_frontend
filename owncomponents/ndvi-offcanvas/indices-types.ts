import * as d3 from "d3"
import { addColorScale } from 'plotty'

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


addColorScale("RdYlGn", [d3.interpolateRdYlGn(0), d3.interpolateRdYlGn(0.5), d3.interpolateRdYlGn(1)], [0, 0.5, 1])
addColorScale("Blues", [d3.interpolateBlues(0), d3.interpolateBlues(0.5), d3.interpolateBlues(1)], [0, 0.5, 1])

// Esta función obtendrá las descripciones de índices traducidas
// La función debe ser llamada después de inicializar i18n
export const getTranslatedIndices = (t) => {
  // Colormaps deben matchear https://cogeotiff.github.io/rio-tiler/colormap/
  return [
    {
      name: "NDVI",
      label: "NDVI",
      value: "ndvi",
      domain: [-1, 1],
      thresholds: [-1, 0.2, 0.3, 1],
      thresholds_labels: [t("noVegetation"), t("grassland"), t("dense")],
      colormap: "piyg",
      colormap_fn: d3.interpolatePiYG,
      descripcion: t("ndviDescription")
    },
    {
      name: "NDRE",
      label: "NDRE",
      value: "ndre",
      domain: [-1, 1],
      thresholds: [-1, 0.2, 0.6, 1],
      thresholds_labels: [t("bareSoil"), t("growing"), t("healthy")],
      colormap: "RdYlGn",
      colormap_fn: d3.interpolateRdYlGn,
      descripcion: t("ndreDescription")
    },
    {
      name: "MSAVI",
      label: "MSAVI",
      value: "msavi",
      domain: [-1, 1],
      thresholds: [-1, 0.2, 0.4, 0.6],
      thresholds_labels: [t("bareSoil"), t("germination"), t("healthy")],
      colormap: "RdYlGn",
      colormap_fn: d3.interpolateRdYlGn,
      descripcion: t("msaviDescription")
    },
    {
      name: "NDMI",
      label: "NDMI",
      value: "ndmi",
      domain: [-1, 1],
      thresholds: [-1, -0.5, 0.5, 1],
      thresholds_labels: [t("stress"), t("normal"), t("waterlogging")],
      colormap: "Blues",
      colormap_fn: d3.interpolateBlues,
      descripcion: t("ndmiDescription")
    },
    {
      name: "EVI",
      label: "EVI",
      value: "evi",
      domain: [-1, 1],
      thresholds: [-1, 0.2, 0.8],
      thresholds_labels: [t("notHealthy"), t("healthy")],
      colormap: "Blues",
      colormap_fn: d3.interpolateBlues,
      descripcion: t("eviDescription")
    },
    {
      name: "ARVI",
      label: "arvi",
      value: "arvi",
      domain: [-1, 1],
      thresholds: [-1, 0.2, 0.3, 1],
      thresholds_labels: [t("noVegetation"), t("grassland"), t("dense")],
      colormap: "piyg",
      colormap_fn: d3.interpolatePiYG,
      descripcion: t("arviDescription")
    },
    {
      name: "GCI",
      label: "GCI",
      value: "gci",
      domain: [-1, 1],
      thresholds: [-1, 0.2, 0.3, 1],
      thresholds_labels: [t("noVegetation"), t("grassland"), t("dense")],
      colormap: "piyg",
      colormap_fn: d3.interpolatePiYG,
      descripcion: t("gciDescription")
    },
    {
      name: "SIPI",
      label: "SIPI",
      value: "sipi",
      domain: [-1, 1],
      thresholds: [-1, -0.5, 0.5, 1],
      thresholds_labels: [t("stress"), t("normal"), t("waterlogging")],
      colormap: "inferno",
      colormap_fn: d3.interpolateInferno,
      descripcion: t("sipiDescription")
    },
  ];
};

// Mantener la lista estática para compatibilidad con código existente
export const list_of_indexes: IndiceEspectral[] = [
  {
    name: "NDVI",
    label: "NDVI",
    value: "ndvi",
    domain: [-1, 1],
    thresholds: [-1, 0.2, 0.3, 1],
    thresholds_labels: ["no-vegetacion", "pradera", "denso"],
    colormap: "piyg",
    colormap_fn: d3.interpolatePiYG,
    descripcion: "NDVI define valores de -1.0 a 1.0, donde los valores negativos se forman principalmente a partir de nubes, agua y nieve, y los valores cercanos a cero se forman principalmente a partir de rocas y suelo desnudo. Valores muy pequeños (0,1 o menos) de la función NDVI corresponden a áreas vacías de rocas, arena o nieve. Los valores moderados (de 0,2 a 0,3) representan arbustos y praderas, mientras que los valores altos (de 0,6 a 0,8) indican bosques templados y tropicales."
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
    descripcion: "NDRE define valores de -1.0 a 1.0, donde de -1 a 0,2 indican suelo desnudo o un cultivo en desarrollo; 0,2 a 0,6 puede interpretarse como una planta enferma o un cultivo que aún no está maduro; 0,6 a 1 son buenos valores que indican cultivos sanos, maduros y maduros."
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
    thresholds_labels: ["estres", "normal", "anegamiento"],
    colormap: "Blues",
    colormap_fn: d3.interpolateBlues,
    descripcion: "El Índice de humedad de diferencia normalizada (NDMI) detecta los niveles de humedad en la vegetación mediante una combinación de bandas espectrales de infrarrojo cercano (NIR) e infrarrojo de onda corta (SWIR). El NDMI solo puede tener valores entre -1 y 1, lo que lo hace muy fácil. interpretar. El estrés hídrico estaría señalado por los valores negativos que se aproximan a -1, mientras que el +1 puede indicar anegamiento."
  },
  {
    name: "EVI",
    label: "EVI",
    value: "evi",
    domain: [-1, 1],
    thresholds: [-1, 0.2, 0.8],
    thresholds_labels: ["NO Sano", "Sano"],
    colormap: "Blues",
    colormap_fn: d3.interpolateBlues,
    descripcion: "Liu y Huete introdujeron el índice de vegetación EVI para ajustar los resultados del NDVI a los ruidos atmosféricos y del suelo, especialmente en las zonas de vegetación densa, así como para mitigar la saturación en la mayoría de los casos. El rango de valores del EVI es de -1 a +1, y para la vegetación sana, varía entre 0,2 y 0,8."
  },
  {
    name: "ARVI",
    label: "arvi",
    value: "arvi",
    domain: [-1, 1],
    thresholds: [-1, 0.2, 0.3, 1],
    thresholds_labels: ["no-vegetacion", "pradera", "denso"],
    colormap: "piyg",
    colormap_fn: d3.interpolatePiYG,
    descripcion: "Se trata del primer índice de vegetación relativamente insensible a los factores atmosféricos (por ejemplo, aerosoles). Como muestra la fórmula, Kaufman y Tanré corrigieron el NDVI para mitigar los efectos de la dispersión atmosférica duplicando las mediciones del espectro rojo y añadiendo longitudes de onda azules."
  },

  {
    name: "GCI",
    label: "GCI",
    value: "gci",
    domain: [-1, 1],
    thresholds: [-1, 0.2, 0.3, 1],
    thresholds_labels: ["no-vegetacion", "pradera", "denso"],
    colormap: "piyg",
    colormap_fn: d3.interpolatePiYG,
    descripcion: "El índice de vegetación GCI se utiliza para estimar el contenido de clorofila de las hojas en diversas especies de plantas. El contenido de clorofila refleja el estado fisiológico de la vegetación; disminuye en las plantas estresadas y, por tanto, puede utilizarse como medida de la salud de la vegetación."
  },

  {
    name: "SIPI",
    label: "SIPI",
    value: "sipi",
    domain: [-1, 1],
    thresholds: [-1, -0.5, 0.5, 1],
    thresholds_labels: ["estres", "normal", "anegamiento"],
    colormap: "inferno",
    colormap_fn: d3.interpolateInferno,
    descripcion: "El índice de vegetación SIPI es bueno para el análisis de la vegetación con una estructura del dosel variable. Estima la relación entre los carotenoides y la clorofila: un aumento del valor señala el estrés de la vegetación."
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