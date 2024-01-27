import { Box, Fab, ListItem, Typography } from "@mui/material";
import React from "react";
import { Campo } from "../../../owncomponents/tipos/campos";
import { Campaign } from "@types";
import {
  ICiclosPlanificacion
} from "../../interfaces/planification";
import { Lote } from "../../../owncomponents/tipos/lotes";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeView } from "@mui/x-tree-view/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getYear, parse } from "date-fns";
import { useCiclos } from "../../hooks/usePlanifications";

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
  const [ciclos, refreshCiclos]= useCiclos(campana._id, lote.id);

  return (
    <Box
      sx={{
        display: "flex",
        paddingX: "8px",
        paddingY: "5px",
        alignItems: "center",
      }}
    >
      <Fab
        variant="extended"
        sx={{
          borderRadius: "100px",
          backgroundColor: dateToColor(campana.startDate),
          color: "white",
        }}
        onClick={()=>{onCampaignClick(campana, lote)}}
      >
        {campana.description}
      </Fab>
      {ciclos?.map((ciclo,i) => <Fab key={i} variant="extended">{ciclo.cultivoId}</Fab>)}

      {!ciclos.length && "No hay ciclos para esta campaña y lote"}
    </Box>
  );
};

const LineaLote: React.FC = ({ lote, campanas, onCampaignClick }) => {
  return (
    <TreeItem nodeId={lote.id} label={lote.properties.nombre}>
      {campanas.map((c, i) => (
        <LineaDeCampana key={i} campana={c} lote={lote} onCampaignClick={onCampaignClick} />
      ))}
    </TreeItem>
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

  return (
    <ListItem key={campo._id} component="div" sx={{ flexDirection: "column" }}>
      <Typography variant="h6">{campo.nombre}</Typography>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {campo.lotes.map((lote: Lote, i) => (
          <LineaLote key={i} lote={lote} campanas={campanas} onCampaignClick={onCampaignClick} />
        ))}
      </TreeView>
    </ListItem>
  );
};
