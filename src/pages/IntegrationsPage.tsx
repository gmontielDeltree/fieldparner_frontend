import React from "react";
import { useNavigate } from "react-router-dom";

export const IntegrationsPage : React.FC = ( )=>{

    const navigate = useNavigate()
    return (<>
        
        
        <div>

            <div onClick={()=>navigate("../john-deere")}>John Deere</div>
            <div onClick={()=>navigate("../magris")}>Magris</div>
        </div>
    </>)
}