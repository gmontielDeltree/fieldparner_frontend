import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import { DailyTelemetryCard } from "../sensores-types";
import { valor } from "../sensores";
import { add_download_xls_button } from "../excel_boton";
import RosaDeVientos from "../rosad3"; // Asumo que este componente existe como parte de tu proyecto
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Box,
  useTheme,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { motion } from "framer-motion";

// Ícono de la Rosa de los Vientos, personalizado
const WindRoseIcon = () => (
  <img
    src="/windrose-svgrepo-com.svg"
    style={{
      width: "40px",
      height: "40px",
      marginRight: "10px", // Ajustamos el margen derecho
      filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))",
      transition: "transform 0.3s ease-in-out",
    }}
    alt="Wind Rose Icon"
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  />
);

const puntosCardinales = [
  "    N", "    NNE", "    NE", "    ENE", "    E", "    ESE", "    SE", "    SSE", 
  "    S", "    SSW", "    SW", "    WSW", "    W", "    WNW", "    NW", "    NNW"
];

const matrizDeVientos = (ts: any, dir: number[], vel: number[]) => {
  const lTotal = vel.length;
  const muestras = vel.map((velocidad, i) => ({ vel: velocidad, dir: dir[i] }));
  const rangosVel = [0, 5, 10, 15, 20, 30, 40, Infinity];
  const rangosDir = Array.from({ length: 16 }, (_, i) => i * (360 / 16));

  const result = [];
  const columns = ["angle"];

  for (let i = 1; i < rangosDir.length; i++) {
    const limiteDirInf = rangosDir[i - 1];
    const limiteDirSup = rangosDir[i];

    const binDireccion = muestras.filter((d) => d.dir > limiteDirInf && d.dir < limiteDirSup);
    let totalEjeVel = 0;
    const fila: any = { angle: puntosCardinales[i - 1] };

    for (let z = 1; z < rangosVel.length; z++) {
      const limiteVelInf = rangosVel[z - 1];
      const limiteVelSup = rangosVel[z];
      const binVel = binDireccion.filter((d) => d.vel > limiteVelInf && d.vel < limiteVelSup);

      const fraccion = (binVel.length / lTotal) * 100;
      totalEjeVel += fraccion;
      fila[`${limiteVelInf}-${limiteVelSup}`] = fraccion;

      if (!columns.includes(`${limiteVelInf}-${limiteVelSup}`)) {
        columns.push(`${limiteVelInf}-${limiteVelSup}`);
      }
    }
    fila.total = totalEjeVel;
    result.push(fila);
  }

  result.unit = "km/h";
  result.columns = columns;
  return result;
};

interface VientoDireccionCardProps {
  card: DailyTelemetryCard;
  data: any;
}

const VientoDireccionCard: React.FC<VientoDireccionCardProps> = ({ card, data }) => {
  const [showChartOnly, setShowChartOnly] = useState(false);
  const [matrizDeVientos, setMatrizDeVientos] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    if (data) {
      renderCentralChart();
    }
  }, [data]);

  const renderCentralChart = async () => {
    const baseOptions = {
      colors: ["#F44336", "#E91E63", "#9C27B0"],
      series: [{ name: "", data: [] }],
      chart: {
        height: 300,
        type: "area",
        animations: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: {
        type: "datetime",
        categories: [],
        labels: { style: { colors: "#000000" } },
      },
      yaxis: [
        {
          axisTicks: { show: true },
          axisBorder: { show: true, color: "#008FFB" },
          labels: { style: { colors: "#000000" } },
          title: { text: "Viento - Dirección", style: { color: "#eb2a1c" } },
          tooltip: { enabled: true },
        },
      ],
      tooltip: { x: { format: "dd/MM/yy HH:mm" } },
    };

    const options = {
      ...baseOptions,
      chart: {
        type: "scatter",
        height: "180px",
        foreColor: theme.palette.text.primary,
        animations: { enabled: false },
      },
      title: {
        text: "Sensor 1",
        align: "left",
        margin: 10,
        floating: false,
        style: { fontSize: "14px", fontWeight: "bold", color: theme.palette.text.primary },
      },
    };

    const thisOpts = JSON.parse(JSON.stringify(options));
    thisOpts.xaxis.categories = data.ts;

    let matriz;
    if ("direccion" in data) {
      thisOpts.series[0].data = data.direccion;
      matriz = matrizDeVientos(data.ts, data.direccion, data.velocidad);
    } else if ("viento_direccion" in data) {
      thisOpts.series[0].data = data.viento_direccion;
      matriz = matrizDeVientos(data.ts, data.viento_direccion, data.viento_velocidad);
    }

    thisOpts.series[0].name = "Viento - Dirección";
    thisOpts.title.text = "Viento - Dirección";
    thisOpts.yaxis[0].title = "Viento - Dirección";

    setMatrizDeVientos(matriz);
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
                  <WindRoseIcon />
                  {valor(card, "direccion") === "N/A"
                    ? valor(card, "viento_direccion")
                    : valor(card, "direccion")}{" "}
                  º
                </Typography>
              ) : (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ display: "flex", alignItems: "center", fontWeight: 500 }}
                >
                  <WindRoseIcon />
                  Gráfico de Viento - Dirección
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
                  {valor(card, "viento_direccion_min")} º
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Promedio
                </Typography>
                <Typography variant="subtitle1">
                  {valor(card, "viento_direccion_mean")} º
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Max
                </Typography>
                <Typography variant="subtitle1">
                  {valor(card, "viento_direccion_max")} º
                </Typography>
              </Grid>
            </Grid>
          )}

          {showChartOnly && (
            <Box mt={2}>
              <div id="chart">
                {matrizDeVientos && <RosaDeVientos data={matrizDeVientos} />}
              </div>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VientoDireccionCard;
