import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { isEqual, isSameDay, parse } from "date-fns";
import React from "react";


const datesFromFeatures = (featureCol) => {
  let dates = featureCol.features.map((f) =>
    parse(f.properties.datetime,
      "yyyy-MM-dd'T'HH:mm:ss'Z'", new Date())
  );
  return dates;
};

const isInvalid = (datea: Date, validDates: Date[]) => {
  let valid = validDates.find((d) => isSameDay(d, datea));
  return valid === undefined ? true : false;
};

export const SatelliteDatePicker: React.FC = ({value, onChange, features}) => {
  let validDates = datesFromFeatures(features)

  return (
    <React.Fragment>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Fecha"
          
          value={value}
          onChange={onChange}
          shouldDisableDate={(e) =>
            isInvalid(e, validDates )
          }
          disableFuture
          sx={{
            color: 'primary.contrastText',
            '& .MuiOutlinedInput-notchedOutline' : {
              borderColor: "white",
              color: "white"
            },
            '& .MuiInputBase-input' : {
              color:"white"
            },
            '& .MuiSvgIcon-root':{
              color:"white"
            },
            '& .MuiFormLabel-root':{
              color:"white"
            }

          }}
        />
      </LocalizationProvider>
    </React.Fragment>
  );
};
