import { Deposit } from "../types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useDeposit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDeposits = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.deposits.find({
        selector: { accountId: user?.accountId }
      });
      setIsLoading(false);
      if (result.docs) {
        const documents: Deposit[] = result.docs.map((row) => row as Deposit);
        setDeposits(documents);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(t("errorLoadingDocuments"), error);
    }
  };

  const createDeposit = async (newDeposit: Deposit) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error(t("noUserError"));
      const response = await dbContext.deposits.post({
        ...newDeposit,
        accountId: user.accountId
      });
      setIsLoading(false);
      if (response.ok) {
        NotificationService.showAdded(newDeposit, t("deposit_label"));
      }
      navigate("/init/overview/deposit");
    } catch (error) {
      console.log(t("errorCreatingDocument"), error, newDeposit);
      NotificationService.showError(t("unexpectedError"), error, t("error_label"));
      setIsLoading(false);
    }
  };

  const updateDeposit = async (updateDeposit: Deposit) => {
    setIsLoading(true);
    try {
      const response = await dbContext.deposits.put(updateDeposit);
      setIsLoading(false);
      if (response.ok) {
        NotificationService.showUpdated(updateDeposit, t("deposit_label"));
      }
      navigate("/init/overview/deposit");
    } catch (error) {
      console.log(t("errorUpdatingDocument"), error);
      NotificationService.showError(t("unexpectedError"), error, t("error_label"));
      setIsLoading(false);
    }
  };

  const deleteDeposit = async (deleteDepositId: string, revDeposit: string) => {
    setIsLoading(true);
    try {
      const response = await dbContext.deposits.remove(deleteDepositId, revDeposit);
      setIsLoading(false);
      if (response.ok)
        NotificationService.showDeleted({ id: deleteDepositId }, t("deposit_label"));
      navigate("/init/overview/deposit");
    } catch (error) {
      console.log(t("errorUpdatingDocument"), error);
      NotificationService.showError(t("unexpectedError"), error, t("error_label"));
      setIsLoading(false);
    }
  };

  const findDepositsByAccountId = async (accountId: string) => {
    setIsLoading(true);
    try {
      const result = await dbContext.deposits.find({
        selector: { accountId: accountId }
      });
      setIsLoading(false);
      if (result.docs) {
        const documents: Deposit[] = result.docs.map((row) => row as Deposit);
        return documents;
      }
      return [];
    } catch (error) {
      setIsLoading(false);
      console.error(t("errorFindingDepositsByAccountId"), error);
      return [];
    }
  };

  // This function is defined as getDepositsBySupplyId
  const getDepositsBySupplyId = async (supplyId: string) => {
    setIsLoading(true);
    try {
      if (!user) return;
      const accountId = user.accountId;
      const promisesResult = await Promise.all([
        dbContext.stock.find({
          selector: {
            "$and": [{ "id": supplyId }, { "accountId": accountId }]
          }
        }),
        dbContext.deposits.find({
          selector: { accountId: accountId }
        })
      ]);
      if (promisesResult) {
        const supplyStock = promisesResult[0].docs;
        const deposits = promisesResult[1].docs;
        let depositsOfSupply: Deposit[] = [];
        supplyStock.forEach((element) => {
          const depositId = element.depositId;
          const depositFound = deposits.find(d => d._id === depositId);
          if (depositFound) depositsOfSupply.push(depositFound);
        });
        setDeposits(depositsOfSupply);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(t("errorLoadingDocuments"), error);
    }
  };

  const getDepositsByCropId = async (cropId: string) => {
    setIsLoading(true);
    try {
      if (!user) return;
      const accountId = user.accountId;
      const promisesResult = await Promise.all([
        dbContext.stock.find({
          selector: {
            "$and": [{ "id": cropId }, { "accountId": accountId }]
          }
        }),
        dbContext.deposits.find({
          selector: { accountId: accountId }
        })
      ]);
      if (promisesResult) {
        const stockCrop = promisesResult[0].docs;
        const deposits = promisesResult[1].docs;
        let depositsOfSupply: Deposit[] = [];
        stockCrop.forEach((element) => {
          const depositId = element.depositId;
          const depositFound = deposits.find(d => d._id === depositId);
          if (depositFound) depositsOfSupply.push(depositFound);
        });
        setDeposits(depositsOfSupply);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(t("errorLoadingDocuments"), error);
    }
  };

  return {
    deposits,
    isLoading,
    setDeposits,
    getDeposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
    findDepositsByAccountId,
    getDepositsBySupplyId,
    getDepositsByCropId,
    getDepositsBySupply: getDepositsBySupplyId,
  };
};
