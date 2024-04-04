import * as React from 'react';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';

export default function DateRangePicker({startDate, endDate, onRangeChange}) {
  // State variables for the start and end dates
  const [_startDate, setStartDate] = React.useState(startDate)//new Date());
  const [_endDate, setEndDate] = React.useState(endDate)//new Date());

  React.useEffect(()=>{

    if(_startDate && _endDate){
     onRangeChange(_startDate,_endDate)
    }
  },[_startDate,_endDate])

  // Return two date picker components with the minDate and onChange props
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <DatePicker
        sx={{marginRight:"10px"}}
        label="Start Date"
        value={_startDate}
        maxDate={_endDate}
        onChange={(date) => setStartDate(date)}
        renderInput={(params) => <TextField {...params} />}
        inputFormat="dd/MM/yyyy"
      />
      <DatePicker
        label="End Date"
        value={_endDate}
        minDate={_startDate} // Set the minDate to the start date
        onChange={(date) => setEndDate(date)}
        renderInput={(params) => <TextField {...params} />}
        inputFormat="dd/MM/yyyy"
      />
    </LocalizationProvider>
  );
}