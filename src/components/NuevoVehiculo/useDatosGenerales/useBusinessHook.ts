import { useEffect, useMemo } from "react";
import { useBusiness } from "../../../hooks";
import { TipoEntidad } from "../../../types";

export const useBusinessHook = () => {
  const {
    getBusinesses,
    businesses,
    isLoading: loadingBusiness,
  } = useBusiness();

  useEffect(() => {
    getBusinesses();
  }, []);

  const optionsPropietario = useMemo(() => {
    return businesses
      .filter((business) => business.tipoEntidad == TipoEntidad.JURIDICA)
      .map((business) => business.razonSocial || "");
  }, [businesses]);

  const insuranceCompanies = useMemo(() => {
    return businesses.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA);
  }, [businesses]);

  return {
    loadingBusiness,
    optionsPropietario,
    insuranceCompanies
  };
};