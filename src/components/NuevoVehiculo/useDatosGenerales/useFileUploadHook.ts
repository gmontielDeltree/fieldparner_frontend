import { SetStateAction, useState } from "react";
import uuid4 from "uuid4";

export type BasicFileInfo = {
  file: File;
  originalName: string;
  uniqueName: string;
};

type FileUploadSetter = 
  | React.Dispatch<SetStateAction<BasicFileInfo[]>> 
  | React.Dispatch<SetStateAction<File[]>> 
  | ((file: File | BasicFileInfo) => void);

interface FileUploadHookProps {
  setFilesUpload: FileUploadSetter;
  onFileChange: (fileName: string) => void;
  cancelFile: (indexToRemove?: number) => void;
  onFileRemove: () => void;
  fileTypePrefix?: string;
  acceptedFileTypes?: string;
  returnBasicFile?: boolean;
  initialFileName?: string;
  singleFile?: boolean;
}

export const useFileUploadHook = ({
  setFilesUpload,
  onFileChange,
  cancelFile,
  onFileRemove,
  fileTypePrefix = "file",
  acceptedFileTypes = "*",
  returnBasicFile = false,
  initialFileName = "",
  singleFile = false
}: FileUploadHookProps) => {
  const [fileDisplayName, setFileDisplayName] = useState<string>(initialFileName);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError(null);

    if (!file) return;

    // Validación de tipos de archivo
    if (acceptedFileTypes !== "*") {
      const acceptedTypes = acceptedFileTypes.split(",");
      const isValidType = acceptedTypes.some(type => {
        const pattern = type.endsWith("/*") 
          ? new RegExp(`^${type.replace("/*", "/.*")}$`)
          : new RegExp(`^${type}$`);
        return pattern.test(file.type);
      });

      if (!isValidType) {
        setError(`Tipo de archivo no permitido. Se permiten: ${acceptedFileTypes}`);
        return;
      }
    }

    try {
      const fileNameOriginal = file.name;
      const extensionPos = fileNameOriginal.lastIndexOf(".");
      const fileExtension = extensionPos !== -1 ? fileNameOriginal.substring(extensionPos) : "";
      const newFileName = `${fileTypePrefix}_${uuid4()}${fileExtension}`;

      if (returnBasicFile) {
        const fileInfo: BasicFileInfo = {
          file,
          originalName: fileNameOriginal,
          uniqueName: newFileName
        };
        
        if (singleFile) {
          (setFilesUpload as (file: BasicFileInfo) => void)(fileInfo);
        } else {
          (setFilesUpload as React.Dispatch<SetStateAction<BasicFileInfo[]>>)(prev => 
            Array.isArray(prev) ? [...prev, fileInfo] : [fileInfo]);
        }
      } else {
        const renamedFile = new File([file], newFileName, { type: file.type });
        
        if (singleFile) {
          (setFilesUpload as (file: File) => void)(renamedFile);
        } else {
          (setFilesUpload as React.Dispatch<SetStateAction<File[]>>)(prev => 
            Array.isArray(prev) ? [...prev, renamedFile] : [renamedFile]);
        }
      }

      setFileDisplayName(fileNameOriginal);
      onFileChange(newFileName);
    } catch (err) {
      setError("Error al procesar el archivo");
      console.error(err);
    }
  };

  const handleRemoveFile = (index?: number) => {
    try {
      onFileRemove();
      setFileDisplayName("");
      cancelFile(index ?? 0); // Proporciona valor por defecto
      setError(null);
    } catch (err) {
      setError("Error al eliminar el archivo");
      console.error("Error en handleRemoveFile:", err);
    }
  };

  return {
    fileDisplayName,
    handleFileUpload,
    handleRemoveFile,
    error,
    resetError: () => setError(null)
  };
};