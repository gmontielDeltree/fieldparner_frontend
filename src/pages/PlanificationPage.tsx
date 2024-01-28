import React, { useEffect, useState } from "react";
import { PlanificationByField } from "../components/Planification/PlanificationByField";
import {
  Box,
  Divider,
  Grid,
  IconButton, Paper,
  Typography
} from "@mui/material";
import { useField } from "../hooks/useField";
import { useCampaign } from "../hooks";
import { ItemPlanificationByField } from "../components/Planification/ItemPlanificationByField";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CultivoContext } from "../components/Planification/contexts/CultivosContext";
import { useCrops } from "../hooks/useCrops";
import { CampanasContext } from "../components/Planification/contexts/CampanasContext";






export const PlanificationPage: React.FC = () => {
  const navigation = useNavigate();

  const { fields, getFields } = useField();
  const { campaigns, getCampaigns } = useCampaign();

  const [selCampanaId, setSelCampanaId] = useState();
  const [selCampoId, setSelCampoId] = useState();

  useEffect(() => {
    getCampaigns();
    getFields();
  }, []);

  useEffect(() => {
    console.log("campos", fields);
    console.log("campañas", campaigns);
  }, [fields, campaigns]);

  return (
    <CultivoContext.Provider value={useCrops()}>
      <CampanasContext.Provider value={useCampaign()}>
         <Grid container sx={{ position: "relative" }} spacing={"2rem"}>
        <Grid item sx={{ maxHeight: "100%" }}>
          <Paper sx={{ maxHeight: "100%" }}>
            <Box
              sx={{
                paddingY: "8px",
                paddingX: "1rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h5">
                Planificación Anual de Campañas
              </Typography>

              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Divider variant="middle" component={"div"}></Divider>
            <Box sx={{ maxHeight: "100%", overflowY: "auto", paddingX:"1rem" }}>
              {fields === undefined && <li>"No hay campos"</li>}
              {fields?.map((campo, i) => (
                <ItemPlanificationByField
                  key={i}
                  campo={campo}
                  campanas={campaigns}
                  onCampaignClick={(campana, lote) => {
                    setSelCampanaId(campana._id);
                    setSelCampoId(campo._id);
                    console.log("CLICK!!!", campana, campo);
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {selCampanaId && selCampoId && (
          <Grid item xs={6} sx={{paddingTop:"3rem"}}>
            <Paper>
              <PlanificationByField
                campaignId={selCampanaId}
                fieldId={selCampoId}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      </CampanasContext.Provider>
    </CultivoContext.Provider>
   
  );
};
