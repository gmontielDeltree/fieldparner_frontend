import { Country } from "../interfaces/country";

export const getCountryOptions = (countries: Country[]) => {
  return countries.map((country) => ({
    code: country.code,
    descriptionES: country.descriptionES,
    descriptionEN: country.descriptionEN,
    descriptionPT: country.descriptionPT,
  }));
};
