import React from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { useTranslation } from "react-i18next";
import { capitalizeText } from '../../../helpers/helper';
import { CultivoItem, useCrops } from '../../../hooks/useCrops';
import { Cultivo } from '../../../interfaces/insumos';


const filter = createFilterOptions<FilmOptionType>();

interface FilmOptionType {
    inputValue?: string;
    title: string;
    year?: number;
  }
  

export const AutocompleteCultivo = ({value, onChange}) => {

  const { t } = useTranslation();
  const { crops } = useCrops();



  const [_value, setValue] = React.useState< CultivoItem | null>(null);

  return (
    <Autocomplete
      value={_value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          setValue({
            title: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            title: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.label);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            title: `${t("_add")} "${inputValue}"`,
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
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.label) {
          return option.label;
        }
        // Regular option
        return option.label;
      }}
      renderOption={(props, option) => <li {...props}>{option.label}</li>}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={t("_cultivation")} />
      )}
    />
  );
}
