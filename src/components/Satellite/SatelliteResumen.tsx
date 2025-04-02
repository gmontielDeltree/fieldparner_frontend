import React, { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Typography,
  Button,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import axios from 'axios'
import { format } from 'date-fns'
import { r2 } from '../../../owncomponents/helpers'
import { useTranslation } from 'react-i18next'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip)

function generateArray(range, n) {
  if (
    !Array.isArray(range) ||
    range.length !== 2 ||
    !Number.isInteger(n) ||
    n < 1
  ) {
    return null
  }
  let min = Math.min(range[0], range[1])
  let max = Math.max(range[0], range[1])
  let step = (max - min) / (n - 1)
  let output = Array.from({ length: n }, (value, index) => min + index * step)
  return output
}

const ranges_to_bin_names = (ranges) => {
  let a = ranges.slice(0, -1)
  let b = ranges.slice(1)

  let bin_names = a.map((v, i) => '' + r2(v) + '...' + r2(b[i]))
  return bin_names
}

export const SatelliteResumen = ({ date, lote, indice }) => {
  const { t } = useTranslation()
  const [meteo, setMeteo] = useState({
    temperature: NaN,
    temperature_min: NaN,
    precipitation_sum: NaN,
  })
  const [response, setResponse] = useState()
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    let dateStr = format(date, 'yyyy-MM-dd')
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lote.geometry.coordinates[0][0][1]}&longitude=${lote.geometry.coordinates[0][0][0]}&start_date=${dateStr}&end_date=${dateStr}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FNew_York`
    axios(url).then((response) => {
      const data = response.data
      let temperature = data.daily.temperature_2m_max[0]
      let temperature_min = data.daily.temperature_2m_min[0]
      let precipitation_sum = data.daily.precipitation_sum[0]

      setMeteo({ temperature, temperature_min, precipitation_sum })
    })
  }, [date])

  useEffect(() => {
    let resourceId = lote.id
    let dateStr = format(date, 'yyyy-MM-dd')
    let histogramOptions = {
      bins: generateArray(indice.domain, 10),
    }

    let body = {
      resourceId,
      date: dateStr,
      histogramOptions,
      lote: lote,
      indice,
    }
    let baseURL = import.meta.env.VITE_COGS_SERVER_URL + '/indices/request'
    axios.post(baseURL, body).then((response) => {
      console.log(response.data)
      setResponse(response.data)
    })
  }, [date])

  let chartData = null
  let chartOptions = null

  if (response && response.stats.histogram[0]) {
    const labels = ranges_to_bin_names(response.stats.histogram[1]).reverse()
    const dataValues = response.stats.histogram[0]
      .map(
        (r) =>
          ((r / response.stats.valid_pixels) * response.area_mts_squared) /
          10000,
      )
      .reverse()
    const backgroundColors = response.stats.histogram[0]
      .map((r, i) => {
        let min_d = indice.domain[0]
        let k_color = indice.domain[1] - indice.domain[0]
        return indice.colormap_fn(
          (response.stats.histogram[1][i + 1] - min_d) / k_color,
        )
      })
      .reverse()

    chartData = {
      labels,
      datasets: [
        {
          label: t('areaHectares'),
          data: dataValues,
          backgroundColor: backgroundColors,
        },
      ],
    }

    chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: 'white',
          },
        },
        y: {
          ticks: {
            color: 'white',
          },
        },
      },
    }
  }

  return (
    <Paper
      sx={{
        backgroundColor: '#2f5ad5',
        '& .MuiAccordionSummary-root': {
          minHeight: '1rem',
        },
        '& .MuiAccordionSummary-content': {
          marginTop: '8px',
          marginBottom: '8px',
        },
      }}
    >
      <Accordion
        sx={{ backgroundColor: '#1976d299', color: 'white' }}
        defaultExpanded
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ minHeight: '1rem' }}
        >
          {t('summary')}
        </AccordionSummary>
        <AccordionDetails sx={{ marginTop: '5px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {t('colorScale')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: '20px' }}
              onClick={() => setShowChart(!showChart)}
            >
              {showChart ? t('hideChart') : t('viewChart')}
            </Button>
          </div>
          {showChart && chartData && (
            <div style={{ marginTop: '1rem' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
          {response &&
            response.stats.histogram[0]
              .map((r, i) => {
                let min_d = indice.domain[0]
                let k_color = indice.domain[1] - indice.domain[0]
                let color = indice.colormap_fn(
                  (response.stats.histogram[1][i + 1] - min_d) / k_color,
                )
                let area_has =
                  ((r / response.stats.valid_pixels) *
                    response.area_mts_squared) /
                  10000

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          backgroundColor: color,
                          width: '16px',
                          height: '16px',
                        }}
                      ></div>
                      <div style={{ marginLeft: '0.8rem', fontSize: '0.8rem' }}>
                        {ranges_to_bin_names(response.stats.histogram[1])[i]}
                      </div>
                    </div>
                    <div
                      style={{
                        marginLeft: '1rem',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                      }}
                    >
                      {r2(area_has)} {t('hectares')}
                    </div>
                  </div>
                )
              })
              .reverse()}
        </AccordionDetails>
      </Accordion>
      <Accordion
        defaultExpanded
        sx={{ backgroundColor: '#1976d299', color: 'white' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {t('dailyWeather')}
        </AccordionSummary>
        <AccordionDetails>
          {meteo.temperature ? (
            <>
              <Typography variant="body2">
                {t('minTemp')}: {meteo.temperature_min}°C
              </Typography>
              <Typography variant="body2">
                {t('maxTemp')}: {meteo.temperature}°C
              </Typography>
              <Typography variant="body2">
                {t('precipitation')}: {meteo.precipitation_sum}mm
              </Typography>
            </>
          ) : (
            <p>{t('noDataAvailable')}</p>
          )}

          <Typography variant="caption">{t('poweredBy')}</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ backgroundColor: '#1976d299', color: 'white' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {t('indexDescription')}
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ maxHeight: '4rem', overflowY: 'auto' }}>
            <p
              style={{
                wordWrap: 'break-word',
                overflow: 'auto',
                maxWidth: '15rem',
              }}
            >
              {indice.descripcion}
            </p>
          </div>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}