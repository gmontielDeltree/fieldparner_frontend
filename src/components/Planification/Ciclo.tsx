import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import React, { createContext, useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ICiclosPlanificacion,
  IActividadPlanificacion,
} from "../../interfaces/planification";
import { ActividadCardBase } from "./ActividadCardBase";
import { ActividadEditorBase } from "./ActividadEditorBase";
import ActividadEditorDialog from "./ActividadEditorDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import { CultivoContext } from "./contexts/CultivosContext";
import { useCiclos, usePlanActividad } from "../../hooks/usePlanifications";
import { CiclosContext } from "./contexts/CiclosContext";
import { format } from "date-fns";
import { Lot } from "@types";
import { useTranslation } from "react-i18next";

const ActividadContext = createContext();

export const Ciclo = ({
  ciclo,
  loteId,
  expanded,
  lote,
}: {
  ciclo: ICiclosPlanificacion;
  loteId: string;
  expanded: boolean;
  lote: Lot;
}) => {
  const [expan, setExpan] = useState(expanded);
  const { t } = useTranslation();

  console.log(ciclo);

  const { getCropLabelFromId, getCropColorFromId } = useContext(CultivoContext);

  const [actividades, setActividades] = useState<string[]>([]);
  const { removeCiclo } = useContext(CiclosContext);
  const { getCicloSortedActivities } = usePlanActividad()

  useEffect(() => {
    if (ciclo.actividadesIds?.length > 0) {
      getCicloSortedActivities(ciclo).then((a) => setActividades(a))
    }
  }, [ciclo])

  return (
    <Accordion
      sx={{
        backgroundColor: getCropColorFromId?.(ciclo.cultivoId),
        marginBottom: 1,
        borderRadius: "8px !important",
        "&:before": { display: "none" }
      }}
      expanded={expan}
      onChange={(_, e) => setExpan(e)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "8px 8px 0 0",
          minHeight: 48
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('harvest')} {getCropLabelFromId?.(ciclo.cultivoId)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(() => {
                const safe = (d: any) => {
                  try {
                    if (!d) return 'N/A';
                    const dt = new Date(d);
                    if (isNaN(dt.getTime())) return 'N/A';
                    return format(dt, 'dd/MM/yyyy');
                  } catch {
                    return 'N/A';
                  }
                };
                return `${safe(ciclo.fechaInicio)} - ${safe(ciclo.fechaFin)}`;
              })()}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {t('activitiesCount', { count: ciclo.actividadesIds?.length || 0 })}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: "rgba(255,255,255,0.95)" }}>
        {/* Header de gestión de actividades */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                🌾 {t('activitiesManagement')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('planAndManageActivities')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => removeCiclo?.(ciclo._id)}
              color="error"
              size="small"
              sx={{ borderRadius: "8px" }}
            >
              {t('deleteCycle')}
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ActividadEditorDialog
              cicloId={ciclo._id}
              campanaId={ciclo.campanaId}
              loteId={loteId}
              campoId={lote.properties.campo_parent_id}
              ciclo={ciclo}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {t('plannedActivity', { count: ciclo.actividadesIds?.length || 0 })}
            </Typography>
          </Box>
        </Box>

        {/* Lista de actividades */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            backgroundColor: "rgba(248, 250, 252, 0.8)",
            borderRadius: "12px",
            padding: ciclo.actividadesIds?.length ? "20px" : "24px",
            border: "1px solid #e2e8f0",
            marginTop: "8px", // Added margin top to separate from header
          }}
        >
          {actividades.map((a, i) => {
            return (
              <Box key={a} sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden",
                marginBottom: "4px" // Added margin bottom for better spacing between cards
              }}>
                <ActividadCardBase actividadId={a} />
              </Box>
            );
          })}

          {!ciclo.actividadesIds?.length && (
            <Box sx={{
              textAlign: "center",
              py: 3,
              color: "text.secondary"
            }}>
              <Typography variant="h6" sx={{ mb: 1, opacity: 0.7 }}>
                📝 {t('noPlannedActivities')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                {t('startPlanningPrompt')}
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
