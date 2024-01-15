import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { format } from "date-fns";
import { r2 } from "../../../owncomponents/helpers";

function generateArray(range, n) {
  // range is an array of two numbers representing the lower and upper limits of the range
  // n is an integer number representing the length of the output array
  // check if the input is valid
  if (
    !Array.isArray(range) ||
    range.length !== 2 ||
    !Number.isInteger(n) ||
    n < 1
  ) {
    return null;
  }
  // get the min and max values from the range array
  let min = Math.min(range[0], range[1]);
  let max = Math.max(range[0], range[1]);
  // calculate the step size to get n numbers within the range
  let step = (max - min) / (n - 1);
  // use Array.from() with a map function to generate the output array
  let output = Array.from({ length: n }, (value, index) => min + index * step);
  return output;
}

const ranges_to_bin_names = (ranges: number[]) => {
  let a = ranges.slice(0, -1);
  let b = ranges.slice(1);

  let bin_names = a.map((v, i) => "" + r2(v) + "..." + r2(b[i]));
  return bin_names;
};

export const SatelliteResumen: React.FC = ({ date, lote, indice }) => {
  const [meteo, setMeteo] = useState({
    temperature: NaN,
    temperature_min: NaN,
    precipitation_sum: NaN,
  });
  const [response, setResponse] = useState();

  useEffect(() => {
    let dateStr = format(date, "yyyy-MM-dd");
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lote.geometry.coordinates[0][0][1]}&longitude=${lote.geometry.coordinates[0][0][0]}&start_date=${dateStr}&end_date=${dateStr}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FNew_York`;
    axios(url).then((response) => {
      const data = response.data;
      let temperature = data.daily.temperature_2m_max[0];
      let temperature_min = data.daily.temperature_2m_min[0];
      let precipitation_sum = data.daily.precipitation_sum[0];

      setMeteo({ temperature, temperature_min, precipitation_sum });
    });
  }, [date]);

  useEffect(() => {
    let resourceId = lote.id;
    let dateStr = format(date, "yyyy-MM-dd");
    let histogramOptions = {
      bins: generateArray(indice.domain, 10),
    };

    let body = {
      resourceId,
      date: dateStr,
      histogramOptions,
      lote: lote,
      indice,
    };
    let baseURL = import.meta.env.VITE_COGS_SERVER_URL + "/indices/request";
    axios.post(baseURL, body).then((response) => {
      console.log(response.data);
      setResponse(response.data);
    });
  }, [date]);

  return (
    <Paper sx={{ backgroundColor: "#2f5ad5" }}>
      <Accordion sx={{ backgroundColor: "#1976d299", color: "white" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Resumen
        </AccordionSummary>
        <AccordionDetails>
            
          {response && response.stats.histogram[0]
            .map((r, i) => {
              console.log("punto", r);
              let color = "blue";
              let area_has =
                ((r / response.stats.valid_pixels) *
                  response.area_mts_squared) /
                10000;

              return (
                <div style={{display:"flex",justifyContent: "space-between", alignItems:"center"}}>
                  <div style={{display:"flex", alignItems:"center"}}>
                    <div style={{backgroundColor:color,width:"24px",height:"24px"}}></div>
                    <div style={{marginLeft:"1rem"}}>
                      {ranges_to_bin_names(response.stats.histogram[1])[i]}
                    </div>
                  </div>
                  <div style={{marginLeft:"1rem",fontWeight:"bold"}}>
                    {r2(area_has)} has.
                  </div>
                </div>
              );
            })}
        </AccordionDetails>
      </Accordion>
      <Accordion
        defaultExpanded
        sx={{ backgroundColor: "#1976d299", color: "white" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Clima del Dia
        </AccordionSummary>
        <AccordionDetails>
          {meteo.temperature ? (
            <>
              <Typography variant="body2">
                Temp min: {meteo.temperature}°C
              </Typography>
              <Typography variant="body2">
                Temp max: {meteo.temperature_min}°C
              </Typography>
              <Typography variant="body2">
                Precipitación: {meteo.precipitation_sum}mm
              </Typography>
            </>
          ) : (
            <p>Sin datos disponibles para esta fecha</p>
          )}

          <Typography variant="caption">Powered by OpenMeteo</Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
