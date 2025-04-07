import { ChangeEvent, SetStateAction } from "react";
import { useAdrressFileUpload } from "./useAdrressFileUpload";
import { useZipCode } from "./useZipCode";
import { Business } from "../../interfaces/socialEntity";
import { urlImg } from "../../config";

export interface AddressFormProps {
  values: Business;
  loading: boolean;
  onChangeZipCode: () => Promise<void>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleFormValueChange: (key: string, value: string) => void;
  setFile: React.Dispatch<SetStateAction<File | null>>;
}

export const useAddressForm = (
  values: Business,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleFormValueChange: (key: string, value: string) => void,
  setFile: React.Dispatch<SetStateAction<File | null>>
) => {
  const { cp, pais, logoBusiness } = values;
  
  const { urlFile, handleFileUpload, handleCancelFile } = useAdrressFileUpload(
    "",
    (fileName) => {
      handleFormValueChange("logoBusiness", fileName);
    }
  );

  const { loadingZipCode, localities, handleBlur } = useZipCode(
    cp,
    pais,
    handleInputChange
  );

  const enhancedHandleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = handleFileUpload(event);
    if (file) {
      setFile(file);
    }
  };

  return {
    loadingZipCode,
    localities,
    urlFile: urlFile || (logoBusiness ? `${urlImg}/${logoBusiness}` : ""),
    handleBlur,
    handleFileUpload: enhancedHandleFileUpload,
    handleCancelFile: () => {
      handleCancelFile();
      setFile(null);
    }
  };
};