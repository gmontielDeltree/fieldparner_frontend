import Swal from "sweetalert2";
import { Campaign } from "@types";
import { useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";

export const useCampaign = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getCampaigns = async () => {
    setIsLoading(true);
    try {
      if (import.meta.env.PROD) {
        if (!user) throw new Error("User not found");
      }

      const result = await dbContext.Campaigns.find({
        selector: {
          accountId: import.meta.env.PROD
            ? user.accountId
            : "ec3590d5c24e5bec5a21299d30013596"
        }
      });

      if (result.docs.length) {
        const documents: Campaign[] = result.docs.map((doc) => doc as Campaign);
        setCampaigns(documents);
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No hay registro de Campañas.", "error");
      setIsLoading(false);
      setError(error);
    }
  };
  const addCampaign = async (campaignData) => {
    console.log("campaignData: ", campaignData);
    setIsLoading(true);
    try {
      if (import.meta.env.PROD && !user) throw new Error("User not found");

      const newCampaign = {
        ...campaignData,
        _id: campaignData.campaignId,
        accountId: import.meta.env.PROD
          ? user.accountId
          : "ec3590d5c24e5bec5a21299d30013596",
        creationDate: new Date().toISOString()
      };

      await dbContext.Campaigns.put(newCampaign);

      await getCampaigns();
      Swal.fire("Success", "Campaign added successfully.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add the campaign.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaign = async (campaign: Campaign) => {
    setIsLoading(true);
    try {
      if (import.meta.env.PROD && !user) throw new Error("User not found");

      await dbContext.Campaigns.put(campaign);

      await getCampaigns();
      Swal.fire("Success", "Campaign added successfully.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add the campaign.", "error");
    } finally {
      setIsLoading(false);
    }

  }

  const deleteCampaign = async (campaign: Campaign) => {
    setIsLoading(true);
    try {

      await dbContext.Campaigns.remove(campaign);

      await getCampaigns();
      Swal.fire("Success", "Campaign deleted successfully.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to delete the campaign.", "error");
    } finally {
      setIsLoading(false);
    }

  }


  return {
    campaigns,
    error,
    isLoading,
    getCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
  };
};
