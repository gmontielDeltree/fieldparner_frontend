import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

export const SatelliteGaugeCharts: React.FC = ({ratio, color, title, area_has}) => {

  let state = {
    series: [ratio],
    options: {
      chart: {
        type: "radialBar",
        offsetY: -20,
        sparkline: {
          enabled: true,
        },
      },
      colors:[color],
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5, // margin is in pixels
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              color: "#999",
              opacity: 1,
              blur: 2,
            },
          },

          dataLabels: {
            name: {
              show: true,
              fontSize: "12px",
              offsetY: +0,
            },
            value: {
              offsetY: -40,
              formatter: function (w) {
                // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                return "" + (w/100 * area_has).toFixed(1)  + " has"
              },
              fontSize: "16px",
            },
          },
        },
      },
      grid: {
        padding: {
          top: -10,
          left: -10, right: -10,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91],
        },
      },
      labels: [title],
    },
  };

  return (
    <>
      <div>
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="radialBar"
        />
      </div>
    </>
  );
};
