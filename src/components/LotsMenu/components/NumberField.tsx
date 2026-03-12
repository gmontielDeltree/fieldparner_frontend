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
import { UNIT } from "@deck.gl/core/typed";

// Utility function to validate numeric input
const handleNumericInput = (event, allowNegative = false, allowDecimals = true) => {
  const { value } = event.target;
  
  // Allow empty string
  if (value === '') return value;
  
  // For decimal numbers, allow comma as decimal separator and convert to dot
  let normalizedValue = value.replace(',', '.');
  
  // Create regex pattern based on options
  let pattern;
  if (allowNegative && allowDecimals) {
    pattern = /^-?\d*\.?\d*$/; // Allow negative and decimals
  } else if (allowNegative && !allowDecimals) {
    pattern = /^-?\d*$/; // Allow negative but no decimals
  } else if (!allowNegative && allowDecimals) {
    pattern = /^\d*\.?\d*$/; // No negative but allow decimals
  } else {
    pattern = /^\d*$/; // No negative and no decimals
  }
  
  // Test if the normalized value matches the pattern
  if (pattern.test(normalizedValue)) {
    return normalizedValue;
  }
  
  // If invalid, return the previous valid value
  return event.target.defaultValue || '';
};

// Enhanced change handler that filters invalid input
const createNumericChangeHandler = (originalOnChange, allowNegative = false, allowDecimals = true) => {
  return (event) => {
    const filteredValue = handleNumericInput(event, allowNegative, allowDecimals);
    
    // Create new event with filtered value
    const filteredEvent = {
      ...event,
      target: {
        ...event.target,
        value: filteredValue
      }
    };
    
    originalOnChange(filteredEvent);
  };
};

function abrUnit(unit : string){
  if(!unit) return "unit"
  let splited = unit.split('/')
  if(splited.length > 0){
    let ns = splited.map((u)=> (u.length>7) ? u.slice(0,7) + ".." : u)
    return ns.join('/')
  }else {
    let ns = (unit.length>6) ? unit.slice(6) + ".." : unit;
    return ns;
  }
}

export const NumberFieldWithUnits = ({
  value,
  onChange,
  label,
  unit,
  fullWidth,
  allowNegative = false,
  allowDecimals = true,
  ...otherProps
}: {
  value: number | string;
  onChange: (e) => void;
  label: string;
  unit: string;
  fullWidth?: boolean;
  size?: string;
  allowNegative?: boolean;
  allowDecimals?: boolean;
  [key: string]: any;
}) => {
  // For context-based negative validation
  const shouldAllowNegative = allowNegative || 
    (typeof allowNegative === 'undefined' && 
     (unit?.includes('temp') || label?.toLowerCase().includes('temp') || 
      unit?.includes('°C') || unit?.includes('°F')));

  const enhancedOnChange = createNumericChangeHandler(onChange, shouldAllowNegative, allowDecimals);

  return (
      <TextField
        {...otherProps}
        fullWidth={fullWidth}
        label={label}
        value={value}
        onChange={enhancedOnChange}
        id="outlined-start-adornment"
        type="text"
        inputMode="decimal"
        InputProps={{
          inputProps: {
            style: { textAlign: "right" },
            pattern: shouldAllowNegative 
              ? (allowDecimals ? "-?[0-9]*[.,]?[0-9]*" : "-?[0-9]*")
              : (allowDecimals ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"),
            step: allowDecimals ? "any" : "1",
        },
          endAdornment: <InputAdornment title={unit} position="end">{abrUnit(unit)}</InputAdornment>,
        }}
      />
  );
};
