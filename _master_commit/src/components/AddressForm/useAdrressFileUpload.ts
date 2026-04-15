import { useState } from "react";
import uuid4 from "uuid4";

export const useAdrressFileUpload = (initialUrl = "", onChangeCallback: (value: string) => void) => {
  const [urlFile, setUrlFile] = useState(initialUrl);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const fileNameOriginal = file.name;
      const extensionPos = fileNameOriginal.lastIndexOf(".");
      const fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);
      const newFileName = `business-logo-${uuid4()}${fileType}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      const fileURL = URL.createObjectURL(renamedFile);

      setUrlFile(fileURL);
      onChangeCallback(newFileName);
      return renamedFile;
    }
    return null;
  };

  const handleCancelFile = () => {
    setUrlFile("");
    onChangeCallback("");
  };

  return { urlFile, handleFileUpload, handleCancelFile };
};