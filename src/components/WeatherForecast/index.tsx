import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  useTheme,
  styled,
  Paper
} from "@mui/material";
import { forecastWeather } from "./helper";
import Lottie from "react-lottie";
import { motion } from "framer-motion";

import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
// Import your Lottie animation files
import sunnyAnimation from "./animations/sunny.json";
import snowyAnimation from "./animations/thunderstorm.json";
import rainyAnimation from "./animations/rainy.json";
import thunderstormAnimation from "./animations/thunderstorm.json";
import cloudyAnimation from "./animations/cloudy.json";
import mistAnimation from "./animations/mist.json";
import showerRainAnimation from "./animations/shower-rain.json";
import { useTranslation } from "react-i18next";

const defaultOptions = (animationData) => ({
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
});

const weatherAnimations = {
  0: defaultOptions(sunnyAnimation),
  1: defaultOptions(sunnyAnimation),
  2: defaultOptions(sunnyAnimation), // Clear sky
  3: defaultOptions(cloudyAnimation), // Scattered clouds
  22: defaultOptions(snowyAnimation), // Snow
  45: defaultOptions(mistAnimation), // Fog
  61: defaultOptions(rainyAnimation), // Rain
  80: defaultOptions(showerRainAnimation), // Shower Rain
  81: defaultOptions(showerRainAnimation), // Shower Rain
  82: defaultOptions(showerRainAnimation), // Shower Rain
  95: defaultOptions(thunderstormAnimation), // Thunderstorm
  96: defaultOptions(thunderstormAnimation), // Thunderstorm
  97: defaultOptions(thunderstormAnimation), // Thunderstorm
  98: defaultOptions(thunderstormAnimation), // Thunderstorm
  99: defaultOptions(thunderstormAnimation) // Thunderstorm
};

const DateBadge = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5))`,
  color: theme.palette.getContrastText(theme.palette.background.paper),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
  backdropFilter: "blur(10px)"
}));

const StyledEventNoteIcon = styled(ThunderstormIcon)(({ theme }) => ({
  fontSize: "2.3rem",
  color: `rgba(255, 255, 255, 0.9)`,
  borderRadius: "50%",
  padding: "5px"
}));

const WeatherForecast = ({ position = [-59.0979, -35.1854] }) => {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await forecastWeather(position);
        setWeatherData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [JSON.stringify(position)]);

  useEffect(() => {
    console.log(weatherData);
  }, [weatherData]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error: {error}</Typography>;
  if (!weatherData) return null;

  return (
    <Box sx={{ overflowX: "auto", p: 2, whiteSpace: "nowrap" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          marginBottom: "20px"
        }}
      >
        <StyledEventNoteIcon />
        <DateBadge>
          <Typography style={{ fontWeight: "bold" }}>
            {t("Pronostico del Tiempo")}
          </Typography>
        </DateBadge>
      </Box>
      <Box sx={{ display: "inline-flex", gap: 2 }}>
        {weatherData.daily.time.map((date, index) => {
          const tooltipTitle = (
            <React.Fragment>
              <Typography color="inherit">
                {new Date(date).toLocaleDateString()}
              </Typography>
              <b>Max Temp:</b> {weatherData.daily.temperature_2m_max[index]}°C
              <br />
              <b>Min Temp:</b> {weatherData.daily.temperature_2m_min[index]}°C
              <br />
              <b>Precipitation:</b> {weatherData.daily.precipitation_sum[index]}
              mm
              <br />
              <b>Precipitation Hours:</b>{" "}
              {weatherData.daily.precipitation_hours[index]}h<br />
              <b>Precipitation Probability:</b>{" "}
              {weatherData.daily.precipitation_probability_max[index]}%
            </React.Fragment>
          );

          return (
            <Tooltip title={tooltipTitle} key={date} arrow>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  background: `rgba(255, 255, 255, 0.2)`,
                  backdropFilter: "blur(8px)",
                  borderRadius: theme.shape.borderRadius * 2,
                  padding: theme.spacing(2),
                  boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`,
                  "&:hover": {
                    boxShadow: `0 8px 12px rgba(0, 0, 0, 0.2)`,
                    transform: "scale(1.05)"
                  }
                }}
              >
                <Box
                  sx={{
                    background: "white",
                    color: "theme.palette.text.primary",
                    borderRadius: "12px",
                    padding: "4px 12px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                    marginBottom: "8px"
                  }}
                >
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                  })}
                </Box>
                <Lottie
                  options={
                    weatherAnimations[weatherData.daily.weathercode[index]] ||
                    defaultOptions(cloudyAnimation)
                  }
                  height={80}
                  width={80}
                />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {weatherData.daily.temperature_2m_max[index]}°C
                </Typography>
                <Typography variant="body2">
                  {weatherData.daily.precipitation_sum[index]}mm
                </Typography>
              </motion.div>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default WeatherForecast;
