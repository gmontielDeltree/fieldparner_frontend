import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Sowing from "./ActivityTypes/Sowing/Sowing";
import Note from "./ActivityTypes/Note/Note";
import Harvest from "./ActivityTypes/Harvest/Harvest";
import Application from "./ActivityTypes/Application/Application";

function Activity({
  activity,
  fieldDoc,
  lotDoc,
  complementaryColor,
  icon,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF
}) {
  const [gradientAngle, setGradientAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prevAngle) => (prevAngle + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const gradientBackground = `linear-gradient(${gradientAngle}deg, ${complementaryColor} 30%, #f0f0f0 100%)`;

  const cardStyle = {
    border: `2px solid ${complementaryColor}`,
    borderRadius: "10px",
    minWidth: 275,
    width: "100%",
    backgroundImage: gradientBackground,
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)"
  };

  const renderActivityContent = () => {
    switch (activity.actividad.tipo) {
      case "siembra":
        return (
          <Sowing
            activity={activity}
            fieldName={fieldDoc.nombre}
            lotName={lotDoc.properties.nombre}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
          />
        );
      case "cosecha":
        return (
          <Harvest
            activity={activity}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
          />
        );
      case "nota":
        return (
          <Note
            activity={activity}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
          />
        );
      case "aplicacion":
        return (
          <Application
            activity={activity}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
          />
        );
      case "analisis de suelo":
        return <div>todo</div>;
      default:
        return <Typography>Unknown Activity Type</Typography>;
    }
  };
  return (
    <div
      style={{ display: "flex", marginBottom: "32px", position: "relative" }}
    >
      <div style={{ marginRight: "8px", position: "relative", zIndex: 2 }}>
        {icon && (
          <img
            src={icon}
            alt={activity.actividad.tipo}
            style={{
              height: "40px",
              width: "40px",
              transition: "transform 0.3s ease, filter 0.3s ease",
              filter: `drop-shadow(2px 4px 6px ${complementaryColor})`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "rotate(20deg)";
              e.currentTarget.style.filter = `drop-shadow(2px 4px 6px ${complementaryColor})`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "rotate(0deg)";
              e.currentTarget.style.filter = `drop-shadow(2px 4px 6px ${complementaryColor})`;
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: "20px",
          top: "20px",
          bottom: "-32px",
          width: "2px",
          background: "linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%)",
          zIndex: 1
        }}
      ></div>
      <Card sx={cardStyle}>
        <CardContent>{renderActivityContent()}</CardContent>
      </Card>
    </div>
  );
}

export default Activity;
