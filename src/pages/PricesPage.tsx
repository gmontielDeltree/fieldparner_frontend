import React from "react";
import { AnalisisPreciosReact } from '../../owncomponents/analisis-precios/analisis-precios-react';

export const PricesPage : React.FC = ( )=>{

    return (<>
        
       <AnalisisPreciosReact style={{width:"100%"}}></AnalisisPreciosReact> 
    </>)
}