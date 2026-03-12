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
import { CultivoItem, useCrops } from "../../../hooks/useCrops";
import { Cultivo } from "../../../interfaces/insumos";
import {  CropsRepository } from "../../../classes/Crops";
import { Crop } from "../../../types";
import i18next from "i18next";

let labelInLang = (c : Crop, lang : string)=>{
  if(lang === "es"){
    return c.descriptionES
  } else if(lang === "en"){
    return c.descriptionEN
  } else if(lang === "pt"){
    return c.descriptionPT
  }else{
    return c.descriptionES
  }
}
const filter = createFilterOptions<Crop>({stringify:(option)=>{
  let lang = i18next.language;
        let label = labelInLang(option,lang);
        return label
}});

// interface CropOptionType extends Crops {
//   inputValue?: string;
//   label: string;
//   color?: number;
// }

export const AutocompleteCultivo = ({ value, onChange }) => {
  const { t, i18n } = useTranslation();
  const [crops, setCrops] = useState<Crop[]>([]);

  const [cropsRepo, _] = useState(new CropsRepository());

  useEffect(() => {
    cropsRepo.getAll().then((cropsFromDB) => {
      console.log("CORPS",cropsFromDB)
      setCrops(cropsFromDB);
    });

    // cropsRepo.attachObserver((cropsFromDB) => {
    //   console.log("Settin Crops Again");
    //   setCrops(cropsFromDB);
    // });
  }, []);

  const [_value, setValue] = React.useState<Crop | null>(
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
          if(newValue){
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
      options={crops}
      isOptionEqualToValue={(option,value)=>option._id ===value._id}
      getOptionLabel={(option) => {
        const lang = i18n.language;
        return labelInLang(option, lang);
      }}
      // renderOption={(props, option) => {
      //   let lang = i18n.language;
      //   let label = labelInLang(option,lang);
      //   return <li {...props}>{label}</li>;
      // }}
      sx={{ width: 300 }}
      // freeSolo
      renderInput={(params) => <TextField {...params} label={t("Crop")} />}
    />
  );
};
