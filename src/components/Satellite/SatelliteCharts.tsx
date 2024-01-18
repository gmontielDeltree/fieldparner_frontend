import React from "react";
import { SatelliteGaugeCharts } from "./SatelliteGaugeChart";
import { Button, Typography } from "@mui/material";
import { SatelliteCircleChart } from "./SatelliteCircleChart";

export const SatelliteCharts: React.FC = (props) => {
  let count = props.data.stats.valid_pixels;
  let ratios = props.data.stats.histogram[0].map((v, i) => (v / count) * 100);

  // palette #1 Apex https://apexcharts.com/docs/options/theme/
  let palette = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"];

  return (
    <div>
      <Typography
        variant="h6"
        style={{ color: "white", padding: "10px", textAlign: "center" }}
        component="div"
      >
        {props.indice.name} {props.date}
      </Typography>

      {ratios.map((v, i) => {
        let title = props.indice.thresholds_labels[i];
        let ratio = v;
        let area = props.hectareas_del_lote;
        return (
          <SatelliteGaugeCharts
            ratio={ratio}
            color={palette[i]}
            title={title}
            area_has={area}
          ></SatelliteGaugeCharts>
        );
      })}
      {
        <SatelliteCircleChart
          ratios={ratios}
          labels={props.indice.thresholds_labels}
        ></SatelliteCircleChart>
      }
    </div>
  );
};
