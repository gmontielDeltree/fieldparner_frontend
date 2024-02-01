import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import TourForm from "./forms/NotesForms/TourForm";
import { getEmptyNote } from "../../interfaces/activity";
import { format } from "date-fns";
import AgricultureIcon from "@mui/icons-material/Assignment";
import uuid4 from "uuid4";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const Header = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
  borderRadius: "8px",
  margin: theme.spacing(2, 0)
}));

const FieldInfo = styled("div")(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "1.2rem",
  color: theme.palette.primary.contrastText
}));
interface TourProps {
  lot: any;
  fieldName: string;
  db: any;
  backToActivites: () => void;
}

const Tour: React.FC<TourProps> = ({ lot, db, fieldName, backToActivites }) => {
  if (!lot) return null;
  const lotName = lot.properties.name;

  const [formData, setFormData] = useState(getEmptyNote());

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      lote_uuid: lot.id,
      tipo: "nota"
    }));
  }, [lot]);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleRemoveMarkers = () => {
    console.log("Removing markers (callback)");
  };

  const handleSave = () => {
    let actividad = formData;
    try {
      const fechaEjecucion = actividad.fecha;
      const parsedDate = new Date(fechaEjecucion);
      const formattedDate = format(parsedDate, "yyyy-MM-dd");
      actividad._id = "actividad:" + formattedDate + ":" + actividad.uuid;

      db.get(actividad._id)
        .then((doc) => {
          actividad._rev = doc._rev;
          return db.put(actividad);
        })
        .then(() => {
          console.log("Actividad guardada", "success");
          backToActivites();
        })
        .catch((error) => {
          if (error.name === "not_found") {
            console.log("Actividad not found. Creating a new one.");
            delete actividad._rev;
            db.put(actividad)
              .then(() => {
                console.log("New actividad created", "success");
                handleRemoveMarkers();
                backToActivites();
              })
              .catch((err) =>
                console.error("Error creating new actividad:", err)
              );
          } else {
            console.error("Error saving actividad:", error);
          }
        });
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  return (
    <div>
      <Header>
        <FieldInfo>Lote: {lotName}</FieldInfo>
        <FieldInfo>Campo: {fieldName}</FieldInfo>
      </Header>
      <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
        <AgricultureIcon sx={{ fontSize: 50, color: "green" }} />
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: "bold",
            mt: 2,
            background: "linear-gradient(45deg, #a0a0a0, #626262)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "1px 1px 4px rgba(0,0,0,0.15)",
            animation: "shine 5s linear infinite",
            "@keyframes shine": {
              "0%": { opacity: 0.8 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.8 }
            }
          }}
        >
          Recorrido
        </Typography>
      </Box>

      <TourForm
        lot={lot}
        formData={formData}
        setFormData={setFormData}
        tourSave={handleRemoveMarkers}
      />

      <Button
        color="success"
        onClick={() => {
          handleSave();
        }}
        style={{
          marginTop: "1rem"
        }}
      >
        Guardar
      </Button>
    </div>
  );
};

export default Tour;
