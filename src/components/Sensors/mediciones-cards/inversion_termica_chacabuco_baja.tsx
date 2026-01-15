import React, { useEffect, useState } from "react";
import { DailyTelemetryCard } from "../sensores-types";
import ChartComponent from "../chart-component";
import { Devices } from "../sensores";
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

const variable = "inversion_termica_chacabuco_baja";
const titulo = "Inv. Térmica";
const unidad = "";
const icono = "/invert-svgrepo-com.svg";

interface InversionTermicaChacabucoBajaCardProps {
  card: DailyTelemetryCard;
  data: any;
}

const InversionTermicaChacabucoBajaCard: React.FC<InversionTermicaChacabucoBajaCardProps> = ({
  card,
  data,
}) => {
  const [showChartOnly, setShowChartOnly] = useState(false);
  const [min, setMin] = useState<number>(0);
  const [avg, setAvg] = useState<number>(0);
  const [max, setMax] = useState<number>(0);
  const [lastValue, setLastValue] = useState<number>(0);
  const devices = new Devices();
  const theme = useTheme();

  useEffect(() => {
    if (data) {
      calculateInversionTermica();
    }
  }, [data]);

  const calculateInversionTermica = async () => {
    const humedad = data?.humedad;
    const temperatura = data?.temperatura;

    if (!Array.isArray(humedad) || !Array.isArray(temperatura) || !humedad.length || !temperatura.length) {
      return;
    }

    const length = Math.min(humedad.length, temperatura.length);
    const serie: number[] = temperatura.slice(0, length).map((t: number, i: number) => {
      const h = humedad[i];
      const pc = (h / 100) ** (1 / 8) * (112 + 0.9 * t) + 0.1 * t - 112;
      return +pc.toFixed(1);
    });

    data[variable] = serie;

    setMin(+Math.min(...serie).toFixed(1));
    setMax(+Math.max(...serie).toFixed(1));
    setAvg(+(serie.reduce((a, b) => a + b, 0) / serie.length).toFixed(1));
    setLastValue(+serie[serie.length - 1].toFixed(1));

    const dataBaja = await devices.get_raw_data_for_charts_generic("sfdfsd");
    console.log("Data for Charts Chaca Baja", dataBaja);
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
                    alt="Inversión Térmica"
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
                    alt="Inversión Térmica"
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

export default InversionTermicaChacabucoBajaCard;
