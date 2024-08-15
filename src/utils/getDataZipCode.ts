import { dbContext } from "../services";
import { CountryCode } from "../types";

export const getLocalityAndStateByZipCode = async (country: string, zipCode: string) => {
    try {
      let result;
      switch (country) {
        case CountryCode.ARGENTINA:
          result = await dbContext.zipCodeARG.find({
            selector: { "CP": zipCode },
          });
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