import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  styled,
  keyframes,
  ListItem,
  ListItemText,
  List,
  Button,
  Snackbar,
  Alert,
  TextField
} from "@mui/material";

import { Field, Lot } from "../../../interfaces/field";
import { dbContext } from "../../../services";
import uuid4 from "uuid4";
import { format } from "date-fns";

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const GlossyButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  padding: "10px 20px",
  color: theme.palette.getContrastText(theme.palette.background.paper),
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)"
  },
  "&.Mui-disabled": {
    color: theme.palette.action.disabled,
    background:
      "linear-gradient(135deg, rgba(200, 200, 200, 0.5), rgba(200, 200, 200, 0.2))",
    boxShadow: "none"
  }
}));

const GlossyEffect = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  height: "100%",
  width: "100%",
  position: "absolute",
  top: 0,
  left: 0,
  borderRadius: theme.shape.borderRadius,
  zIndex: 0
}));

const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  animation: `${fadeInAnimation} 1s ease-out forwards`,
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0))",
    borderRadius: theme.shape.borderRadius,
    zIndex: 0
  }
}));

const ModernDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  backgroundColor: "rgba(0,0,0,0.12)"
}));

const ContentOverlay = styled(CardContent)({
  position: "relative",
  zIndex: 1,
  maxHeight: "400px",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "0.4em"
  },
  "&::-webkit-scrollbar-track": {
    boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
    webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)"
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0,0,0,.1)",
    outline: "1px solid slategrey"
  }
});
function ReplicateActivityMenu({ originalActivity, handleReplicateActivity }) {
  const [fadeIn, setFadeIn] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [filter, setFilter] = useState("");

  const [lotsWithFieldNames, setLotsWithFieldNames] = useState<
    { lot: Lot; fieldName: string }[]
  >([]);
  const [selectedLots, setSelectedLots] = useState<string[]>([]);

  const db = dbContext.Fields;

  useEffect(() => {
    fetchData();
    setFadeIn(true);
  }, []);

  const fetchData = async () => {
    try {
      const allDocs = await db.allDocs({ include_docs: true });
      const fetchedFields = allDocs.rows
        .map((row) => row.doc)
        .filter((doc): doc is Field => doc !== undefined && isField(doc));
      console.log("fetchedFields from PouchDB...", fetchedFields);
      extractLots(fetchedFields);
    } catch (err) {
      console.error("Error fetching data from PouchDB", err);
    }
  };

  const replicateActivity = async () => {
    const successfulReplications = [];

    await Promise.all(
      selectedLots.map(async (uuid) => {
        const lotWithFieldName = lotsWithFieldNames.find(
          (lotWithName) => lotWithName.lot.properties.uuid === uuid
        );

        if (!lotWithFieldName) {
          console.error("Selected lot not found.");
          return;
        }

        let newActivity = { ...originalActivity };
        console.log(
          "trying to replicate activity...",
          JSON.stringify(newActivity)
        );
        newActivity.estado = "pendiente";
        newActivity.detalles.hectareas =
          lotWithFieldName.lot.properties.hectareas;
        newActivity.lote_uuid = lotWithFieldName.lot.properties.uuid;
        newActivity.uuid = uuid4();

        newActivity.detalles.dosis.forEach((dosis) => {
          const hectareas = newActivity.detalles.hectareas;
          const dosisValue = parseFloat(dosis.dosis.replace(",", "."));
          const total = hectareas * dosisValue;
          dosis.total = total.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        });

        const fechaEjecucion = newActivity.detalles.fecha_ejecucion_tentativa;
        const parsedDate = new Date(fechaEjecucion);
        const formattedDate = format(parsedDate, "yyyy-MM-dd");
        newActivity._id = "actividad:" + formattedDate + ":" + newActivity.uuid;
        delete newActivity._rev;

        try {
          await db.put(newActivity);
          successfulReplications.push(uuid);
          console.log("New activity replicated and saved for lot:", uuid);
          console.log("New activity:", newActivity);
          setSnackbarOpen(true);
        } catch (error) {
          console.error(
            "Error saving replicated activity for lot:",
            uuid,
            error
          );
        }
      })
    );

    if (successfulReplications.length > 0) {
      setSnackbarMessage(
        `Actividad replicada con éxito para ${successfulReplications.length} lotes.`
      );
      handleReplicateActivity();
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage(
        "No se pudo replicar la actividad para los lotes seleccionados."
      );
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setTimeout(() => {
      setSnackbarOpen(false);
    }, 3000);
  };

  const extractLots = (fields: Field[]) => {
    const allLotsWithNames = fields.flatMap((field) =>
      (field.lotes || []).map((lot) => ({ lot, fieldName: field.nombre }))
    );
    setLotsWithFieldNames(allLotsWithNames);
  };

  function isField(doc: any): doc is Field {
    return (
      doc &&
      typeof doc === "object" &&
      "_id" in doc &&
      "nombre" in doc &&
      "campo_geojson" in doc
    );
  }
  const handleToggle = (uuid: string) => {
    const currentIndex = selectedLots.indexOf(uuid);
    const newSelectedLots = [...selectedLots];

    if (currentIndex === -1) {
      newSelectedLots.push(uuid);
    } else {
      newSelectedLots.splice(currentIndex, 1);
    }

    setSelectedLots(newSelectedLots);
  };

  const filteredLotsWithFieldNames = lotsWithFieldNames.filter((item) =>
    item.fieldName.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <>
      <StyledCard>
        <GlossyEffect />
        <ContentOverlay>
          <Typography variant="h5" component="div">
            Repetir Planificación
          </Typography>
          <ModernDivider />
          <Box mb={2}>
            <TextField
              fullWidth
              label="Filtrar por nombre del campo"
              variant="outlined"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Box>
          <List>
            {filteredLotsWithFieldNames.map((item) => {
              const isSelected = selectedLots.includes(
                item.lot.properties.uuid
              );
              return (
                <ListItem
                  key={item.lot.properties.uuid}
                  button
                  onClick={() => handleToggle(item.lot.properties.uuid)}
                  selected={isSelected}
                  sx={{
                    bgcolor: isSelected ? "rgba(0, 0, 0, 0.14)" : "inherit",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.08)"
                    }
                  }}
                >
                  <ListItemText
                    primary={item.lot.properties.nombre}
                    secondary={`Nombre del Campo: ${item.fieldName}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </ContentOverlay>
      </StyledCard>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <GlossyButton
          key="cancel-operation"
          variant="contained"
          style={{ backgroundColor: "#d32f2f", color: "white" }}
          onClick={() => {
            handleReplicateActivity();
          }}
        >
          Cancelar Operación
        </GlossyButton>

        <GlossyButton
          key="confirm-plan"
          variant="contained"
          onClick={replicateActivity}
        >
          Confirmar planificación
        </GlossyButton>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ReplicateActivityMenu;
