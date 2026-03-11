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
import React, { useContext, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  IActividadPlanificacion,
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
}: {
  actividadId: string;
  selectionMode?: boolean;
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
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            sx={{
              "& .MuiTreeItem-content": {
                borderRadius: "8px",
                py: 0.2,
              },
              "& .MuiTreeItem-content:hover": {
                backgroundColor: alpha(cardColor || "#94a3b8", 0.08),
              },
              "& .MuiTreeItem-label": {
                fontWeight: 600,
              },
            }}
          >
            <TreeItem nodeId="10" label={t("contractor")}>
              {!contratista && <p>{t("noContractorAssigned")}</p>}
              {contratista?.razonSocial?.length
                ? contratista?.razonSocial
                : contratista?.nombreCompleto}
            </TreeItem>

            <TreeItem nodeId="1" label={t("supplies")}>
              {lineasInsumos?.length === 0 && (
                <p>{t("noSuppliesForActivity")}</p>
              )}
              {lineasInsumos?.map((i, indec) => {
                // console.log(i,lineasInsumos)
                let insumo = getInsumoFromId(i.insumoId);
                return (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box>{insumo?.name}</Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                      }}
                    >
                      {/* {i.totalCantidad?.toFixed(2)} {insumo?.unitMeasurement} */}
                      <Box sx={{ fontWeight: "bold" }}>
                        USD {i.totalCosto?.toFixed(2)}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </TreeItem>
            <TreeItem nodeId="5" label={t("services")}>
              {lineasLabores?.length === 0 && (
                <p>{t("noServicesForActivity")}</p>
              )}
              {lineasLabores?.map((i, indec) => {
                return (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box>{getLaborLabelFromId(i.laborId)}</Box>
                    <Box>
                      <Box sx={{ fontWeight: "bold" }}>
                        USD {i.totalCosto?.toFixed(2)}
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
