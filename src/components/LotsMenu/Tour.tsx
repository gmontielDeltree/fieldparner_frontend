import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import TourForm from "./forms/NotesForms/TourForm";
import { getEmptyNote } from "../../interfaces/activity";
import { format, parseISO } from "date-fns";
import AgricultureIcon from "@mui/icons-material/Assignment";
import uuid4 from "uuid4";
import Paper from "@mui/material/Paper";
import { keyframes, styled, useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import PlaceMarker from "../NewGeometry/PlaceMarker";

const floating = keyframes`
0% { transform: translateY(0px); }
50% { transform: translateY(-10px); }
100% { transform: translateY(0px); }
`;

interface TourProps {
  lot: any;
  fieldName: string;
  db: any;
  backToActivites: () => void;
}

const Tour: React.FC<TourProps & { existingNote?: any }> = ({
  lot,
  db,
  fieldName,
  backToActivites,
  existingNote
}) => {
  if (!lot) return null;
  const theme = useTheme();
  const [formData, setFormData] = useState(existingNote || getEmptyNote());
  const titleBg = existingNote
    ? `linear-gradient(60deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`
    : `linear-gradient(45deg, #a0a0a0, #626262)`;
  const removeMarkerFunctionsRef = useRef<(() => void)[]>([]);
  useEffect(() => {
    if (existingNote) {
      setFormData(existingNote);
    } else {
      setFormData(getEmptyNote());
    }
  }, [existingNote]);

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
    removeMarkerFunctionsRef.current.forEach((removeFunc) => removeFunc());
    removeMarkerFunctionsRef.current = [];
    console.log("handle remove markers called !");
  };

  useEffect(() => {
    return () => {
      removeMarkerFunctionsRef.current.forEach((func) => func());
    };
  }, []);

  const handleSetCoordinates = (index, newPosition) => {
    let newFormData = { ...formData };
    newFormData.features[index].properties.posicion = newPosition;
    setFormData(newFormData);
  };

  const handleSave = () => {
    let actividad = formData;
    try {
      const fechaEjecucion = actividad.fecha;
  

      if (!fechaEjecucion || isNaN(new Date(fechaEjecucion).getTime())) {
        throw new Error('Fecha inválida');
      }
      
      const parsedDate = new Date(fechaEjecucion);
      const formattedDate = format(parsedDate, "yyyy-MM-dd");
      actividad._id =
        actividad._id || "actividad:" + formattedDate + ":" + uuid4();
  
      db.get(actividad._id)
        .then((doc) => {
          actividad._rev = doc._rev;
          return db.put(actividad);
        })
        .then(() => {
          console.log("Actividad updated", "success");
          handleRemoveMarkers();
          backToActivites();
        })
        .catch((error) => {
          if (error.name === "not_found") {
            console.log("Actividad not found. Creating a new one.");
            delete actividad._rev;
            db.put(actividad)
              .then(() => {
                console.log("New actividad created", "success");
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
            background: titleBg,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "1px 1px 4px rgba(0,0,0,0.15)",
            animation: existingNote
              ? `${floating} 3s ease-in-out infinite`
              : "none"
          }}
        >
          {existingNote ? (
            <>
              <EditIcon
                sx={{
                  verticalAlign: "middle",
                  mr: 1,
                  animation: `${floating} 3s ease-in-out infinite`
                }}
              />{" "}
              Editar Recorrido
            </>
          ) : (
            "Recorrido"
          )}
        </Typography>
      </Box>

      <TourForm
        lot={lot}
        formData={formData}
        setFormData={setFormData}
        tourSave={handleRemoveMarkers}
      />

      {existingNote &&
        formData.features.map((feature, index) => (
          <PlaceMarker
            key={index}
            selectedLot={{
              geometry: {
                type: "Point",
                coordinates: feature.properties.posicion
              }
            }}
            setCoordinates={(newPosition) =>
              handleSetCoordinates(index, newPosition)
            }
            isDraggable={true}
            onRemoveMarkers={(removeFunc) => {
              removeMarkerFunctionsRef.current.push(removeFunc);
            }}
          />
        ))}

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
