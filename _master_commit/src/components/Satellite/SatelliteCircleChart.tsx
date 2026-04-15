import React from 'react'
import ReactApexChart from 'react-apexcharts'

export const SatelliteCircleChart: React.FC = ({
  ratios,
  labels,
  dualMode,
}) => {
  const state = {
    series: ratios,
    options: {
      chart: {
        type: 'donut',
        width: '100%',
        height: '100%',
      },
      labels: labels,
      legend: {
        position: 'bottom',
      },
      grid: {
        padding: {
          left: -20,
          right: -10,
        },
      },
      // Elimina o ajusta la sección 'responsive'
      // responsive: [
      //   {
      //     breakpoint: 480,
      //     options: {
      //       chart: {
      //         width: 200,
      //       },
      //       legend: {
      //         position: 'bottom',
      //       },
      //     },
      //   },
      // ],
    },
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: '250px',
        minHeight: '250px',
      }}
    >
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="donut"
        width="100%"
        height="100%"
      />
    </div>
  )
}
