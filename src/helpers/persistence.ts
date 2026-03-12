import { Campaign } from "@types";
import store from "../redux/store";

export const loadCampaignFromLS = () => {
  try {
    const serialState = localStorage.getItem('selectedCampaign');
    if (serialState === null) {
      return undefined;
    }
    let campaign : Campaign = JSON.parse(serialState);
    if(campaign.accountId === store.getState().auth.user?.accountId){
      return campaign
    }else{
      return undefined
    }
    
  } catch (err) {
    return undefined;
  }
};


export const saveCampaignToLS = (state) => {
  try {
    const serialState = JSON.stringify(state);
    localStorage.setItem('selectedCampaign', serialState);
  } catch (err) {
    console.log(err);
  }
};

