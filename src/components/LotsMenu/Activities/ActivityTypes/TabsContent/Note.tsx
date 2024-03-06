import React from "react";
import Typography from "@mui/material/Typography";
import { Button, Card, CardContent, Box, Chip } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  backdropFilter: "blur(10px)",
  backgroundColor: "rgba(255, 255, 255, 0.7)", // Adjust opacity as needed
  boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.2)",
  borderRadius: "15px",
  margin: "20px 0",
  padding: "10px",
  border: "1px solid rgba(255, 255, 255, 0.3)" // Optional: adds a slight border for better definition
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  margin: "5px 5px 5px 0"
}));

const ContentBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between", // This ensures the button aligns to the bottom
  height: "100%" // Make sure the content box takes full height of its parent
}));

function NoteContent({ activity }) {
  const featureCount = activity.features.length;
  const activityDate = new Date(activity.fecha).toLocaleDateString();
  const nextVisitDate = new Date(activity.proxima_visita).toLocaleDateString();

  const renderPropertyValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return (
        <Box display="flex" flexDirection="column" ml={1}>
          {Object.entries(value).map(([key, val]) => (
            <Typography key={key} variant="body2" color="textSecondary">
              {key}: {JSON.stringify(val)}
            </Typography>
          ))}
        </Box>
      );
    }
    return value.toString();
  };

  return (
    <StyledCard>
      <ContentBox>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            component="div"
            color="primary.main"
          >
            {activity.nombre || "Actividad sin nombre"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {activity.texto || "No hay observaciones"}
          </Typography>
          <InfoChip label={`Fecha: ${activityDate}`} color="primary" />
          <InfoChip
            label={`Próxima visita: ${nextVisitDate}`}
            color="secondary"
          />
          <InfoChip label={`Puntos: ${featureCount}`} variant="outlined" />
        </CardContent>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            startIcon={<MapIcon />}
            sx={{
              borderRadius: "20px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "secondary.main",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)"
              }
            }}
          >
            Localizar
          </Button>
        </Box>
      </ContentBox>
    </StyledCard>
  );
}

export default NoteContent;
