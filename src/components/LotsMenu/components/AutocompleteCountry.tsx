import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { capitalizeText } from "../../../helpers/helper";
import { CountryItem, useCountry } from "../../../hooks/useCountry";
import { Cultivo } from "../../../interfaces/insumos";
import { CountryRepository } from "../../../classes/Country";
//import { Country } from "@types";
import i18next from "i18next";
import { Country } from "../../../interfaces/country";

let labelInLang = (c: Country, lang: string) => {
  if (lang === "es") {
    return c.descriptionES
  } else if (lang === "en") {
    return c.descriptionEN
  } else if (lang === "pt") {
    return c.descriptionPT
  } else {
    return c.descriptionES
  }
}
const filter = createFilterOptions<Country>({
  stringify: (option) => {
    let lang = i18next.language;
    let label = labelInLang(option, lang);
    return label
  }
});

// interface CropOptionType extends Crops {
//   inputValue?: string;
//   label: string;
//   color?: number;
// }

export const AutocompleteCountry = ({ value, onChange }) => {
  const { t, i18n } = useTranslation();
  const [country, setCountry] = useState<Country[]>([]);

  const [countryRepo, _] = useState(new CountryRepository());

  useEffect(() => {
    countryRepo.getAll().then((countryFromDB) => {
      console.log("CORPS", countryFromDB)
      setCountry(countryFromDB);
    });

    // cropsRepo.attachObserver((cropsFromDB) => {
    //   console.log("Settin Crops Again");
    //   setCrops(cropsFromDB);
    // });
  }, []);

  const [_value, setValue] = React.useState<Country | null>(
    value || null
  );

  useEffect(() => {
    // console.log("_value",_value)
    onChange(_value);
  }, [_value]);


  return (
    <Autocomplete
      value={_value}
      onChange={(event, newValue) => {
        // if (typeof newValue === "string") {
        //   // setValue({
        //   //   label: `${newValue}`,
        //   // });
        // } else if (newValue && newValue.inputValue) {
        //   // Create a new value from the user input

        //   // NOTA: NO QUIEREN QUE SE PUEDAN AGREGAR CULTIVOS
        //   // cropsRepo
        //   //   .add({ label: newValue.inputValue })
        //   //   .then((c) => setValue(c));
        // } else {
        if (newValue) {
          setValue(newValue);

        }
        // }
      }}
      // filterOptions={(options, params) => {
      //    const filtered = filter(options, params);

      // //   const { inputValue } = params;
      // //   // Suggest the creation of a new value
      // //   const isExisting = options.some(
      // //     (option) => inputValue === option.label
      // //   );
      // //   if (inputValue !== "" && !isExisting) {
      // //     filtered.push({
      // //       inputValue,
      // //       label: `${t("_add")} "${inputValue}"`,
      // //     });
      // //   }

      //    return filtered;
      //  }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={country}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) => {
        // let opt = country.find(c => c.code === option.code)
        // if ( !opt) return "";
        let lang = i18n.language;
        let label = labelInLang(option, lang);
        return option.descriptionES;

      }}
      // renderOption={(props, option) => {
      //   let lang = i18n.language;
      //   let label = labelInLang(option,lang);
      //   return <li {...props}>{label}</li>;
      // }}
      sx={{ width: 300 }}
      // freeSolo
      renderInput={(params) => <TextField {...params} label={t("id_country")} />}
    />
  );
};
