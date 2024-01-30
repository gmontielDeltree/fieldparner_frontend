import Swal from "sweetalert2";
import { Campaign } from "@types";
import { useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";


export const useCampaign = () => {

    const { user } = useAppSelector(state => state.auth);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getCampaigns = async () => {
        setIsLoading(true);
        try {
            if(import.meta.env.PROD){
                if (!user) throw new Error("User not found");
            }
                
            const result = await dbContext.campaigns.find({
                selector: { "accountId": import.meta.env.PROD ? user.accountId : "ec3590d5c24e5bec5a21299d30013596" }
            });
            
            // const vehiculos = response.map((v: any) => v.content);
            if (result.docs.length) {
                const documents: Campaign[] = result.docs.map(doc => doc as Campaign);
                setCampaigns(documents);
            }

            setIsLoading(false);
        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No hay registro de Campañas.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        //* Props
        campaigns,
        error,
        isLoading,

        //*Methods
        getCampaigns,
    }

}