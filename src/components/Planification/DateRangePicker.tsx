import * as React from "react";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { es } from "date-fns/locale";
import { isWithinInterval } from "date-fns";
import { useTranslation } from "react-i18next";

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  invalidRanges,
}: {
  invalidRanges: Date[][];
}) {
  const { t } = useTranslation()
  // State variables for the start and end dates
  const [_startDate, setStartDate] = React.useState(startDate); //new Date());
  const [_endDate, setEndDate] = React.useState(endDate); //new Date());

  const isValidDate = React.useCallback(
    (date: Date) => {
      if (!date || isNaN(date.getTime())) return false;

      let isIncludedInARange = invalidRanges.some((r) =>
        isWithinInterval(date, {
          start: r[0],
          end: r[1],
        })
      );

      return isIncludedInARange


    },
    [invalidRanges]
  );

  React.useEffect(() => {
    if (_startDate && _endDate) {
      onRangeChange(_startDate, _endDate);
    }
  }, [_startDate, _endDate]);

  // Return two date picker components with the minDate and onChange props
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <DatePicker
        sx={{ marginRight: "10px" }}
        label={t("start_date")}
        value={_startDate}
        maxDate={_endDate}
        shouldDisableDate={isValidDate}
        onChange={(date) => setStartDate(date)}
        renderInput={(params) => <TextField {...params} />}
        inputFormat="dd/MM/yyyy"
      />
      <DatePicker
        label={t("end_date")}
        value={_endDate}
        minDate={_startDate} // Set the minDate to the start date
        onChange={(date) => setEndDate(date)}
        shouldDisableDate={isValidDate}
        renderInput={(params) => <TextField {...params} />}
        inputFormat="dd/MM/yyyy"
      />
    </LocalizationProvider>
  );
}
