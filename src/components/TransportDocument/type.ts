import { Category, ExitFieldItem, Vehicle } from "@types";
import { Company } from "../../interfaces/company";
import { TransportDocument } from "../../interfaces/transportDocument";
import { BusinessItem } from "../../interfaces/socialEntity";
import { ChangeEvent } from "react";
import { SelectChangeEvent } from "@mui/material";

export interface TransportDocumentFormProps {
    formValues: TransportDocument;
    companies?: Company[];
    categories?: Category[];
    exitFields?: ExitFieldItem[];
    providers?: BusinessItem[];
    vehicles?: Vehicle[];
    selectedFieldOutput?: ExitFieldItem | null;
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
    handleFormValueChange?: (key: string, value: string) => void;
}