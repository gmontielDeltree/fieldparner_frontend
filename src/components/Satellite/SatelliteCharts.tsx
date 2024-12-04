import React from 'react'
import { SatelliteGaugeCharts } from './SatelliteGaugeChart'
import { Typography } from '@mui/material'
import { SatelliteCircleChart } from './SatelliteCircleChart'

export const SatelliteCharts: React.FC = (props) => {
  const count = props.data.stats.valid_pixels
  const ratios = props.data.stats.histogram[0].map((v, i) => (v / count) * 100)

  const palette = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0']

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Typography
        variant="h6"
        style={{ color: 'white', padding: '10px', textAlign: 'center' }}
        component="div"
      >
        {props.indice.name} {props.date}
      </Typography>

      {ratios.map((v, i) => {
        const title = props.indice.thresholds_labels[i]
        const ratio = v
        const area = props.hectareas_del_lote
        return (
          <SatelliteGaugeCharts
            key={i}
            ratio={ratio}
            color={palette[i]}
            title={title}
            area_has={area}
          />
        )
      })}

      <SatelliteCircleChart
        ratios={ratios}
        labels={props.indice.thresholds_labels}
        dualMode={props.dualMode}
      />
    </div>
  )
}
