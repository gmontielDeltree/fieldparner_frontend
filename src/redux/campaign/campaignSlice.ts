import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Campaign } from "@types";

interface CampaignState {
  selectedCampaign: Campaign | null;
  campaigns: Campaign[];
}

const initialState: CampaignState = {
  selectedCampaign: null,
  campaigns: []
};

export const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    setSelectedCampaign: (state, action: PayloadAction<Campaign>) => {
      state.selectedCampaign = action.payload;
    },
    removeSelectedCampaign: (state) => {
      state.selectedCampaign = null;
    },
    loadCampaigns: (state, action: PayloadAction<Campaign[]>) => {
      state.campaigns = action.payload;
    },
    removeCampaigns: (state) => {
      state.campaigns = [];
    }
  }
});

export const {
  setSelectedCampaign,
  removeSelectedCampaign,
  loadCampaigns,
  removeCampaigns
} = campaignSlice.actions;

export default campaignSlice.reducer;
