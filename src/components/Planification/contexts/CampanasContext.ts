import React, { createContext, useEffect } from "react";
import { useCampaign } from "../../../hooks";

export const useListaCampanas = () => {
  const { campaigns, getCampaigns } = useCampaign();

  const getCampanaDesc = (id) => {
    let c = campaigns.find((c) => c._id === id);
    if (c) {
      return c.name;
    } else {
      return id;
    }
  };
  useEffect(() => {
    getCampaigns();
  }, []);

  return { getCampanaDesc };
};

export const CampanasContext = createContext();
