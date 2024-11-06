import React, { ChangeEvent } from 'react'
import type { ContractSaleCereals } from '../../interfaces/contract-sale-cereals';
import { SelectChangeEvent } from '@mui/material';
import { FormValueState } from '../../hooks/useFormValue';

interface Props {
  formValues: FormValueState<ContractSaleCereals>;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const Details: React.FC<Props> = () => {
  return (
    <div>Details</div>
  )
}
