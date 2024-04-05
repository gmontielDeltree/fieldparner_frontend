import { useState } from "react";
import { dbContext } from "../services";
import Swal from "sweetalert2";
import { Crops } from "../types";

export interface CultivoItem {
  label: string,
  _id: number,
  color: string,
}

const tablaCultivos: CultivoItem[] = [
  { label: "Soja", _id: 1994, color: "#3E9913" },
  { label: "Trigo", _id: 1972, color: "#facc15" },
  { label: "Maíz", _id: 1974, color: "#ff9f38" }
];

export const useCrops = () => {
  const [crops, setCrops] = useState(tablaCultivos);
  const [dataCrops, setDataCrops] = useState<Crops[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const getCropLabelFromId = (id: number) => {
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


  const getCrops = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.crops.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: Crops[] = response.rows.map(row => row.doc as Crops);
        setDataCrops(documents);
      }
      else
        setCrops([]);

    } catch (error) {
      console.log(error)
      Swal.fire('Error', 'Error al obtener los cultivos: ' + error, 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  }


  return {
    crops,
    dataCrops,
    isLoading,
    error,
    getCrops,
    getCropLabelFromId,
    getCropColorFromId
  };
};
