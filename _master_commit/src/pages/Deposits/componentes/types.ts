import { Deposit } from "../../../types";


export interface BasicInfoSectionProps {
  formulario: Deposit;
  setFormulario: React.Dispatch<React.SetStateAction<Deposit>>;
}

export interface TypeStatusSectionProps {
  formulario: Deposit;
  setFormulario: React.Dispatch<React.SetStateAction<Deposit>>;
}

export interface AddressSectionProps {
  formulario: Deposit;
  setFormulario: React.Dispatch<React.SetStateAction<Deposit>>;
}

export interface GeolocationSectionProps {
  formulario: Deposit;
  setFormulario: React.Dispatch<React.SetStateAction<Deposit>>;
}

export interface LocationsSectionProps {
  formulario: Deposit;
  setFormulario: React.Dispatch<React.SetStateAction<Deposit>>;
}

export interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isEditMode: boolean;
  formulario: Deposit;
}