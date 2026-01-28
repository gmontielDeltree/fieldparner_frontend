import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { Deposit } from "@types";
import { useDeposit } from "../../../hooks";

const filter = createFilterOptions<DepositOptionType>();

interface DepositOptionType extends Partial<Deposit> {
  inputValue?: string;
}

interface AutocompleteDepositoProps {
  value: Deposit | null;
  onChange: (deposit: Deposit | null) => void;
}

export const AutocompleteDeposito: React.FC<AutocompleteDepositoProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { deposits, getDeposits, isLoading } = useDeposit();

  const [_value, setValue] = useState<DepositOptionType | null>(value || null);

  useEffect(() => {
    getDeposits();
  }, []);

  // Sync internal state when parent value changes
  useEffect(() => {
    setValue(value || null);
  }, [value]);

  useEffect(() => {
    onChange(_value as Deposit | null);
  }, [_value]);

  return (
    <Autocomplete
      value={_value}
      loading={isLoading}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          setValue({
            description: `${newValue}`,
          });
        } else if (newValue && newValue.inputValue) {
          // For now, just set the description - creating new deposits should be done elsewhere
          setValue({
            description: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="autocomplete-deposito"
      options={deposits}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.description) {
          return option.description;
        }
        return "";
      }}
      renderOption={(props, option) => (
        <li {...props} key={option._id || option.inputValue || option.description}>
          {option.description}
        </li>
      )}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option._id === value._id || option.description === value.description;
      }}
      renderInput={(params) => (
        <TextField {...params} label={t("_warehouse")} />
      )}
    />
  );
};
