import React from "react";
import Typography from "@mui/material/Typography";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";

function NoteContent({ activity }) {
  return (
    <>
      <Typography>{activity.texto || "No hay observaciones"}</Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<MapIcon />}
        sx={{
          borderRadius: "20px",
          marginTop: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            backgroundColor: "secondary.main"
          },
          padding: "10px 20px"
        }}
      >
        Localizar
      </Button>
    </>
  );
}

export default NoteContent;
