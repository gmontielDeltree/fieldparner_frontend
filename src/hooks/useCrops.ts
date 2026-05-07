import { useState } from "react";
import { dbContext } from "../services";
import { Campaign, Crop, Deposit } from "../types";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";
import { useAppSelector } from "./useRedux";
import { CropStockData } from "../interfaces/stock";
import { CropDeposit, CropDepositItem } from "../interfaces/crop-deposit";


String.prototype.toColor = function () {
  var colors = ["#e51c23", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#5677fc", "#03a9f4", "#00bcd4", "#009688", "#259b24", "#8bc34a", "#afb42b", "#ff9800", "#ff5722", "#795548", "#607d8b"]

  var hash = 0;
  if (this.length === 0) return hash;
  for (var i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  hash = ((hash % colors.length) + colors.length) % colors.length;
  return colors[hash];
}

export interface CultivoItem extends Crop {
  color?: string;
}

export const useCrops = () => {
  
  const { t, i18n } = useTranslation();
  const { user } = useAppSelector(state => state.auth);
  const [crops, setCrops] = useState<CultivoItem[]>([]);
  const [dataCrops, setDataCrops] = useState<Crop[]>([]);
  const [stockCrops, setStockCrops] = useState<CropDepositItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const getCropLabelFromId = (id: string) => {
    let c = crops.find((a) => a._id === id);
    console.log(t("languageDebug"), i18n.language)

    if (c) {
      if (i18n.language === "es") {
        return c.descriptionES
      } else if (i18n.language === "en") {
        return c.descriptionEN
      } else if (i18n.language === "pt") {
        return c.descriptionPT
      } else {
        return c.descriptionES
      }
    } else {
      console.log(t("cropNotFound"), id)
      return t("unknown")
    }
  };

  const getCropColorFromId = (id: string) => {
    let c = crops.find((a) => a._id === id);
    if (c) {
      return c.descriptionEN.toColor() || "grey";
    } else {
      return "red"
    }
  };

  const getCrops = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.crops.allDocs({ include_docs: true });
      setIsLoading(false);

      if (response.rows.length) {
        const documents: Crop[] = response.rows.map(row => row.doc as Crop);
        setDataCrops(documents);
        setCrops(documents);
      }
      else
        setCrops([]);

    } catch (error) {
      console.log(error)
      NotificationService.showError(t("errorGettingCrops", { error }), error, t("crop_label"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

 const loadCropStock = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [cropsRes, controlRes, campaignsRes, depositsRes] = await Promise.all([
        dbContext.crops.allDocs({ include_docs: true }),
        dbContext.cropDeposits.find({ selector: { accountId: user.accountId } }),
        dbContext.campaigns.find({ selector: { accountId: user.accountId } }),
        dbContext.deposits.find({ selector: { accountId: user.accountId } }),
      ]);
      const crops = cropsRes.rows.map(r => r.doc);
      const controls = controlRes.docs;
      const campaigns = campaignsRes.docs;
      const deposits = depositsRes.docs;

      const data = controls.map((ctrl: CropDeposit) => {
        const crop = crops.find((c: any) => c._id === ctrl.cropId);
        const campaign = campaigns.find((c: Campaign) => c.campaignId === ctrl.campaignId);
        const deposit = deposits.find((d: Deposit) => d._id === ctrl.depositId);
        return {
          ...ctrl,
          dataCrop: crop,
          dataCampaign: campaign,
          dataDeposit: deposit,
        } as CropDepositItem;
      });
      setStockCrops(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    crops,
    dataCrops,
    stockCrops,
    isLoading,
    error,
    getCrops,
    getCropLabelFromId,
    getCropColorFromId,
    loadCropStock
  };
};