import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormHelperText,
  Autocomplete,
  TextField,
} from "@mui/material";

interface MultiLanguageAutocompleteProps<T> {
  options: T[];
  value?: string;
  paisValue?: { code: string; label: string } | null;
  error?: boolean;
  onChange?: (value: string) => void;
  onChangePais?: (value: { code: string; label: string } | null) => void;
  disabled?: boolean;
  getOptionLabel: (option: T, language: string) => string;
  label: string;
  name: string;
}

export const MultiLanguageAutocomplete = <T extends {}>({
  options,
  value,
  paisValue,
  error,
  onChange,
  onChangePais,
  disabled,
  getOptionLabel,
  label,
  name,
}: MultiLanguageAutocompleteProps<T>) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const sortedOptions = [...options].sort((a, b) => {
    const labelA = getOptionLabel(a, currentLanguage).toLowerCase();
    const labelB = getOptionLabel(b, currentLanguage).toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: T | null
  ) => {
    if (onChangePais) {
      onChangePais(newValue as { code: string; label: string } | null);
    } else if (onChange && newValue) {
    
      const selectedValue = (newValue as any).code || (newValue as any)._id || newValue;
      onChange(String(selectedValue));
    } else if (onChange) {
      onChange("");
    }
  };

  const findSelectedOption = () => {
    if (paisValue) {
      return options.find(option => (option as any).code === paisValue.code) || null;
    }
    return options.find(option => {
      const optionValue = (option as any).code || (option as any)._id || option;
      return String(optionValue) === String(value);
    }) || null;
  };

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <Autocomplete
        options={sortedOptions}
        value={findSelectedOption()}
        onChange={handleChange}
        getOptionLabel={(option) => getOptionLabel(option, currentLanguage)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(label)}
            error={error}
            name={name}
          />
        )}
        isOptionEqualToValue={(option, value) => {
          const optionValue = (option as any).code || (option as any)._id || option;
          const valueValue = (value as any).code || (value as any)._id || value;
          return String(optionValue) === String(valueValue);
        }}
      />
      {error && <FormHelperText>{t("this_field_is_mandatory")}</FormHelperText>}
    </FormControl>
  );
};