import { useState } from "react";
import { useTranslation } from "react-i18next";
import PouchDB from "pouchdb";
import { IAnnualPlanValorization } from "../interfaces/annualPlanValorization";
import { NotificationService } from "../services/notificationService";
import { useAppSelector } from "./";

export const useAnnualPlanValorization = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [annualPlanValorizations, setAnnualPlanValorizations] = useState<IAnnualPlanValorization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const db = new PouchDB<IAnnualPlanValorization>(
    `annual_plan_valorization_${user?.accountId || 'default'}`
  );

  const getAnnualPlanValorizations = async () => {
    setIsLoading(true);
    try {
      const result = await db.allDocs({ include_docs: true });
      const valorizations = result.rows
        .filter((row) => row.doc && !row.id.startsWith("_"))
        .map((row) => row.doc as IAnnualPlanValorization);
      
      setAnnualPlanValorizations(valorizations);
    } catch (error) {
      console.error("Error loading annual plan valorizations:", error);
      NotificationService.showError(
        t("error_loading_valorizations"),
        error,
        t("valorization_label")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createAnnualPlanValorization = async (valorization: Omit<IAnnualPlanValorization, "_id" | "_rev">) => {
    try {
      const newValorization = {
        ...valorization,
        _id: `valorization_${Date.now()}`,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
      };

      await db.put(newValorization);
      await getAnnualPlanValorizations();
      
      NotificationService.showAdded(
        newValorization,
        t("valorization_label")
      );
      
      return newValorization;
    } catch (error) {
      console.error("Error creating valorization:", error);
      NotificationService.showError(
        t("error_creating_valorization"),
        error,
        t("valorization_label")
      );
      throw error;
    }
  };

  const updateAnnualPlanValorization = async (valorization: IAnnualPlanValorization) => {
    try {
      const updatedValorization = {
        ...valorization,
        modifiedDate: new Date().toISOString(),
      };

      await db.put(updatedValorization);
      await getAnnualPlanValorizations();
      
      NotificationService.showUpdated(
        updatedValorization,
        t("valorization_label")
      );
      
      return updatedValorization;
    } catch (error) {
      console.error("Error updating valorization:", error);
      NotificationService.showError(
        t("error_updating_valorization"),
        error,
        t("valorization_label")
      );
      throw error;
    }
  };

  const deleteAnnualPlanValorization = async (id: string, rev: string) => {
    try {
      await db.remove(id, rev);
      await getAnnualPlanValorizations();
      
      NotificationService.showDeleted(
        { id },
        t("valorization_label")
      );
    } catch (error) {
      console.error("Error deleting valorization:", error);
      NotificationService.showError(
        t("error_deleting_valorization"),
        error,
        t("valorization_label")
      );
      throw error;
    }
  };

  return {
    annualPlanValorizations,
    isLoading,
    getAnnualPlanValorizations,
    createAnnualPlanValorization,
    updateAnnualPlanValorization,
    deleteAnnualPlanValorization,
  };
}; 