import { useState } from "react";
import { dbContext } from "../services";
import Swal from "sweetalert2";
import { Crops } from "../types";
import { useTranslation } from "react-i18next";

String.prototype.toColor = function() {
	var colors = ["#e51c23", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#5677fc", "#03a9f4", "#00bcd4", "#009688", "#259b24", "#8bc34a", "#afb42b", "#ff9800", "#ff5722", "#795548", "#607d8b"]
	
    var hash = 0;
	if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    hash = ((hash % colors.length) + colors.length) % colors.length;
    return colors[hash];
}

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
      return c.descriptionEN.toColor() || "grey";
    }else{
      return "red"
    }
  };


  const getCrops = async () => {
    console.count("getCrops")
    setIsLoading(true);
    try {
      const response = await dbContext.Crops.allDocs({ include_docs: true });

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
