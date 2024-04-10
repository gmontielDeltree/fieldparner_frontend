import React from "react";
import { AnalisisPreciosReact } from "../../owncomponents/analisis-precios/analisis-precios-react";
import { Navigate, useNavigate } from "react-router-dom";

export const PricesPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <AnalisisPreciosReact
        style={{ width: "100%" }}
        onClose={() => navigate(-1)}
      ></AnalisisPreciosReact>
    </>
  );
};
