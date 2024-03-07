import { useState } from "react";

export interface CultivoItem {
  label: string,
  _id: number,
  color: string,
}

const tablaCultivos : CultivoItem[] = [
  { label: "Soja", _id: 1994, color: "#3E9913" },
  { label: "Trigo", _id: 1972, color: "#facc15" },
  { label: "Maíz", _id: 1974, color: "#ff9f38" }
];

export const useCrops = () => {
  const [crops, setCrops] = useState(tablaCultivos);

  const getCropLabelFromId = (id : number) => {
    let c = crops.find((a) => a._id === id);
    if (c) {
      return c.label;
    }
  };

  const getCropColorFromId = (id: number) => {
    let c = crops.find((a) => a._id === id);
    if (c) {
      return c.color;
    }
  };

  return { crops, getCropLabelFromId, getCropColorFromId };
};
