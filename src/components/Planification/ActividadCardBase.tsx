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
import { usePlanActividad, usePlanificationActividad } from "../../hooks/usePlanifications";


export const ActividadCardBase: React.FC = ({
  actividadId,
}: {
  actividadId: string;
}) => {

  // const actividad = usePlanificationActividad(actividadId)
 const {removeActividad} = usePlanActividad()
let { fecha, insumosLineasIds, laboresLineasIds, ejecutada, totalCosto, tipo, area, lineasInsumos, lineasLabores,loading } = usePlanificationActividad(actividadId)

  let cardColor = FieldPartnerColors[tipo as unknown as string];

  const fechaString  = (fechaa)=> format(parseISO(fechaa), "dd MMMM yyyy");

  let icon = siembraIcon;

  if(loading) return <div>Loading</div>
  return (
    <Card sx={{ maxWidth: "100%", minWidth:"50%", backgroundColor: cardColor }}>
      <CardContent>
        <Box>
          {fechaString(fecha)} {ejecutada && "EJECUTADA"}
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
              removeActividad(actividadId)
            }}
          />
        </Box>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="1" label="Insumos">
            {lineasInsumos?.length === 0 && <p>La actividad no tiene insumos</p>}
            {lineasInsumos?.map((i,indec) => {
              // console.log(i,lineasInsumos)
              return (
                  <Box>
                    {i.hectareas} {i.totalCantidad?.toFixed(2)} {i.totalCosto?.toFixed(2)}
                  </Box>
              );
            })}
          </TreeItem>
          <TreeItem nodeId="5" label="Labores">
            {lineasLabores?.length === 0 && <p>La actividad no tiene labores</p>}
            {lineasLabores?.map((i,indec) => {
              
              return <Box>
                {i.totalCosto}
              </Box>
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
