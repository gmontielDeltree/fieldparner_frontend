import { useState } from "react";
import { dbContext } from "../services";
import Swal from "sweetalert2";
import { Crops } from "../types";
import { useTranslation } from "react-i18next";


export interface CultivoItem extends Crops {
color?:string;
}

export const useCrops = () => {
  const [crops, setCrops] = useState<CultivoItem []>([]);
  const [dataCrops, setDataCrops] = useState<Crops[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const { i18n } = useTranslation();

  const getCropLabelFromId = (id: string) => {
    let c = crops.find((a) => a._id === id);
    console.log("LENGUAJE", i18n.language)

    if (c) {
      if(i18n.language === "es"){
        return c.descriptionES
      } else if(i18n.language === "en"){
        return c.descriptionEN
      } else if(i18n.language === "pt"){
        return c.descriptionPT
      }else{
        return c.descriptionES
      }
    }else{
      
      console.log("NO ENCUENTRO EL CULTIVO", id)
      return "unknown"
    }
  };

  const getCropColorFromId = (id: string) => {
    let c = crops.find((a) => a._id === id);
    if (c) {
      return c.color || "grey";
    }else{
      return "red"
    }
  };


  const getCrops = async () => {
    console.count("getCrops")
    setIsLoading(true);
    try {
      const response = await dbContext.crops.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: Crops[] = response.rows.map(row => row.doc as Crops);
        setDataCrops(documents);
        setCrops(documents);
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
