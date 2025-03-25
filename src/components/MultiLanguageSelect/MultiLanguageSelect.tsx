import { useTranslation } from "react-i18next";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";

interface MultiLanguageSelectProps<T> {
  options: T[];
  value?: string | undefined;
  paisValue?: { code: string; label: string } | null;
  error?: boolean;
  onChange?: (event: SelectChangeEvent<string>) => void; 
  onChangePais?: (value: { code: string; label: string } | null) => void; 
  disabled?: boolean;
  getOptionLabel: (option: T, language: string) => string;
  label: string;
  name: string;
}

export const MultiLanguageSelect = <T,>({
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
}: MultiLanguageSelectProps<T>) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (onChangePais) {
      const selectedCode = event.target.value;
      const selectedOption = options.find((option) => (option as any).code === selectedCode) || null;
      onChangePais(selectedOption as { code: string; label: string } | null);
    } else if (onChange) {
      onChange(event);
    }
  };

  
  const selectValue = paisValue ? paisValue.code : value || "";

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <InputLabel id={`${name}-select-label`}>{t(label)}</InputLabel>
      <Select
        labelId={`${name}-select-label`}
        name={name}
        value={selectValue}
        onChange={handleChange}
      >
        {options.map((option, index) => {
          const optionValue = (option as any).code || (option as any)._id || option;

          return (
            <MenuItem key={index} value={optionValue}>
              {getOptionLabel(option, currentLanguage)}
            </MenuItem>
          );
        })}
      </Select>
      {error && <FormHelperText>{t("this_field_is_mandatory")}</FormHelperText>}
    </FormControl>
  );
};