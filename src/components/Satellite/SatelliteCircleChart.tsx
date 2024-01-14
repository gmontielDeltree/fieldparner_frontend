import React from "react";
import ReactApexChart from "react-apexcharts";
export const SatelliteCircleChart: React.FC = ({ratios, indice, labels}) => {
  let state = {
    series: ratios,
    options: {
      chart: {
        type: "donut",
      },
      labels: labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },

            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  return (
    <ReactApexChart
      options={state.options}
      series={state.series}
      type="donut"
    />
  );
};
