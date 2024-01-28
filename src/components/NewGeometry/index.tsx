import React, { useState } from "react";
import GeometryPromptModal from "./GeometryPromptModal";
import DrawGeometry from "./DrawGeometry";
import UploadGeometry from "./UploadGeometry";
import { GeoJsonObject } from "geojson";

interface NewGeometryProps {
  handleSaveGeometry?: (detail: any) => void;
  onClose: () => void;
  type: "field" | "lot";
}

function NewGeometry({ handleSaveGeometry, onClose, type }: NewGeometryProps) {
  const [activeComponent, setActiveComponent] = useState<
    "draw" | "upload" | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDraw = () => {
    setActiveComponent("draw");
    setIsModalOpen(false);
  };

  const handleUpload = (file: File) => {
    setActiveComponent("upload");
    setIsModalOpen(false);
    setUploadedFile(file);
  };

  const handleGeoJSONProcessed = (geoJSON: GeoJsonObject) => {
    handleSaveGeometry?.(geoJSON);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleClose = () => {
    toggleModal();
    onClose();
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "draw":
        return (
          <DrawGeometry handleSaveGeometry={handleSaveGeometry} type={type} />
        );
      case "upload":
        return (
          <UploadGeometry
            file={uploadedFile}
            onGeoJSONProcessed={handleGeoJSONProcessed}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <GeometryPromptModal
        isOpen={isModalOpen}
        toggle={handleClose}
        onDraw={handleDraw}
        onUpload={handleUpload}
      />
      {renderActiveComponent()}
    </div>
  );
}

export default NewGeometry;
