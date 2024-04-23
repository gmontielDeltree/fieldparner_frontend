import { Box, Divider, Fab, ListItem, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Campo } from "../../../owncomponents/tipos/campos";
import { Campaign } from "@types";
import { ICiclosPlanificacion } from "../../interfaces/planification";
import { Lote } from "../../../owncomponents/tipos/lotes";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeView } from "@mui/x-tree-view/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getYear, parse } from "date-fns";
import { useCiclos } from "../../hooks/usePlanifications";
import { CultivoContext } from "./contexts/CultivosContext";
import { CiclosContext } from "./contexts/CiclosContext";

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
        paddingX: "8px",
        paddingY: "5px",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Fab
        variant="extended"
        sx={{
          borderRadius: "100px",
          backgroundColor: dateToColor(campana.startDate),
          color: "white",
          height: "2.5rem",
        }}
        onClick={() => {
          onCampaignClick(campana, lote);
        }}
      >
        {campana.name}
      </Fab>

      {ciclos?.length > 0 && (
        <Box
          sx={{ display: "flex", justifyContent: "space-around", flexGrow: 1 }}
        >
          {ciclos?.map((ciclo, i) => (
            <Fab
              key={i}
              variant="extended"
              onClick={() => onCampaignClick(campana, lote, ciclo)}
              sx={{
                borderRadius: "4px",
                height: "1.9rem",
                backgroundColor: getCropColorFromId(ciclo.cultivoId),
              }}
            >
              {getCropLabelFromId(ciclo.cultivoId)}
            </Fab>
          ))}
        </Box>
      )}

      {!ciclos?.length && <Box>No hay ciclos para esta campaña y lote</Box>}
    </Box>
  );
};

const LineaLote: React.FC = ({ lote, campanas, onCampaignClick }) => {
  return (
    <>
      {campanas.map((c) => (
        <LineaDeCampana
          key={c._id}
          campana={c}
          lote={lote}
          onCampaignClick={onCampaignClick}
        />
      ))}
    </>
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
    <Box>
      <Typography variant="subtitle1">{campo.nombre}</Typography>
      <TreeView
        // defaultExpanded={campo.lotes.map((l) => l.id)}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {campo.lotes.map((lote: Lote) => (
          <TreeItem nodeId={lote.id} label={lote.properties.nombre}>
            <LineaLote
              key={lote.id}
              lote={lote}
              campanas={campanas}
              onCampaignClick={onCampaignClick}
            />
          </TreeItem>
        ))}
      </TreeView>
      <Divider variant="middle" component={"div"}></Divider>
    </Box>
  );
};
