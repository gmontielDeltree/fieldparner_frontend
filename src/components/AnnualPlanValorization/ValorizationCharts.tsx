import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ValorizationChartsProps {
  valorizations: any[];
}

export const ValorizationCharts: React.FC<ValorizationChartsProps> = ({ valorizations }) => {
  const { t } = useTranslation();

  // Datos para gráfico de barras - Tendencia por lote
  const trendByLotData = {
    labels: valorizations.map(v => `${v.campoName} - ${v.loteName}`),
    datasets: [{
      label: t('trend_local_currency'),
      data: valorizations.map(v => v.tendenciaMonLocal),
      backgroundColor: valorizations.map(v => 
        v.tendenciaMonLocal >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
      ),
      borderColor: valorizations.map(v => 
        v.tendenciaMonLocal >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
      ),
      borderWidth: 1,
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('profitability_by_lot'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };

  // Datos para gráfico de torta - Distribución por cultivo
  const cropDistribution = valorizations.reduce((acc, v) => {
    const crop = v.cultivoName || t('unknown');
    if (!acc[crop]) acc[crop] = 0;
    acc[crop] += v.has;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(cropDistribution),
    datasets: [{
      data: Object.values(cropDistribution),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    }]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: t('hectares_distribution_by_crop'),
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toFixed(1)} ha (${percentage}%)`;
          }
        }
      }
    }
  };

  // Datos para gráfico de líneas - Evolución por campaña
  const campaignData = valorizations.reduce((acc, v) => {
    const campaign = v.campanaName || '';
    if (!acc[campaign]) {
      acc[campaign] = {
        gastos: 0,
        ingresos: 0,
        count: 0,
      };
    }
    // Estos valores deberían venir del objeto completo, por ahora simulamos
    acc[campaign].gastos += v.tendenciaMonLocal < 0 ? Math.abs(v.tendenciaMonLocal) : 0;
    acc[campaign].ingresos += v.tendenciaMonLocal > 0 ? v.tendenciaMonLocal : 0;
    acc[campaign].count += 1;
    return acc;
  }, {} as Record<string, { gastos: number; ingresos: number; count: number }>);

  const lineData = {
    labels: Object.keys(campaignData),
    datasets: [
      {
        label: t('average_income'),
        data: Object.values(campaignData).map((d: any) => d.count > 0 ? d.ingresos / d.count : 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: t('average_expenses'),
        data: Object.values(campaignData).map((d: any) => d.count > 0 ? d.gastos / d.count : 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('evolution_by_campaign'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('profitability_analysis')}
            </Typography>
            <Box sx={{ height: 400 }}>
              <Bar data={trendByLotData} options={barOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('distribution_by_crop')}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={pieData} options={pieOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('campaign_comparison')}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={lineData} options={lineOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}; 