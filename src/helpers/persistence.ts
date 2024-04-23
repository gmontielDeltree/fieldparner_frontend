export const loadCampaignFromLS = () => {
  try {
    const serialState = localStorage.getItem('selectedCampaign');
    if (serialState === null) {
      return undefined;
    }
    return JSON.parse(serialState);
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

