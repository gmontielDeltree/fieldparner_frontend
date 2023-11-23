import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

interface GeometryPromptModalProps {
  isOpen: boolean;
  toggle: () => void;
  onDraw: () => void;
  onUpload: (file: File) => void;
}

const text = {
  header: "¿Como quieres agregar la nueva geometria?",
  drawButton: "Dibujar",
  uploadButton: "Subir archivo",
  closeButton: "Cerrar"
};

const GeometryPromptModal: React.FC<GeometryPromptModalProps> = ({
  isOpen,
  toggle,
  onDraw,
  onUpload
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="add-geometry step"
      style={{ marginTop: "90px" }}
    >
      <ModalHeader toggle={toggle}>{text.header}</ModalHeader>
      <ModalBody className="mx-auto">
        <Button color="primary" onClick={onDraw}>
          {text.drawButton}
        </Button>
        <Button
          color="primary"
          onClick={handleFileUploadClick}
          style={{ marginLeft: "5px" }}
        >
          {text.uploadButton}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".kml,.kmz"
          style={{ display: "none" }}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          {text.closeButton}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default GeometryPromptModal;
