import React, { createContext, useEffect } from "react";
import { useCampaign } from "../../../hooks";

export const buildCampanasContextValue = (campaigns = []) => {
  const getCampanaDesc = (id) => {
    const campaign = campaigns.find((c) => c._id === id);
    return campaign?.name || id;
  };

  return { getCampanaDesc };
};

export const useListaCampanas = () => {
  const { campaigns, getCampaigns } = useCampaign();
  useEffect(() => {
    getCampaigns();
  }, []);

  return buildCampanasContextValue(campaigns);
};

export const CampanasContext = createContext();
