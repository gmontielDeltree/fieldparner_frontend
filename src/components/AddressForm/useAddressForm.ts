import { ChangeEvent, SetStateAction } from "react";
import { useZipCode } from "./useZipCode";
import { Business } from "../../interfaces/socialEntity";

export interface AddressFormProps {
  values: Business;
  loading: boolean;
  onChangeZipCode: () => Promise<void>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleFormValueChange: (key: string, value: string) => void;
  setFile: React.Dispatch<SetStateAction<File | null>>;
  setFormulario: React.Dispatch<React.SetStateAction<Business>>;
}

export const useAddressForm = (
  values: Business,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
) => {
  const { cp, pais } = values;


  const { loadingZipCode, localities, handleBlur } = useZipCode(
    cp,
    pais,
    handleInputChange
  );


  return {
    loadingZipCode,
    localities,
    handleBlur,
  };
};