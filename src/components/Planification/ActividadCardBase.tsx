import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { IActividadPlanificacion } from "../../interfaces/planification";
import { red } from "@mui/material/colors";
import { ActividadMoreButton } from "./ActividadMoreButton";
import { FieldPartnerColors } from "./FieldPartnerColors";
import { format, parseISO } from "date-fns";

import siembraIcon from "../../images/icons/sembradora_act.webp";
import cosechaIcon from "../../images/icons/cosechadora_act.webp";
import aplicacionIcon from "../../images/icons/pulverizadora_act.webp";
import notaIcon from "../../images/icons/iconodenotas_act.webp";
import { usePlanificationActividad } from "../../hooks/usePlanifications";

export const ActividadCardBase: React.FC = ({
  actividadId,
}: {
  actividadId: string;
}) => {

  // const actividad = usePlanificationActividad(actividadId)

  let { fecha, insumos, labores, ejecutada, totalCosto, tipo, area } = usePlanificationActividad(actividadId)

  let cardColor = FieldPartnerColors[tipo as unknown as string];

  let fechaString = format(parseISO(fecha), "dd MMMM yyyy");

  let icon = siembraIcon;

  return (
    <Card sx={{ maxWidth: 345, backgroundColor: cardColor }}>
      <CardContent>
        <Box>
          {fechaString} {ejecutada && "EJECUTADA"}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Avatar
              sx={{ bgcolor: red[500] }}
              aria-label="recipe"
              src={icon}
            ></Avatar>
            <Typography variant="h5" component="div">
              {tipo.toUpperCase()} de {area} has.
            </Typography>
          </div>

          <ActividadMoreButton
            onEdit={() => {
              console.log("EDIT ACT");
            }}
            onDelete={() => {
              console.log("DELETE ACT");
            }}
          />
        </Box>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="1" label="Insumos">
            {labores.length === 0 && <p>La actividad no tiene insumos</p>}
            {insumos.map((i) => {
              return (
                <TreeItem nodeId="2" label="Calendar">
                  <Box>
                    {i.insumoId} {i.totalCantidad} {i.totalCosto}
                  </Box>
                </TreeItem>
              );
            })}
          </TreeItem>
          <TreeItem nodeId="5" label="Labores">
            {labores.length === 0 && <p>La actividad no tiene labores</p>}
            {labores.map((i) => {
              return <TreeItem nodeId="2" label="Calendar" />;
            })}
          </TreeItem>
        </TreeView>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Chip label={"USD " + totalCosto} sx={{backgroundColor:"#01579b", color:"#FFD567"}}/>
        </Box>
      </CardContent>
    </Card>
  );
};
