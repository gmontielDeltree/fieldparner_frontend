import { Category, ExitField, ExitFieldItem, Field } from "@types";
import { Company } from "../../interfaces/company";
import { TransportDocument } from "../../interfaces/transportDocument";
import { BusinessItem } from "../../interfaces/socialEntity";
import { ChangeEvent } from "react";
import { SelectChangeEvent } from "@mui/material";

export interface TransportDocumentFormProps {
    formValues: TransportDocument;
    companies: Company[];
    categories: Category[];
    fields: ExitFieldItem[];
    providers: BusinessItem[];
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
}