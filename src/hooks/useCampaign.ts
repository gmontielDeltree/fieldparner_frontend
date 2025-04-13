import { useState } from "react";
import { Campaign } from "@types";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useCampaign = () => {
  const { t } = useTranslation();
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

      const result = await dbContext.campaigns.find({
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
      NotificationService.showError(
        t("no_campaigns_record"),
        {},
        t("campaign_label")
      );
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

      await dbContext.campaigns.put(newCampaign);
      await getCampaigns();
      NotificationService.showAdded({}, t("campaign_added_successfully"));
    } catch (error) {
      console.error(error);
      NotificationService.showError(
        t("failed_to_add_campaign"),
        {},
        t("campaign_label")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaign = async (campaign: Campaign) => {
    setIsLoading(true);
    try {
      if (import.meta.env.PROD && !user) throw new Error("User not found");

      await dbContext.campaigns.put(campaign);
      await getCampaigns();
      NotificationService.showUpdated({}, t("campaign_updated_successfully"));
    } catch (error) {
      console.error(error);
      NotificationService.showError(
        t("failed_to_update_campaign"),
        {},
        t("campaign_label")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (campaign: Campaign) => {
    setIsLoading(true);
    try {
      await dbContext.campaigns.remove(campaign);
      await getCampaigns();
      NotificationService.showDeleted({}, t("campaign_deleted_successfully"));
    } catch (error) {
      console.error(error);
      NotificationService.showError(
        t("failed_to_delete_campaign"),
        {},
        t("campaign_label")
      );
    } finally {
      setIsLoading(false);
    }
  };

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
