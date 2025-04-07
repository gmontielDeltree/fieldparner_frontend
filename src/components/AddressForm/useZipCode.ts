import { useState } from "react";
import { onBlurZipCode } from "../../utils";
import { useTranslation } from "react-i18next";

export const useZipCode = (
  initialCp: string,
  initialPais: string,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
) => {
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const { t } = useTranslation();

  const handleBlur = (_event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onBlurZipCode(initialCp, initialPais, setLoadingZipCode, setLocalities, handleInputChange, t);
  };

  return { loadingZipCode, localities, handleBlur };
};