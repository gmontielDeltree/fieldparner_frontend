
import { useState, useEffect, useCallback } from "react";
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

  const getCampaigns = useCallback(async () => {
    setIsLoading(true);
    console.log("useCampaign: Getting campaigns...");

    try {
      const accountId = "ec3590d5c24e5bec5a21299d30013596";
      console.log("useCampaign: Using fixed accountId for all environments:", accountId);

      if (!dbContext || !dbContext.campaigns) {
        console.error("useCampaign: dbContext or dbContext.campaigns is undefined");
        throw new Error("Database context is not available");
      }

      console.log("useCampaign: Executing find query with accountId:", accountId);
      const result = await dbContext.campaigns.find({
        selector: {
          accountId: accountId
        }
      });

      console.log("useCampaign: Raw find query result:", result);

      if (result && result.docs && result.docs.length) {
        const documents: Campaign[] = result.docs.map((doc) => doc as Campaign);
        console.log(`useCampaign: Found ${documents.length} campaigns:`, documents);
        setCampaigns(documents);
      } else {
        console.log("useCampaign: No campaigns found or empty result");
        setCampaigns([]);
      }
    } catch (error) {
      console.error("useCampaign: Error fetching campaigns:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      NotificationService.showError(
        t("no_campaigns_record"),
        {},
        t("campaign_label")
      );
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    console.log("useCampaign: Initializing hook, fetching campaigns");
    getCampaigns();
  }, [getCampaigns]);

  const addCampaign = async (campaignData) => {
    console.log("useCampaign: Adding campaign:", campaignData);
    setIsLoading(true);
    try {
      const accountId = "ec3590d5c24e5bec5a21299d30013596";

      const newCampaign = {
        ...campaignData,
        _id: campaignData.campaignId,
        accountId: accountId,
        creationDate: new Date().toISOString(),
        state: campaignData.state || "Active"
      };

      console.log("useCampaign: Prepared campaign for saving:", newCampaign);

      if (!dbContext || !dbContext.campaigns) {
        throw new Error("Database context is not available");
      }

      const result = await dbContext.campaigns.put(newCampaign);
      console.log("useCampaign: Campaign added result:", result);

      await getCampaigns();
      NotificationService.showAdded({}, t("campaign_added_successfully"));
    } catch (error) {
      console.error("useCampaign: Error adding campaign:", error);
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
    console.log("useCampaign: Updating campaign:", campaign);
    setIsLoading(true);
    try {
      const updatedCampaign = {
        ...campaign,
        accountId: campaign.accountId || "ec3590d5c24e5bec5a21299d30013596"
      };

      if (!dbContext || !dbContext.campaigns) {
        throw new Error("Database context is not available");
      }

      const result = await dbContext.campaigns.put(updatedCampaign);
      console.log("useCampaign: Campaign update result:", result);

      await getCampaigns();
      NotificationService.showUpdated({}, t("campaign_updated_successfully"));
    } catch (error) {
      console.error("useCampaign: Error updating campaign:", error);
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
    console.log("useCampaign: Deleting campaign:", campaign);
    setIsLoading(true);
    try {
      if (!dbContext || !dbContext.campaigns) {
        throw new Error("Database context is not available");
      }

      if (!campaign._id) {
        throw new Error("Campaign does not have _id");
      }

      const result = await dbContext.campaigns.remove(campaign);
      console.log("useCampaign: Campaign delete result:", result);

      await getCampaigns();
      NotificationService.showDeleted({}, t("campaign_deleted_successfully"));
    } catch (error) {
      console.error("useCampaign: Error deleting campaign:", error);
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