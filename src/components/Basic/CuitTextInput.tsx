import { TextField } from "@mui/material";
import axios from "axios";
import { exists } from "i18next";
import { useState } from "react";
import { useTranslation,getI18n } from "react-i18next";

interface CuitResponse {
  exists : boolean,
  name: string
}
const get_online_cuit = async (cuit : string)=>{
  let url = import.meta.env.VITE_COGS_SERVER_URL + "/general/cuit/" + cuit
  try{
 let data = await axios.get(url)

  return data.data as CuitResponse
  }catch(e){
    return {exists:false,name:""}
  }
 
}
export function cuilValidator(cuil: string): [boolean,string] {

  // Tiene que tener 13 chars xx-12345789-y
  if (cuil.length !== 13) {
    console.log("CUIT - Invalid Length")
    return [false, getI18n().t("Longitud Invalida")];
  }

  // Guiones en 2 y 11
  if((cuil.charAt(2) !== '-') || (cuil.charAt(11) !== '-')){
    console.log("CUIT - No Guiones")
    return [false, getI18n().t("Guiones en posicion invalida")]
  }


  const [checkDigit, ...rest] = cuil.replaceAll("-","")
    .split('')
    .map(Number)
    .reverse();

  const total = rest.reduce(
    (acc, cur, index) => acc + cur * (2 + (index % 6)),
    0,
  );

  const mod11 = 11 - (total % 11);

  console.log("CUIT - Mod11 - CHK", mod11, checkDigit, rest)

  let validCheckDigit
  if (mod11 === 11) {
    validCheckDigit = checkDigit === 0;
  }

  if (mod11 === 10) {
    validCheckDigit = false;
  }

  validCheckDigit = checkDigit === mod11;

  if(validCheckDigit){
    return [true, ""]
  }else{
    return [false, getI18n().t("Digito verificador invalido")]

  }
}


export const CuitTextInput = (props) => {



  const { t } = useTranslation();

  const [partialValue, setPartialValue] = useState(props.value)
  const [helper_text, setHelperText] = useState("");

  const isValid = (value : string) => {


    // if(value.length === 3 && !value.includes("-")){
    //     value =  value.slice(0,1) + "-" +value.slice(1,2)
    // }
    // console.count("cambio")

    setPartialValue(value)


    // Si el pais no es ARG no validamos na'
    // if(props.country === 'ar'){
    //   return true
    // }

    let [valido, msg] = cuilValidator(value)
    if(!valido){
      console.log("El CUIT es invalido")
      setHelperText(msg)
      props.onValidCheck && props.onValidCheck(false)
    }else{
      //Valido -> Check contra api
      setHelperText(t(""))
      get_online_cuit(value).then((data)=>{
        console.log("CUIT - Online data",data)
        if(data.exists){
          props.onValidCheck && props.onValidCheck(true)

          props.onOnlineValidation && props.onOnlineValidation(data.name)
        }
      })

    }



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
          console.log("ssssssa", e.target.value);

          props.onChange(e);
        }
      }}
      label={props.label || t("_cuit")}
      type="text"
      helperText={t(helper_text)}
      variant="standard"
    />
  );
};
