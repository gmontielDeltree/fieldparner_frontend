import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Category } from "../types";
import { dbContext } from "../services/pouchdbService";
import { NotificationService } from "../services/notificationService";

export const useCategory = () => {
    const { t } = useTranslation();
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const getCategories = async () => {
        setIsLoading(true);
        try {
            const response = await dbContext.categories.allDocs({ include_docs: true });

            setIsLoading(false);

            if (response.rows.length) {
                const documents: Category[] = response.rows.map(row => row.doc as Category);
                setCategories(documents);
            } else {
                setCategories([]);
            }

        } catch (error) {
            console.log(error);
            NotificationService.showError(t("no_categories_found"), {}, t("category_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        error,
        isLoading,
        categories,
        getCategories,
    }
}
