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

function abrUnit(unit : string){
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
  fullWidth
}: {
  value: number;
  onChange: (e) => void;
  label: string;
  unit: string;
  fullWidth?: boolean,
  size?:string
}) => {
  return (
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        id="outlined-start-adornment"
        
        InputProps={{
          inputProps: {
            style: { textAlign: "right" },
        },
          endAdornment: <InputAdornment title={unit} position="end">{abrUnit(unit)}</InputAdornment>,
        }}
      />
  );
};
