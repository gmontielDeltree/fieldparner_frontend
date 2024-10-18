import React, { useEffect, useState, useRef } from "react";
import ApexCharts from "apexcharts";
import { valor } from "../sensores";
import { add_download_xls_button } from "../excel_boton";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Box,
  useTheme,
  SvgIcon,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { motion } from "framer-motion";
import { DailyTelemetryCard } from "../sensores-types";

const WindIcon = () => (
  <img
    src="/wind-svgrepo-com.svg" 
    style={{
      width: "30px",
      height: "30px",
      marginRight: "10px", 
      filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))",
      transition: "transform 0.3s ease-in-out",
    }}
    alt="Wind Icon"
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  />
);


interface VientoVelocidadCardProps {
  card: DailyTelemetryCard;
  data: any;
}

const VientoVelocidadCard: React.FC<VientoVelocidadCardProps> = ({
  card,
  data,
}) => {
  const [showChartOnly, setShowChartOnly] = useState(false);
  const chartRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (showChartOnly && data) {
      renderCentralChart();
    }
  }, [data, showChartOnly]);

  const renderCentralChart = async () => {
    const chartElement = chartRef.current;
    if (!chartElement || !data || !data.ts || !data.viento_velocidad) {
      console.error("No se encontró el elemento del gráfico o faltan datos.");
      return;
    }

    chartElement.innerHTML = "";

    const options = {
      chart: {
        type: "area",
        height: 300,
        foreColor: theme.palette.text.primary,
        animations: {
          enabled: true,
        },
      },
      colors: [theme.palette.primary.main],
      series: [
        {
          name: "Viento - Velocidad",
          data: data.velocidad ? data.velocidad : data.viento_velocidad || [],
        },
      ],
      xaxis: {
        type: "datetime",
        categories: data.ts || [],
        labels: {
          style: {
            colors: theme.palette.text.primary,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: theme.palette.text.primary,
          },
        },
        title: {
          text: "Viento - Velocidad (km/h)",
          style: {
            color: theme.palette.text.primary,
          },
        },
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    };

    const chart = new ApexCharts(chartElement, options);
    chart.render();

    add_download_xls_button(
      chartElement,
      options.xaxis.categories,
      options.series[0].data,
      "Viento - Velocidad"
    );
  };

  const toggleChartView = () => {
    setShowChartOnly(!showChartOnly);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: 2,
          padding: 2,
          boxShadow: theme.shadows[2],
        }}
      >
        <CardContent sx={{ padding: "8px !important" }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={11}>
              {!showChartOnly ? (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ display: "flex", alignItems: "center", fontWeight: 500 }}
                >
                  <WindIcon />
                  {valor(card, "velocidad") === "N/A"
                    ? valor(card, "viento_velocidad")
                    : valor(card, "velocidad")}{" "}
                  km/h
                </Typography>
              ) : (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ display: "flex", alignItems: "center", fontWeight: 500 }}
                >
                  <WindIcon />
                  Gráfico de Viento - Velocidad
                </Typography>
              )}
            </Grid>
            <Grid item xs={1} sx={{ textAlign: "right" }}>
              <IconButton
                onClick={toggleChartView}
                sx={{ color: theme.palette.text.primary }}
              >
                {showChartOnly ? (
                  <ArrowBackIosIcon />
                ) : (
                  <ArrowForwardIosIcon />
                )}
              </IconButton>
            </Grid>
          </Grid>

          {!data && (
            <Grid container justifyContent="center" alignItems="center">
              <CircularProgress color="secondary" />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Cargando Datos...
              </Typography>
            </Grid>
          )}

          {!showChartOnly && (
            <Grid container spacing={1} mt={1}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Min
                </Typography>
                <Typography variant="subtitle1">
                  {valor(card, "viento_velocidad_min")} km/h
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Promedio
                </Typography>
                <Typography variant="subtitle1">
                  {valor(card, "viento_velocidad_mean")} km/h
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Max
                </Typography>
                <Typography variant="subtitle1">
                  {valor(card, "viento_velocidad_max")} km/h
                </Typography>
              </Grid>
            </Grid>
          )}

          {showChartOnly && (
            <Box mt={2}>
              <div id="chart" ref={chartRef} style={{ height: "300px" }}></div>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VientoVelocidadCard;
