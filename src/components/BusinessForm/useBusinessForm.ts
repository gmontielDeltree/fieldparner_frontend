import { ChangeEvent, useEffect, useRef } from "react";
import { useBusiness } from "../../hooks";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { Country } from "../../interfaces/country";
import { Business } from "../../interfaces/socialEntity";
import { SelectChangeEvent } from "@mui/material";


export interface BusinessFormProps {
  values: Business;
  nameError: boolean;
  documentError: boolean;
  legajoError: boolean;
  cuitError: boolean;
  razonSocialError: boolean;
  emailError: boolean;
  countries: Country[];
  countryError: boolean;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleFormValueChange: (key: string, value: string) => void;
  handleCheckboxChange: (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}


export const useBusinessForm = (values: Business, handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void) => {
  const { businesses, getBusinesses } = useBusiness();
  const { t } = useTranslation();

  const prevDocumentoRef = useRef(values.documento);
  const prevCuitRef = useRef(values.cuit);

  const documentRegex = /^\d{8,12}$/;
  const phoneRegex = /^\d{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  useEffect(() => {
    getBusinesses();
  }, []);

  const validateDocument = (value: string) => documentRegex.test(value);
  const validatePhone = (value: string) => value === "" || phoneRegex.test(value);
  const validateEmail = (value: string) => emailRegex.test(value);

  const handleVerifyTaxId = async (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (!value.trim() || (name === "documento" && value === prevDocumentoRef.current) || (name === "cuit" && value === prevCuitRef.current)) {
      return;
    }

    if (name === "documento") prevDocumentoRef.current = value;
    if (name === "cuit") prevCuitRef.current = value;

    const existingBusiness = businesses.find((business) => 
      (name === "documento" && business.documento === value && business._id !== values._id) ||
      (name === "cuit" && business.cuit === value && business._id !== values._id)
    );

    if (existingBusiness) {
      const errorMessage = name === "documento" ? t("document_exists_error") : t("tax_id_exists_error");
      await Swal.fire({ icon: "error", title: t("error"), text: errorMessage });
      handleInputChange({ target: { name, value: "" } } as ChangeEvent<HTMLInputElement>);
    }
  };



    const handleDocumentInput = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '');
      handleInputChange({
        ...e,
        target: {
          ...e.target,
          value,
          name: 'documento'
        }
      });
    };

      const handlePhoneInput = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        handleInputChange({
          ...e,
          target: {
            ...e.target,
            value,
            name: e.target.name
          }
        });
      };

  return {
    validateDocument,
    validatePhone,
    validateEmail,
    handleVerifyTaxId,
    handleDocumentInput,
    handlePhoneInput,
  };
};
