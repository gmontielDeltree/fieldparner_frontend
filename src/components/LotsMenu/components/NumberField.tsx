import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import FilledInput from "@mui/material/FilledInput";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const NumberFieldWithUnits = ({
  value,
  onChange,
  label,
  unit,
}: {
  value: number;
  onChange: (e) => void;
  label: string;
  unit: string;
}) => {
  return (
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        id="outlined-start-adornment"
        
        InputProps={{
          inputProps: {
            style: { textAlign: "right" },
        },
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
      />
  );
};
