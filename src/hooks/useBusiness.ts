import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dbContext } from "../services";
import { useAppSelector } from "./useRedux";
import { Country } from "../interfaces/country";
import { Business, BusinessItem } from "../interfaces/socialEntity";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

PouchDB.plugin(PouchDBFind);

export const useBusiness = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAppSelector((state) => state.auth);
    const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const replicate = async () => {
        try {
            // Código de replicación comentado (sin cambios)
        } catch (error) {
            console.error("Error replicating", error);
        }
    };

    const getBusinesses = async () => {
        setIsLoading(true);
        try {
            const result = await Promise.all([
                dbContext.socialEntities.find({
                    selector: { accountId: user?.accountId }
                }),
                dbContext.countries.allDocs({ include_docs: true })
            ]);
            const socialEntities = result[0].docs.map((d) => d as Business);
            const countries = result[1].rows.map((row) => row.doc as Country);
            setIsLoading(false);
            if (socialEntities.length) {
                let list = socialEntities.map((s) => {
                    let country = countries.find((c) => c.code === s.pais);
                    return {
                        ...s,
                        country
                    } as BusinessItem;
                });
                setBusinesses(list);
            } else {
                setBusinesses([]);
            }
        } catch (error) {
            console.log(error);
            // Se migró la notificación:  
            // NotificationService.showError(t("no_business_record"), {}, t("business_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    };

    const createBusiness = async (newBusiness: Business, isFromQuickAddModal: boolean = false) => {
        setIsLoading(true);
        if (!user) throw new Error("Business error: User not found");

        let createBusinessObj: Business = { ...newBusiness, accountId: user.accountId };

        try {
            const response = await dbContext.socialEntities.post(createBusinessObj);
            setIsLoading(false);

            if (response.ok) {
                NotificationService.showAdded({}, t("business_added_successfully"));
                
                // Solo navegar si NO es desde el modal de adición rápida
                if (!isFromQuickAddModal) {
                    navigate("/init/overview/business");
                }
                
                // Retornar el objeto creado para el modal
                return createBusinessObj;
            } else {
                NotificationService.showError(t("failed_to_add_business"), {}, t("business_label"));
            }
        } catch (error) {
            console.log(error);
            NotificationService.showError(t("unexpected_error"), {}, t("business_label"));
            setIsLoading(false);
            if (error) setError(error);
            throw error; // Re-lanzar el error para que el modal pueda manejarlo
        }
    };

    const updateBusiness = async (updateBusinessObj: Business) => {
        setIsLoading(true);
        try {
            const response = await dbContext.socialEntities.put(updateBusinessObj);
            setIsLoading(false);

            if (response.ok) {
                NotificationService.showUpdated({}, t("updated_successfully"));
            }
            navigate("/init/overview/business");
        } catch (error) {
            console.log(error);
            NotificationService.showError(t("business_not_found"), {}, t("business_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    };

    const deleteBusiness = async (businessId: string, revBusiness: string) => {
        setIsLoading(true);
        try {
            const response = await dbContext.socialEntities.remove(businessId, revBusiness);
            setIsLoading(false);

            if (response.ok) {
                NotificationService.showDeleted({}, t("deleted_successfully"));
            }
            navigate("/init/overview/business");
        } catch (error) {
            console.log(error);
            NotificationService.showError(t("business_not_found"), {}, t("business_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    };

    return {
        // Properties
        businesses,
        error,
        isLoading,
        // Methods
        setBusinesses,
        deleteBusiness,
        getBusinesses,
        createBusiness,
        updateBusiness,
        replicate
    };
};
