import { Box, Fab, ListItem, Typography } from "@mui/material";
import React from "react";
import { Campo } from "../../../owncomponents/tipos/campos";
import { Campaign } from "@types";
import { IPlanificacion } from "../../interfaces/planification";
import { Lote } from "../../../owncomponents/tipos/lotes";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeView } from "@mui/x-tree-view/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getYear, parse } from "date-fns";

const palette = ['#00429d', '#4771b2', '#73a2c6', '#a5d5d8', '#ffffe0', '#ffbcaf', '#f4777f', '#cf3759', '#93003a']

const dateToColor = (strDate) =>{
    let year = getYear(parse(strDate,"dd/MM/yyyy",new Date()))
    let indice = year>2023 ? (year - 2023): 0;
    return palette[indice]
}
export const ItemPlanificationByField = ({
  campo,
  campanas,
  planifications,
  onCampaignClick
}: {
  campo: Campo;
  campanas: Campaign[];
  planifications: IPlanificacion[];
  onCampaignClick: ()=>void;
}) => {

 const ciclos_del_plan_de_esta_campana_y_lote = (cid,lote)=>{
    let p = planifications.find((p)=>p.campanaId === cid)
    return p?.ciclos.filter(c=>c.loteId === lote.id);
 }
  return (
    <ListItem key={campo._id} component="div" sx={{flexDirection:"column"}}>
      <Typography variant="h6">{campo.nombre}</Typography>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        
      >
        {campo.lotes.map((lote: Lote) => (
          <TreeItem nodeId={lote.id} label={lote.properties.nombre}>
            {campanas.map((c,i) =>
        <Box sx={{display:"flex", paddingX:"8px", paddingY:"5px", alignItems:"center"}}>
                <Fab variant="extended" sx={{borderRadius:"100px", backgroundColor:dateToColor(c.startDate), color:"white"}} onClick={()=>{
                    onCampaignClick(c,campo,lote)}}>{c.description}</Fab>
                {
                    ciclos_del_plan_de_esta_campana_y_lote(c._id, lote)?.map((ciclo)=>
                        <Fab variant="extended">{ciclo.cultivoId}</Fab>
                    )
                }

                {
                     ciclos_del_plan_de_esta_campana_y_lote(c._id, lote) === undefined && "No hay ciclos para esta campaña y lote"
                }
            </Box>
            )}
          </TreeItem>
        ))}
      </TreeView>
    </ListItem>
  );
};
