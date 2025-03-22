import { dbContext } from "../services";
import { CountryCode } from "../types";

//TODO: Agregar codigo postal de Brasil,Chile,Paraguay 

export const getLocalityAndStateByZipCode = async (country: string, zipCode: string) => {
    try {
      let result;
      console.log("Consultando base de datos para:", country, "con código postal:", zipCode);
      switch (country) {
        case CountryCode.ARGENTINA:
          result = await dbContext.zipCodeARG.find({
            selector: { "CP": zipCode },
            
          });
          console.log("Resultado para Argentina:", result.docs);
          return result.docs;
        case CountryCode.PARAGUAY:
          result = await dbContext.zipCodePRY.find({
            selector: { "CP": zipCode },
          });
          return result.docs;
        default:
          return [];
      }

    } catch (error) {
      console.log(error);
      return [];
    }
  }