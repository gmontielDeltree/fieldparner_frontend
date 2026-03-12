import { Numerator, NumeratorType } from "../types";
import { dbContext } from "../services";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useNumerator = () => {
    const { t } = useTranslation();

    const getLastNumerator = async (accountId: string, type: NumeratorType) => {
        try {
            const response = await dbContext.numerators.find({
                selector: {
                    "$and": [{ "accountId": accountId }, { "numeratorType": type }],
                }
            });
            if (response.docs.length)
                return response.docs[0] as Numerator;

        } catch (error) {
            console.log('error', error);
            throw new Error(t("numeratorNotFound"));
        }
    }

    const putLastNumerator = async (doc: Numerator, create = false) => {
        try {
            if (create)
                return await dbContext.numerators.post(doc);
            else
                return await dbContext.numerators.put(doc);
        } catch (error) {
            console.log('error', error);
        }
    }

    return {
        getLastNumerator,
        putLastNumerator,
    }
}