import React from "react";
import { ZoningMapComponent } from "../../owncomponents/zoning/ZoningMapComponent";
import { useParams } from "react-router-dom";

export const ZoningPage: React.FC = () => {
  let { baseImageName } = useParams();

  return (
    <>
    <ZoningMapComponent baseImageNameParam={baseImageName} />


    </>
  );
};
