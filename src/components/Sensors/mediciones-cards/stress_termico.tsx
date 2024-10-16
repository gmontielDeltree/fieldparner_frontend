import React, { useEffect, useState } from "react";
import { DailyTelemetryCard } from "../sensores-types";
import ChartComponent from "../chart-component";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Box,
  useTheme,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { motion } from "framer-motion";

const variable = "stress_termico";
const titulo = "Estrés Térmico (ITH)";
const unidad = "";
const icono = "/heartbeat-svgrepo-com.svg";

interface StressTermicoCardProps {
  card: DailyTelemetryCard;
  data: any;
}

const StressTermicoCard: React.FC<StressTermicoCardProps> = ({ card, data }) => {
  const [showChartOnly, setShowChartOnly] = useState(false);
  const [min, setMin] = useState<number>(0);
  const [avg, setAvg] = useState<number>(0);
  const [max, setMax] = useState<number>(0);
  const [lastValue, setLastValue] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    if (data) {
      calculateStressTermico();
    }
  }, [data]);

  const calculateStressTermico = () => {
    const humedad = data.humedad;
    const temperatura = data.temperatura;

    const serie: number[] = temperatura.map((t: number, i: number) => {
      const h = humedad[i];
      const ith = (1.8 * t + 32) - (0.55 - 0.55 * h / 100) * (1.8 * t - 26);
      return +ith.toFixed(0);
    });

    data[variable] = serie;

    setMin(+Math.min(...serie).toFixed(1));
    setMax(+Math.max(...serie).toFixed(1));
    setAvg(+(serie.reduce((a, b) => a + b, 0) / serie.length).toFixed(1));
    setLastValue(+serie[serie.length - 1].toFixed(1));
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                >
                  <img
                    src={icono}
                    style={{
                      width: "40px",
                      height: "40px",
                      marginRight: "10px", 
                      filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))",
                      transition: "transform 0.3s ease-in-out",
                    }}
                    alt="Estrés Térmico"
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                  {titulo} {lastValue} {unidad}
                </Typography>
              ) : (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                >
                  <img
                    src={icono}
                    style={{
                      width: "40px",
                      height: "40px",
                      marginRight: "10px",
                      filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))",
                      transition: "transform 0.3s ease-in-out",
                    }}
                    alt="Estrés Térmico"
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                  Gráfico de {titulo}
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

          {!showChartOnly && (
            <Grid container spacing={1} mt={1}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Min
                </Typography>
                <Typography variant="subtitle1">
                  {min} {unidad}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Promedio
                </Typography>
                <Typography variant="subtitle1">
                  {avg} {unidad}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Max
                </Typography>
                <Typography variant="subtitle1">
                  {max} {unidad}
                </Typography>
              </Grid>
            </Grid>
          )}

          {showChartOnly && (
            <Box mt={2}>
              <div className="chart">
                <ChartComponent
                  variable_name={variable}
                  data={data}
                  show_chart_only={showChartOnly}
                />
              </div>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StressTermicoCard;
