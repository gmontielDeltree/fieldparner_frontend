import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
  alpha,
} from "@mui/material";
import React, { useContext, useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  IInsumosPlanificacion,
  ILaboresPlanificacion,
} from "../../interfaces/planification";
import { red } from "@mui/material/colors";
import { ActividadMoreButton } from "./ActividadMoreButton";
import { FieldPartnerColors } from "./FieldPartnerColors";
import { format, parseISO } from "date-fns";

import siembraIcon from "../../images/icons/sembradora_act.webp";
import cosechaIcon from "../../images/icons/cosechadora_act.webp";
import aplicacionIcon from "../../images/icons/pulverizadora_act.webp";
import notaIcon from "../../images/icons/iconodenotas_act.webp";
import {
  usePlanActividad,
  usePlanificationActividad,
} from "../../hooks/usePlanifications";
import { InsumosContext } from "./contexts/InsumosContext";
import { LaboresContext } from "./contexts/LaboresContext";
import { CiclosContext } from "./contexts/CiclosContext";
import { useTranslation } from "react-i18next";
import { ActividadEditorDialogNoButton } from "./ActividadEditorDialog";
import { useOutletContext } from "react-router-dom";

const calcTotal = (
  linInsumos: IInsumosPlanificacion[],
  linLabores: ILaboresPlanificacion[],
) => {
  let totalI = linInsumos.reduce((acc, lin) => lin.totalCosto + acc, 0);
  let totalL = linLabores.reduce((acc, lin) => lin.totalCosto + acc, 0);
  return totalI + totalL;
};

