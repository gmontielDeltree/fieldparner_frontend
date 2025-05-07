import { Autocomplete, Fab, IconButton, Paper, TableCell, TableContainer, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { DataTable, ItemRow, TableCellStyled } from "../DataTable";
import { ColumnProps } from "../../types";
import {
    NoteAdd as NoteAddIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

import { useCompany, useForm } from "../../hooks";
import uuid4 from "uuid4";
import { useTranslation } from "react-i18next";
import { CompanyByContract } from "../../interfaces/corporateContract";


interface Props {
    listCorporateContract: CompanyByContract[];
    onClickAdd: (item: CompanyByContract) => void;
    onClickDelete: (item: CompanyByContract) => void;
}

const initialFormValues: CompanyByContract = {
    id: "",
    contractId: "",
    companyId: '',
    percentageOfParticipation: 0,
    activity: '',
};

export const TableCorporateContract: React.FC<Props> = ({
    listCorporateContract,
    onClickAdd,
    onClickDelete
}) => {
    const { t } = useTranslation();
    const {
        handleInputChange,
        reset,
        formulario: formValues,
        setFormulario: setFormValues,
    } = useForm<CompanyByContract>(initialFormValues);

    const { isLoading, companies, getCompanies } = useCompany();


    const columns: ColumnProps[] = [
        { text: t("_company"), align: "left" },
        { text: t("percentage_of_participation"), align: "center" },
        { text: t("_activity"), align: "center" },
        { text: "", align: "center" },
    ];

    useEffect(() => {
        getCompanies();
    }, [])

    return (
        <TableContainer
            key="table-container-corporate-contract"
            sx={{
                minHeight: "120px",
                maxHeight: "440",
                overflow: "scroll",
                mb: 5
            }}
            component={Paper}
        >
            <DataTable
                key="table-corporate-contract"
                columns={columns}
                isLoading={isLoading}
            >
                <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                    <TableCellStyled align="left" sx={{ width: "25%" }} className="p-0 py-2 px-2">
                        <Autocomplete
                            value={companies.find(option => option.companyId === formValues.companyId) || null}
                            onChange={(_e, newValue) => {
                                if (!newValue) return;
                                setFormValues(prevState => ({
                                    ...prevState,
                                    companyId: newValue.companyId
                                }));
                            }}
                            options={companies}
                            getOptionLabel={(option) => option.fantasyName || option.socialReason}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t("_company")}
                                    variant="outlined"
                                // error={errors.companie}
                                // helperText={errors.companie ? t("field_required") : ""}
                                />
                            )}
                            fullWidth
                        />
                    </TableCellStyled>
                    <TableCellStyled
                        align="center"
                        sx={{ width: "20%" }}
                        className="p-0 py-2 px-2">
                        <TextField
                            label={t("percentage_of_participation")}
                            name="percentageOfParticipation"
                            value={formValues.percentageOfParticipation}
                            onChange={handleInputChange}
                            // error={errors.percentageOfParticipation}
                            // helperText={errors.percentageOfParticipation ? t("field_required") : t("numeric_values_only")}
                            inputProps={{ inputMode: 'decimal' }}
                            type="number"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </TableCellStyled>
                    <TableCellStyled align="left" sx={{ width: "40%" }} className="p-0 py-2 px-2">
                        <TextField
                            label={t("_activity")}
                            name="activity"
                            value={formValues.activity}
                            onChange={handleInputChange}
                            // error={errors.activity}
                            // helperText={errors.activity ? t("field_required") : ""}
                            fullWidth />
                    </TableCellStyled>
                    <TableCellStyled align='center' sx={{ width: "10%" }}>
                        <Fab
                            color="success"
                            aria-label="add"
                            size='small'
                            disabled={!formValues.companyId || !formValues.percentageOfParticipation}
                            onClick={() => {
                                onClickAdd({
                                    ...formValues,
                                    percentageOfParticipation: Number(formValues.percentageOfParticipation),
                                    id: uuid4()
                                });
                                reset();
                            }}>
                            <AddIcon />
                        </Fab>
                    </TableCellStyled>
                </ItemRow>
                {
                    listCorporateContract.length === 0 ? (
                        <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                            <TableCell align="center" colSpan={11} >
                                <NoteAddIcon fontSize='medium' />
                            </TableCell>
                        </ItemRow>
                    ) : listCorporateContract.map((row) => (
                        <ItemRow key={row.id}>
                            <TableCellStyled align="left">{companies.find(x => x.companyId === row.companyId)?.fantasyName} </TableCellStyled>
                            <TableCellStyled align="left">{row.percentageOfParticipation} %</TableCellStyled>
                            <TableCellStyled align="center">{row.activity}</TableCellStyled>
                            <TableCellStyled align='center'>
                                <IconButton
                                    onClick={() => onClickDelete(row)}
                                    color='error'>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCellStyled>
                        </ItemRow>
                    ))}
            </DataTable>
        </TableContainer>
    )
}