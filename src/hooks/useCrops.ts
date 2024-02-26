import { useState } from "react";

export interface CultivoItem {
  label: string,
  cultivoId: number,
  color: string,
}

const tablaCultivos : CultivoItem[] = [
  { label: "Soja", cultivoId: 1994, color: "#3E9913" },
  { label: "Trigo", cultivoId: 1972, color: "#facc15" },
  { label: "Maíz", cultivoId: 1974, color: "#ff9f38" }
];

export const useCrops = () => {
  const [crops, setCrops] = useState(tablaCultivos);

  const getCropLabelFromId = (id : number) => {
    let c = crops.find((a) => a.cultivoId === id);
    if (c) {
      return c.label;
    }
  };

  const getCropColorFromId = (id: number) => {
    let c = crops.find((a) => a.cultivoId === id);
    if (c) {
      return c.color;
    }
  };

  return { crops, getCropLabelFromId, getCropColorFromId };
};
