
import { ChangeEvent } from "react";
import { CertificateDeposit } from "../../interfaces/certificate-deposit";
import { SelectChangeEvent } from "@mui/material";
import { FormValueState } from "../../hooks";

export type CertificateDepositFormProps = {
    formValues: FormValueState<CertificateDeposit>;
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
    handleFormValueChange?: (key: string, value: string) => void;
};