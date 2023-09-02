export interface IndiceEspectral {
  name: string;
  value: string;
  label: string;
  thresholds: number[];
  thresholds_labels: string[];
  colormap: string;
  domain: number[];
}

export const list_of_indexes: IndiceEspectral[] = [
  {
    name: "NDVI",
    label: "NDVI",
    value: "ndvi",
    domain: [-1, 1],
    thresholds: [0, 0.5, 0.7, 1],
    thresholds_labels: ["arido", "ok", "okaise"],
    colormap: "viridis",
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
