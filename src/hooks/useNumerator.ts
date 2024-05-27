import { Numerator, NumeratorType } from "../types";
import { dbContext } from "../services";


export const useNumerator = () => {

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
            throw new Error("Numerator not found.");
        }
    }

    const putLastNumerator = async (doc: Numerator, create = false) => {
        try {
            if (create)
                await dbContext.numerators.post(doc);
            else
                await dbContext.numerators.put(doc);
        } catch (error) {
            console.log('error', error);
        }
    }

    return {
        getLastNumerator,
        putLastNumerator,
    }
}