import React from "react";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tooltip,
  Chip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MapIcon from "@mui/icons-material/Map";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import NotesIcon from "@mui/icons-material/Notes";
import ImageIcon from "@mui/icons-material/Image";
import MicIcon from "@mui/icons-material/Mic";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Custom Accordion styling
const CustomAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `rgba(255, 255, 255, 0.5)`,
  backdropFilter: "blur(10px)",
  boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
  "&:not(:last-child)": {
    borderBottom: 0
  },
  "&:before": {
    display: "none"
  },
  "&.Mui-expanded": {
    margin: theme.spacing(1, 0)
  },
  "& .MuiAccordionSummary-root": {
    backgroundColor: `rgba(255, 255, 255, 0.5)`,
    "&.Mui-expanded": {
      backgroundColor: `rgba(255, 255, 255, 0.7)`
    }
  },
  color: theme.palette.getContrastText(theme.palette.background.paper),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: `rgba(255, 255, 255, 0.65)`,
    boxShadow: `0 6px 12px 0 rgba(0,0,0,0.15)`
  }
}));
// Custom summary styling
const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  "&.Mui-expanded": {
    minHeight: 48
  },
  "& .MuiAccordionSummary-content.Mui-expanded": {
    margin: "12px 0"
  }
}));
// Custom details styling
const CustomAccordionDetails = styled(AccordionDetails)({
  flexDirection: "column",
  padding: "16px"
});
// Date badge styling
const DateBadge = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5))`,
  color: theme.palette.getContrastText(theme.palette.background.paper),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
  backdropFilter: "blur(10px)",
  margin: "10px 0"
}));
// Feature chip styling
const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: "0 8px 8px 0",
  background: "rgba(255, 255, 255, 0.6)",
  borderRadius: "16px",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
  }
}));
// Location button styling
const LocationButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.warning.main,
  color: "white",
  borderRadius: "20px",
  padding: "8px 16px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.warning.dark,
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-2px)"
  }
}));
// Overview box styling
const OverviewBox = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.4)",
  backdropFilter: "blur(8px)",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.2)"
}));

function NoteContent({ activity, onViewAllPoints }) {
  const { t, i18n } = useTranslation();
  const featureCount = activity.features.length;

  // Format date in readable format
  const formatDate = (dateString) => {
    if (!dateString) return t('dateNotAvailable');
    try {
      // Handle both string date formats and Date objects
      const date = typeof dateString === 'object' ? dateString : new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return t('incorrectDate');

      // Get the appropriate locale based on the current language
      let locale;
      if (i18n.language.startsWith('es')) {
        locale = 'es-ES';
      } else if (i18n.language.startsWith('pt')) {
        locale = 'pt-BR';
      } else {
        locale = 'en-US';
      }

      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return t('dateError');
    }
  };

  // Get days remaining until next visit
  const getDaysRemaining = () => {
    if (!activity.proxima_visita) return null;
    try {
      const today = new Date();
      const nextVisit = new Date(activity.proxima_visita);
      // Check if date is valid
      if (isNaN(nextVisit.getTime())) return null;
      const diffTime = nextVisit.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return null;
    }
  };

  const daysRemaining = getDaysRemaining();
  const urgentVisit = daysRemaining !== null && daysRemaining < 7;

  // Debugging info
  console.log("Activity data:", {
    nombre: activity.nombre,
    fecha: activity.fecha,
    proxima_visita: activity.proxima_visita,
    features: activity.features?.length
  });

  return (
    <>
      {/* Activity Overview Section */}
      <OverviewBox>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          {activity.nombre || t('unnamedActivity')}
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          {activity.texto || t('noObservationsForActivity')}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <FeatureChip
            icon={<NotesIcon />}
            label={t('pointsCount', { count: featureCount })}
            variant="outlined"
            color="primary"
            onClick={onViewAllPoints}
          />
          {featureCount > 0 && activity.features.some(f => f.properties.fotos?.length > 0) && (
            <FeatureChip
              icon={<ImageIcon />}
              label={t('images')}
              variant="outlined"
              color="secondary"
            />
          )}
          {featureCount > 0 && activity.features.some(f => f.properties.audio) && (
            <FeatureChip
              icon={<MicIcon />}
              label={t('recordings')}
              variant="outlined"
              color="secondary"
            />
          )}
        </Box>
      </OverviewBox>

      {/* Dates Information */}
      <CustomAccordion defaultExpanded>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <CalendarTodayIcon sx={{ mr: 1, color: "warning.main" }} />
            <Typography variant="subtitle1">{t('importantDates')}</Typography>
          </Box>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <DateBadge>
            <Typography sx={{ fontWeight: "bold", mr: 1 }}>
              {t('registrationDate')}:
            </Typography>
            <Typography>{activity.fecha ? formatDate(activity.fecha) : t('notDefined')}</Typography>
          </DateBadge>
          <DateBadge sx={{
            background: urgentVisit
              ? 'linear-gradient(135deg, rgba(255, 243, 224, 0.9), rgba(255, 236, 179, 0.7))'
              : undefined
          }}>
            <Typography sx={{ fontWeight: "bold", mr: 1 }}>
              {t('nextVisit')}:
            </Typography>
            <Typography>{activity.proxima_visita ? formatDate(activity.proxima_visita) : t('notDefined')}</Typography>
            {urgentVisit && (
              <Chip
                size="small"
                label={t('inDays', { count: daysRemaining })}
                color="warning"
                sx={{ ml: 1 }}
              />
            )}
          </DateBadge>
        </CustomAccordionDetails>
      </CustomAccordion>

      {/* Points Information */}
      {featureCount > 0 && (
        <CustomAccordion>
          <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <LocationOnIcon sx={{ mr: 1, color: "info.main" }} />
              <Typography variant="subtitle1">{t('pointsSummary')}</Typography>
            </Box>
          </CustomAccordionSummary>
          <CustomAccordionDetails>
            <Typography paragraph>
              {t('activityContainsPoints', { count: featureCount })}
            </Typography>
            <Box sx={{ mb: 2 }}>
              {activity.features.map((feature, index) => (
                <Tooltip
                  key={index}
                  title={feature.properties.nombre || t('pointNumber', { number: index + 1 })}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px'
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {feature.properties.nombre || t('pointNumber', { number: index + 1 })}
                    </Typography>
                    <Box display="flex" gap={1}>
                      {feature.properties.fotos?.length > 0 && (
                        <Chip
                          size="small"
                          icon={<ImageIcon fontSize="small" />}
                          label={feature.properties.fotos.length}
                          variant="outlined"
                        />
                      )}
                      {feature.properties.audio && (
                        <Chip
                          size="small"
                          icon={<MicIcon fontSize="small" />}
                          label={t('audio')}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Paper>
                </Tooltip>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={onViewAllPoints}
                startIcon={<LocationOnIcon />}
              >
                {t('viewAllPoints')}
              </Button>
            </Box>
          </CustomAccordionDetails>
        </CustomAccordion>
      )}

      {/* Observations Section */}
      <CustomAccordion>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <NotesIcon sx={{ mr: 1, color: "success.main" }} />
            <Typography variant="subtitle1">{t('observations')}</Typography>
          </Box>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography variant="body1">
            {activity.texto || t('noObservationsForActivity')}
          </Typography>
        </CustomAccordionDetails>
      </CustomAccordion>

      {/* Action Button */}
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <LocationButton
          variant="contained"
          startIcon={<MapIcon />}
        >
          {t('locateOnMap')}
        </LocationButton>
      </Box> */}
    </>
  );
}

export default NoteContent;