export const ActividadCardBase: React.FC = ({
  actividadId,
  selectionMode,
  fieldName,
  lotName,
}: {
  actividadId: string;
  selectionMode?: boolean;
  fieldName?: string;
  lotName?: string;
}) => {
  const { t } = useTranslation();
  // const actividad = usePlanificationActividad(actividadId)
  const { removeActividad } = usePlanActividad();
  const { getInsumoFromId } = useContext(InsumosContext);
  const { getLaborLabelFromId } = useContext(LaboresContext);

  const { refreshCiclos } = useContext(CiclosContext); // useCiclos(ciclo.campanaId,loteId)

  const [editing, setEditing] = useState(false);

  let {
    fecha,
    insumosLineasIds,
    laboresLineasIds,
    ejecutada,
    totalCosto,
    tipo,
    loteId,
    campoId,
    area,
    contratista,
    rindeEstimado,
    precioEstimadoCosecha,
    lineasInsumos,
    lineasLabores,
    loading,
    actividad,
    refreshActividad,
  } = usePlanificationActividad(actividadId);

  const { refreshCallback } = useOutletContext();

  let cardColor = FieldPartnerColors[tipo as unknown as string];

  const fechaString = (fechaa) => format(parseISO(fechaa), "dd MMMM yyyy");

  const iconByType = {
    siembra: siembraIcon,
    cosecha: cosechaIcon,
    aplicacion: aplicacionIcon,
    nota: notaIcon,
  };
  const icon = iconByType[tipo as keyof typeof iconByType] || siembraIcon;
  const totalInsumosCantidad =
    lineasInsumos?.reduce((acc, lin: any) => acc + Number(lin.totalCantidad || 0), 0) || 0;
  const totalLaboresHectareas =
    lineasLabores?.reduce((acc, lin: any) => acc + Number(lin.hectareas || 0), 0) || 0;
  const resolvedNames = useMemo(() => {
    return {
      fieldName: fieldName || campoId || "",
      lotName: lotName || loteId || "",
    };
  }, [fieldName, campoId, lotName, loteId]);

  if (loading) return <div>Loading</div>;
  return (
    <>
      <ActividadEditorDialogNoButton
        open={editing}
        actividad={actividad}
        handleClose={() => setEditing(false)}
        refreshCiclos={() => {
          refreshActividad();
        }}
        editing={true}
      />
      <Card
        sx={{
          maxWidth: "100%",
          minWidth: "50%",
          borderRadius: "14px",
          border: `1px solid ${alpha(cardColor || "#94a3b8", 0.28)}`,
          background: `linear-gradient(180deg, ${alpha(cardColor || "#94a3b8", 0.14)} 0%, rgba(255,255,255,0.98) 40%)`,
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.10)",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16)",
          },
        }}
      >
        <CardContent sx={{ p: 2.2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.2,
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {fechaString(fecha)}
            </Typography>
            <Chip
              size="small"
              label={ejecutada ? t("executed") : t("planned")}
              sx={{
                fontWeight: 700,
                height: 24,
                backgroundColor: ejecutada ? alpha("#16a34a", 0.14) : alpha("#f59e0b", 0.15),
                color: ejecutada ? "#166534" : "#92400e",
                border: `1px solid ${ejecutada ? alpha("#16a34a", 0.35) : alpha("#f59e0b", 0.35)}`,
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(cardColor || red[500], 0.15),
                  border: `1px solid ${alpha(cardColor || red[500], 0.35)}`,
                  width: 42,
                  height: 42,
                }}
                aria-label="recipe"
                src={icon}
              ></Avatar>
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                onClick={() => console.log(actividadId)}
              >
                {tipo.toUpperCase()} de {area} has.
              </Typography>
            </div>

            <ActividadMoreButton
              onProgramar={() => {
                alert(
                  "TIENEN QUE TERMINAR DE MODIFICAR LAS ACTIVIDADES DE LOTE. Cuando lo terminen lo implemento. Gracias!!!",
                );
              }}
              onEdit={() => {
                console.log("EDIT ACT");
                setEditing(true);
              }}
              onDelete={() => {
                console.log("DELETE ACT");
                removeActividad(actividadId).then(refreshCiclos);
              }}
            />
          </Box>
          <Divider sx={{ mb: 1.2, opacity: 0.5 }} />
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1.3 }}>
            <Chip
              size="small"
              label={`${t("supplies")}: ${lineasInsumos?.length || 0}`}
              sx={{ backgroundColor: alpha(cardColor || "#94a3b8", 0.09), fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={`${t("services")}: ${lineasLabores?.length || 0}`}
              sx={{ backgroundColor: alpha(cardColor || "#94a3b8", 0.09), fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={`${t("supplies")} ${t("_total_quantity")}: ${totalInsumosCantidad.toFixed(2)}`}
              sx={{
                backgroundColor: alpha("#0f172a", 0.08),
                border: `1px solid ${alpha("#0f172a", 0.12)}`,
                fontWeight: 700,
              }}
            />
            {totalLaboresHectareas > 0 && (
              <Chip
                size="small"
                label={`${t("hectares")} ${t("services")}: ${totalLaboresHectareas.toFixed(2)} ha`}
                sx={{ backgroundColor: alpha("#0ea5e9", 0.1), fontWeight: 600 }}
              />
            )}
            {!!loteId && (
              <Chip
                size="small"
                label={`${t("_lot")}: ${resolvedNames.lotName}`}
                variant="outlined"
                sx={{ maxWidth: 190 }}
              />
            )}
            {!!campoId && (
              <Chip
                size="small"
                label={`${t("_field")}: ${resolvedNames.fieldName}`}
                variant="outlined"
                sx={{ maxWidth: 220 }}
              />
            )}
          </Box>
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            sx={{
              "& .MuiTreeItem-root": {
                mb: 0.7,
              },
              "& .MuiTreeItem-content": {
                borderRadius: "10px",
                py: 0.5,
                px: 0.8,
                border: `1px solid ${alpha(cardColor || "#94a3b8", 0.16)}`,
                backgroundColor: alpha(cardColor || "#94a3b8", 0.04),
                transition: "all .2s ease",
              },
              "& .MuiTreeItem-content:hover": {
                backgroundColor: alpha(cardColor || "#94a3b8", 0.10),
              },
              "& .MuiTreeItem-content.Mui-expanded": {
                backgroundColor: alpha(cardColor || "#94a3b8", 0.12),
              },
              "& .MuiTreeItem-label": {
                fontWeight: 600,
                width: "100%",
              },
              "& .MuiTreeItem-group": {
                ml: 1.2,
                pl: 1.2,
                borderLeft: `2px solid ${alpha(cardColor || "#94a3b8", 0.22)}`,
              },
            }}
          >
            <TreeItem
              nodeId={`${actividadId}-contractor`}
              label={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{t("contractor")}</Typography>
                  <Chip size="small" label={contratista ? t("assigned") : t("notAvailable")} />
                </Box>
              }
            >
              {!contratista && <p>{t("noContractorAssigned")}</p>}
              {contratista?.razonSocial?.length
                ? contratista?.razonSocial
                : contratista?.nombreCompleto}
            </TreeItem>

            <TreeItem
              nodeId={`${actividadId}-supplies`}
              label={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{t("supplies")}</Typography>
                  <Chip size="small" label={`${lineasInsumos?.length || 0} ${t("_lines")}`} />
                </Box>
              }
            >
              {lineasInsumos?.length === 0 && (
                <p>{t("noSuppliesForActivity")}</p>
              )}
              {lineasInsumos?.map((i, indec) => {
                // console.log(i,lineasInsumos)
                let insumo = getInsumoFromId(i.insumoId);
                return (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: "8px",
                      px: 1,
                      py: 0.7,
                      mb: 0.5,
                      backgroundColor: alpha("#0f172a", 0.03),
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2 }}>
                      <Box sx={{ fontWeight: 600 }}>
                        {indec + 1}. {insumo?.name || t("supply")}
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                        {i.dosis !== undefined && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${t("dose")}${Number(i.dosis || 0).toFixed(2)} ${insumo?.unitMeasurement || ""}/ha`}
                          />
                        )}
                        {i.hectareas !== undefined && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${t("hectares")}: ${Number(i.hectareas || 0).toFixed(2)}`}
                          />
                        )}
                        {i.totalCantidad !== undefined && (
                          <Chip
                            size="small"
                            label={`${t("_total_quantity")}: ${Number(i.totalCantidad || 0).toFixed(2)} ${insumo?.unitMeasurement || ""}`}
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </TreeItem>
            <TreeItem
              nodeId={`${actividadId}-services`}
              label={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{t("services")}</Typography>
                  <Chip size="small" label={`${lineasLabores?.length || 0} ${t("_lines")}`} />
                </Box>
              }
            >
              {lineasLabores?.length === 0 && (
                <p>{t("noServicesForActivity")}</p>
              )}
              {lineasLabores?.map((i, indec) => {
                return (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: "8px",
                      px: 1,
                      py: 0.7,
                      mb: 0.5,
                      backgroundColor: alpha("#0f172a", 0.03),
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2, width: "100%" }}>
                      <Box sx={{ fontWeight: 600 }}>
                        {indec + 1}. {getLaborLabelFromId(i.laborId)}
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                        <Chip
                          size="small"
                          label={`${t("hectares")}: ${(Number(i.hectareas || i.area || area) || 0).toFixed(2)} ha`}
                          sx={{ fontWeight: 700 }}
                        />
                        {i.comentario && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${t("observations")}: ${String(i.comentario).slice(0, 36)}${String(i.comentario).length > 36 ? "..." : ""}`}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </TreeItem>
          </TreeView>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem", mt: 1 }}
          >
            {precioEstimadoCosecha && (
              <Chip
                label={precioEstimadoCosecha?.toFixed(2) + " USD/tn"}
                title="Precio Estimado"
                sx={{
                  backgroundColor: alpha("#166534", 0.14),
                  color: "#14532d",
                  border: `1px solid ${alpha("#166534", 0.22)}`,
                  fontWeight: "bold",
                }}
              />
            )}

            {rindeEstimado && (
              <Chip
                label={rindeEstimado?.toFixed(2) + " tn/ha"}
                title="Rinde Estimado"
                sx={{
                  backgroundColor: alpha("#0f766e", 0.14),
                  color: "#115e59",
                  border: `1px solid ${alpha("#0f766e", 0.22)}`,
                  fontWeight: "bold",
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
