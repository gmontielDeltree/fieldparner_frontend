import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

interface DeleteFieldPromptProps {
  open: boolean;
  fieldName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const text = {
  header: "Confirmación de eliminación",
  message: (fieldName: string) =>
    `¿Estás seguro de que quieres eliminar el campo "${fieldName}"? Esta acción no se puede deshacer.`,
  cancelButton: "Cancelar",
  confirmButton: "Eliminar"
};

const DeleteFieldPrompt: React.FC<DeleteFieldPromptProps> = ({
  open,
  fieldName,
  onCancel,
  onConfirm
}) => {
  return (
    <Modal isOpen={open} toggle={onCancel} className="delete-field-prompt">
      <ModalHeader toggle={onCancel}>{text.header}</ModalHeader>
      <ModalBody>
        <p>{text.message(fieldName)}</p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onCancel}>
          {text.cancelButton}
        </Button>
        <Button color="danger" onClick={onConfirm}>
          {text.confirmButton}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteFieldPrompt;
