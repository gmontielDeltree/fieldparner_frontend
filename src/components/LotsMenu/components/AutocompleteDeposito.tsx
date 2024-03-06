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
import { Crop, CropsRepository } from "../../../classes/Crops";
import { WarehouseRepository } from "../../../classes/WarehouseRepository";
import { Deposit } from "@types";

const filter = createFilterOptions<CropOptionType>();

interface CropOptionType extends Deposit {
  inputValue?: string;
}

export const AutocompleteDeposito = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [crops, setCrops] = useState<any[]>([]);

  const [cropsRepo, _] = useState(new WarehouseRepository());

  useEffect(() => {
    cropsRepo.getAll().then((cropsFromDB) => {
      setCrops(cropsFromDB);
    });

    cropsRepo.attachObserver((cropsFromDB) => {
      // console.log("Settin Crops Again");
      setCrops(cropsFromDB);
    });
  }, []);

  const [_value, setValue] = React.useState<CropOptionType | null>(value || null);

  useEffect(()=>{
    // console.log("_value",_value)
    onChange(_value)
  },[_value])

  return (
    <Autocomplete
      value={_value}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          setValue({
            description: `${newValue}`,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          cropsRepo
            .add({ description: newValue.inputValue })
            .then((c) => setValue(c));
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option.description
        );
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            description: `${t("_add")} "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={crops}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.description) {
          return option.description;
        }
        // Regular option
        return option.description;
      }}
      renderOption={(props, option) => <li {...props}>{option.description}</li>}
     
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={t("_warehouse")} />
      )}
    />
  );
};
