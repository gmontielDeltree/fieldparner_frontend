import { Box, Divider, Fab, ListItem, Typography, Card, CardContent, Chip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Campaign } from "@types";
import { Field, Lot } from "../../interfaces/field";
import { ICiclosPlanificacion } from "../../interfaces/planification";
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

const dateToColor = (strDate: string) => {
  let year = getYear(parse(strDate, "dd/MM/yyyy", new Date()));
  let indice = year > 2023 ? year - 2023 : 0;
  return palette[indice];
};

interface LineaDeCampanaProps {
  campana: Campaign;
  lote: Lot;
  onCampaignClick: (campana: Campaign, lote: Lot, ciclo?: ICiclosPlanificacion) => void;
}

const LineaDeCampana: React.FC<LineaDeCampanaProps> = ({ campana, lote, onCampaignClick }) => {
  const { getCropLabelFromId, getCropColorFromId } = useContext(CultivoContext);
  const ciclosContext = useContext(CiclosContext);

  let ciclos = ciclosContext?.getCiclosFromCampanaAndLote?.(campana._id, lote.id) || [];

  // Debug logging
  console.log("LineaDeCampana Debug:", {
    campana: campana._id,
    campaignName: campana.name,
    lote: lote.id,
    loteName: lote.properties?.nombre,
    ciclosContext,
    ciclosFound: ciclos.length,
    ciclos
  });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        borderLeft: `3px solid #3b82f6`,
        borderRadius: "0 5px 5px 0",
        marginBottom: "6px",
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateX(2px)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          backgroundColor: "#f1f5f9"
        }
      }}
      onClick={() => onCampaignClick(campana, lote)}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
        {ciclos?.length > 0 ? (
          <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap" }}>
            {ciclos?.map((ciclo: ICiclosPlanificacion, i: number) => (
              <Box
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onCampaignClick(campana, lote, ciclo);
                }}
                sx={{
                  padding: "4px 8px",
                  backgroundColor: getCropColorFromId?.(ciclo.cultivoId) || "#666",
                  color: "white",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                  }
                }}
              >
                {getCropLabelFromId?.(ciclo.cultivoId) || "Cultivo"}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              fontStyle: "italic",
              fontSize: "0.85rem",
              flex: 1
            }}
          >
            Sin zafras planificadas
          </Typography>
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontSize: "0.7rem",
          backgroundColor: "#e2e8f0",
          padding: "2px 6px",
          borderRadius: "3px",
          color: "#64748b",
          fontWeight: 500
        }}
      >
        {ciclos?.length || 0} zafra{ciclos?.length !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
};

export const ItemPlanificationByField = ({
  campo,
  campanas,
  onCampaignClick,
}: {
  campo: Field;
  campanas: Campaign[];
  onCampaignClick: (campana: Campaign, lote: Lot, ciclo?: ICiclosPlanificacion) => void;
}) => {
  const [expandedLotes, setExpandedLotes] = useState<string[]>([]);
  const { getCropLabelFromId, getCropColorFromId } = useContext(CultivoContext);
  const ciclosContext = useContext(CiclosContext);

  const toggleLote = (loteId: string) => {
    setExpandedLotes(prev =>
      prev.includes(loteId)
        ? prev.filter(id => id !== loteId)
        : [...prev, loteId]
    );
  };

  // Ya que solo hay una campaña, la tomamos directamente
  const campana = campanas[0];
  if (!campana) return null;

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
          {campo.lotes.map((lote: Lot) => {
            const ciclos = ciclosContext?.getCiclosFromCampanaAndLote?.(campana._id, lote.id) || [];

            return (
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
                      backgroundColor: "#f1f5f9",
                      transform: "translateX(2px)" // Slight movement on hover
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
                    📍 {lote.properties.nombre}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={`${ciclos.length} zafra${ciclos.length !== 1 ? 's' : ''}`}
                      size="small"
                      color={ciclos.length > 0 ? "primary" : "default"}
                      sx={{ fontSize: "0.7rem" }}
                    />
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedLotes.includes(lote.id) ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        color: "#6b7280",
                        fontSize: "1.1rem"
                      }}
                    />
                  </Box>
                </Box>

                {/* Contenido del lote - Zafras directamente */}
                {expandedLotes.includes(lote.id) && (
                  <Box sx={{ padding: "8px 10px" }}>
                    {ciclos.length === 0 ? (
                      <Box
                        onClick={() => onCampaignClick(campana, lote)}
                        sx={{
                          padding: "12px",
                          textAlign: "center",
                          backgroundColor: "#f0f9ff", // Light blue background
                          borderRadius: "6px",
                          border: "2px dashed #3b82f6", // Blue dashed border
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#dbeafe",
                            borderColor: "#1d4ed8",
                            transform: "scale(1.02)" // Slight scale on hover
                          }
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3b82f6", // Blue text
                            fontWeight: 500,
                            fontSize: "0.85rem"
                          }}
                        >
                          ➕ Click para planificar este lote
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6b7280",
                            fontSize: "0.75rem",
                            display: "block",
                            marginTop: "2px"
                          }}
                        >
                          Sin zafras planificadas
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                        {ciclos.map((ciclo: ICiclosPlanificacion, i: number) => (
                          <Box
                            key={i}
                            onClick={() => onCampaignClick(campana, lote, ciclo)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              backgroundColor: getCropColorFromId?.(ciclo.cultivoId) || "#666",
                              color: "white",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "translateX(3px)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {getCropLabelFromId?.(ciclo.cultivoId) || "Cultivo"}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                              Zafra {i + 1}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
