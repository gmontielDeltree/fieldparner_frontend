import { InputAdornment, TextField } from "@mui/material";
import React from "react";

export interface SearchInputProps {
  value: string;
  placeholder: string;
  handleInputChange: ({ target }: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder,
  handleInputChange,
}) => {
  return (
    <TextField
      variant="outlined"
      type="text"
      size="small"
      placeholder={placeholder}
      autoComplete="off"
      name="filterText"
      value={value}
      onChange={handleInputChange}
      InputProps={{
        startAdornment: <InputAdornment position="start" />,
      }}
      fullWidth
    />
  );
};
