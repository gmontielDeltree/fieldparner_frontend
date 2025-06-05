import { Box, Divider, Fab, ListItem, Typography, Card, CardContent, Chip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Campo } from "../../../owncomponents/tipos/campos";
import { Campaign } from "@types";
import { ICiclosPlanificacion } from "../../interfaces/planification";
import { Lote } from "../../../owncomponents/tipos/lotes";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getYear, parse } from "date-fns";
import { useCiclos } from "../../hooks/usePlanifications";
import { CultivoContext } from "./contexts/CultivosContext";
import { CiclosContext } from "./contexts/CiclosContext";
import FieldOutlineIcon from "../FieldsSideMenu/fieldoutlineicon";

const palette = [
  "#00429d",
  "#4771b2",
  "#73a2c6",
  "#a5d5d8",
  "#ffffe0",
  "#ffbcaf",
  "#f4777f",
  "#cf3759",
  "#93003a",
];

const dateToColor = (strDate) => {
  let year = getYear(parse(strDate, "dd/MM/yyyy", new Date()));
  let indice = year > 2023 ? year - 2023 : 0;
  return palette[indice];
};

const LineaDeCampana: React.FC = ({ campana, lote, onCampaignClick }) => {
  const { getCropLabelFromId, getCropColorFromId } = useContext(CultivoContext);
  const { getCiclosFromCampanaAndLote } = useContext(CiclosContext);

  let ciclos = getCiclosFromCampanaAndLote(campana._id, lote.id);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px 8px",
        background: `linear-gradient(135deg, ${dateToColor(campana.startDate)}10, ${dateToColor(campana.startDate)}03)`,
        borderLeft: `3px solid ${dateToColor(campana.startDate)}`,
        borderRadius: "0 5px 5px 0",
        marginBottom: "4px",
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateX(2px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
        }
      }}
      onClick={() => onCampaignClick(campana, lote)}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: dateToColor(campana.startDate),
            minWidth: "55px",
            fontSize: "0.75rem"
          }}
        >
          {campana.name}
        </Typography>

        {ciclos?.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.4 }}>
            {ciclos?.map((ciclo, i) => (
              <Box
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onCampaignClick(campana, lote, ciclo);
                }}
                sx={{
                  padding: "2px 5px",
                  backgroundColor: getCropColorFromId(ciclo.cultivoId),
                  color: "white",
                  borderRadius: "3px",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
                  }
                }}
              >
                {getCropLabelFromId(ciclo.cultivoId)}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {!ciclos?.length && (
        <Typography variant="caption" color="textSecondary" sx={{ fontStyle: "italic", fontSize: "0.7rem" }}>
          Sin zafras
        </Typography>
      )}
    </Box>
  );
};

export const ItemPlanificationByField = ({
  campo,
  campanas,
  onCampaignClick,
}: {
  campo: Campo;
  campanas: Campaign[];
  onCampaignClick: () => void;
}) => {
  const [expandedLotes, setExpandedLotes] = useState<string[]>([]);

  const toggleLote = (loteId: string) => {
    setExpandedLotes(prev =>
      prev.includes(loteId)
        ? prev.filter(id => id !== loteId)
        : [...prev, loteId]
    );
  };

  return (
    <Box
      sx={{
        marginTop: 2,
        marginBottom: 1.5,
        borderRadius: "8px",
        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
          borderColor: "#cbd5e1"
        }
      }}
    >
      {/* Header compacto */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "10px 14px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginRight: 2,
          }}
        >
          <FieldOutlineIcon field={campo} size={24} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#1e293b",
              fontSize: "1rem",
              lineHeight: 1.2
            }}
          >
            {campo.nombre}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontWeight: 500,
                fontSize: "0.8rem"
              }}
            >
              {campo.campo_geojson.properties.hectareas.toFixed(1)} ha
            </Typography>
            <Chip
              label={`${campo.lotes.length} lotes`}
              size="small"
              sx={{
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                fontWeight: 500,
                fontSize: "0.7rem",
                height: "18px"
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Grid de lotes optimizado */}
      <Box sx={{ padding: "10px 14px" }}>
        <Box
          sx={{
            display: "grid",
            gap: 1.2,
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))"
          }}
        >
          {campo.lotes.map((lote: Lote) => (
            <Box
              key={lote.id}
              sx={{
                borderRadius: "7px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#cbd5e1",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }
              }}
            >
              {/* Header del lote */}
              <Box
                onClick={() => toggleLote(lote.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f1f5f9"
                  }
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.85rem"
                  }}
                >
                  {lote.properties.nombre}
                </Typography>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedLotes.includes(lote.id) ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    color: "#6b7280",
                    fontSize: "1.1rem"
                  }}
                />
              </Box>

              {/* Contenido del lote */}
              {expandedLotes.includes(lote.id) && (
                <Box sx={{ padding: "8px 10px" }}>
                  {campanas.map((c) => (
                    <LineaDeCampana
                      key={c._id}
                      campana={c}
                      lote={lote}
                      onCampaignClick={onCampaignClick}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
