import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Sowing from "./ActivityTypes/Sowing/Sowing";
import Note from "./ActivityTypes/Note/Note";
import Harvest from "./ActivityTypes/Harvest/Harvest";
import Application from "./ActivityTypes/Application/Application";

function Activity({
  activity,
  complementaryColor,
  icon,
  isFirst,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF
}) {
  const gradientBackground = `linear-gradient(135deg, ${complementaryColor} 30%, #f0f0f0 100%)`;

  const renderActivityContent = () => {
    switch (activity.actividad.tipo) {
      case "siembra":
        return (
          <Sowing
            activity={activity}
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
      style={{
        display: "flex",
        marginBottom: "32px",
        position: "relative"
      }}
    >
      <div style={{ marginRight: "8px", position: "relative", zIndex: 2 }}>
        {icon && (
          <img
            src={icon}
            alt={activity.actividad.tipo}
            style={{
              height: "40px",
              width: "40px",
              transition: "transform 0.3s ease",
              filter: `drop-shadow(2px 4px 6px ${complementaryColor})`
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
      <Card
        sx={{
          minWidth: 275,
          width: "100%",
          backgroundImage: gradientBackground
        }}
      >
        <CardContent>{renderActivityContent()}</CardContent>
      </Card>
    </div>
  );
}

export default Activity;
