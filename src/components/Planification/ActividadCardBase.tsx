import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import React, { useContext } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { IActividadPlanificacion, IInsumosPlanificacion, ILaboresPlanificacion } from "../../interfaces/planification";
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

const calcTotal =(linInsumos : IInsumosPlanificacion[], linLabores : ILaboresPlanificacion[])=>{
  let totalI = linInsumos.reduce((acc,lin)=>lin.totalCosto + acc,0)
  let totalL = linLabores.reduce((acc,lin)=>lin.totalCosto + acc,0)
  return totalI + totalL
}

export const ActividadCardBase: React.FC = ({
  actividadId,
  selectionMode
}: {
  actividadId: string,
  selectionMode? : boolean
}) => {
  // const actividad = usePlanificationActividad(actividadId)
  const { removeActividad } = usePlanActividad();
  const { getInsumoFromId } = useContext(InsumosContext);
  const { getLaborLabelFromId } = useContext(LaboresContext);

  const {refreshCiclos} = useContext(CiclosContext) // useCiclos(ciclo.campanaId,loteId)


  let {
    fecha,
    insumosLineasIds,
    laboresLineasIds,
    ejecutada,
    totalCosto,
    tipo,
    area,
    contratistaId,
    rindeEstimado,
    precioEstimadoCosecha,
    lineasInsumos,
    lineasLabores,
    loading,
  } = usePlanificationActividad(actividadId);

  let cardColor = FieldPartnerColors[tipo as unknown as string];

  const fechaString = (fechaa) => format(parseISO(fechaa), "dd MMMM yyyy");

  let icon = siembraIcon;

  if (loading) return <div>Loading</div>;
  return (
    <Card
      sx={{ maxWidth: "100%", minWidth: "50%", backgroundColor: cardColor }}
    >
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
            <Typography
              variant="h5"
              component="div"
              onClick={() => console.log(actividadId)}
            >
              {tipo.toUpperCase()} de {area} has.
            </Typography>
          </div>

          <ActividadMoreButton
            onEdit={() => {
              console.log("EDIT ACT");
            }}
            onDelete={() => {
              console.log("DELETE ACT");
              removeActividad(actividadId).then(refreshCiclos);
            }}
          />
        </Box>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          
          <TreeItem nodeId="10" label="Contratista">
            {!contratistaId && (
              <p>No contractor</p>
            )}
           {contratistaId}
          </TreeItem>

          <TreeItem nodeId="1" label="Insumos">
            {lineasInsumos?.length === 0 && (
              <p>La actividad no tiene insumos</p>
            )}
            {lineasInsumos?.map((i, indec) => {
              // console.log(i,lineasInsumos)
              let insumo = getInsumoFromId(i.insumoId)
              return (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>{insumo?.name}</Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", gap:"1rem" }}>
                    {/* {i.totalCantidad?.toFixed(2)} {insumo?.unitMeasurement} */}
                    <Box sx={{ fontWeight: "bold" }}>
                      USD {i.totalCosto?.toFixed(2)}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </TreeItem>
          <TreeItem nodeId="5" label="Labores">
            {lineasLabores?.length === 0 && (
              <p>La actividad no tiene labores</p>
            )}
            {lineasLabores?.map((i, indec) => {
              return (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap:"0.2rem" }}>

        {precioEstimadoCosecha &&
        <Chip
            label={precioEstimadoCosecha?.toFixed(2) + " USD/tn"}
            title="Precio Estimado"
            sx={{ backgroundColor: "#436716", color: "#FFD567", fontWeight:"bold" }}
          />}

          {rindeEstimado &&
        <Chip
            label={ rindeEstimado?.toFixed(2) + " tn/ha" }
            title="Rinde Estimado"
            sx={{ backgroundColor: "#16672f", color: "#FFD567", fontWeight:"bold" }}
          />}
          <Chip
            title="Costo Total"
            label={"USD " + calcTotal(lineasInsumos,lineasLabores)?.toFixed(2)}
            sx={{ backgroundColor: "#01579b", color: "#FFD567", fontWeight:"bold" }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
