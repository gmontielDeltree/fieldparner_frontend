import { TextField } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const CuitTextInput = (props) => {
  const { t } = useTranslation();

  const [partialValue, setPartialValue] = useState(props.value)
  let helper_text = "";

  const isValid = (value : string) => {

    if(value.length === 3 && !value.includes("-")){
        value =  value.slice(0,1) + "-" +value.slice(1,2)
    }
    console.count("cambio")

    setPartialValue(value)
    



    return true;
  };

  return (
    <TextField
      autoFocus
      margin="dense"
      id="name"
      value={partialValue}
      onChange={(e) => {
        console.log("ssssss", e);
        if (isValid(e.target.value)) {
          props.onChange(e);
        }
      }}
      label={t("_cuit")}
      type="text"
      helperText={t(helper_text)}
      variant="standard"
    />
  );
};
