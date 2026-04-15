import React, { useEffect, useMemo, useState } from "react";
import { PlanificationByField } from "../components/Planification/PlanificationByField";
import { Grid, Paper } from "@mui/material";
import { useField } from "../hooks/useField";
import { useAppSelector, useCampaign } from "../hooks";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CultivoContext } from "../components/Planification/contexts/CultivosContext";
import { useCrops } from "../hooks/useCrops";
import {
  CampanasContext,
  buildCampanasContextValue,
} from "../components/Planification/contexts/CampanasContext";
import {
  InsumosContext,
  useInsumos,
} from "../components/Planification/contexts/InsumosContext";
import { LaboresContext } from "../components/Planification/contexts/LaboresContext";
import { useLabores } from "../hooks/useLabores";
import { CiclosContext } from "../components/Planification/contexts/CiclosContext";
import { useListaDeCiclos } from "../hooks/usePlanifications";

import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useTranslation } from "react-i18next";
import { PlanificationByFieldForLotPage } from "../components/Planification/PlanificationByFieldForLotPage";

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const PlanificationByLotPage: React.FC = () => {
  const navigation = useNavigate();
  let { parentId, loteId2 } = useParams();
  let query = useQuery();

  const { fields, getFields } = useField();
  const { campaigns, getCampaigns } = useCampaign();
  const campanasContextValue = useMemo(
    () => buildCampanasContextValue(campaigns),
    [campaigns],
  );

  const [selCampanaId, setSelCampanaId] = useState();
  const [selCampoId, setSelCampoId] = useState();
  const [selLoteId, setSelLoteId] = useState();
  const [selCicloId, setSelCicloId] = useState();

  const { selectedCampaign } = useAppSelector((state) => state.campaign);

  const ciclos = useListaDeCiclos();

  useEffect(() => {
    getFields();
    getCampaigns();
  }, []);

  useEffect(() => {
    if (fields?.length) {
      console.log("campos", fields);

      console.log(
        "campoid, loteid, campaña ",
        loteId2,
        parentId,
        selectedCampaign,
      );
    }
  }, [fields, campaigns]);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const crops = useCrops();

  const handleClose = () => {
    navigate(query.get("backUrl"));
  };

  return (
    <CultivoContext.Provider value={crops}>
      <CampanasContext.Provider value={campanasContextValue}>
        <InsumosContext.Provider value={useInsumos()}>
          <LaboresContext.Provider value={useLabores()}>
            <CiclosContext.Provider value={useListaDeCiclos()}>
              <Dialog onClose={handleClose} open={true}>
                {selectedCampaign && parentId && loteId2 && (
                  <Paper>
                    <PlanificationByFieldForLotPage
                      name={selectedCampaign?.name}
                      fieldId={parentId}
                      loteId={loteId2}
                      loteSelected={loteId2}
                      onlyLoteSelected
                      onClose={handleClose}
                    />
                  </Paper>
                )}
              </Dialog>
            </CiclosContext.Provider>
          </LaboresContext.Provider>
        </InsumosContext.Provider>
      </CampanasContext.Provider>
    </CultivoContext.Provider>
  );
};
