import React, { useEffect } from "react";
import { FieldsByProductUnit } from "../../interfaces/productiveUnits";
import { Autocomplete, Fab, IconButton, ListItemText, Paper, TableCell, TableContainer, TextField, Tooltip, Typography } from "@mui/material";
import { DataTable, ItemRow, TableCellStyled } from "../DataTable";
import {
    NoteAdd as NoteAddIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { ColumnProps } from "../../types";
import { useField, useForm } from "../../hooks";
import uuid4 from "uuid4";

type Props = {
    listFieldsByProductUnit: FieldsByProductUnit[];
    onClickAdd: (item: FieldsByProductUnit) => void;
    onClickDelete: (item: FieldsByProductUnit) => void;
}


export const TableProductUnits: React.FC<Props> = ({
    listFieldsByProductUnit,
    onClickAdd,
    onClickDelete
}) => {
    const { t } = useTranslation();
    const { fields, getFields } = useField();
    const {
        formulario: formValues,
        reset,
        setFormulario: setFormValues,
    } = useForm<FieldsByProductUnit>({
        id: "",
        fieldName: "",
        fieldId: "",
        hectares: "",
        productiveUnitId: ""
    });

    const columns: ColumnProps[] = [
        { text: t("field"), align: "center" },
        { text: t("hectares"), align: "center" },
        { text: "", align: "center" },
    ];

    useEffect(() => {
        getFields();
    }, [])

    return (
        <TableContainer
            sx={{
                minHeight: "120px",
                maxHeight: "440",
                overflow: "scroll",
                mb: 5
            }}
            component={Paper}>
            <DataTable
                key="datatable-product-units"
                columns={columns}
                isLoading={false}>
                <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                    <TableCellStyled align="left" sx={{ width: "40%" }} className="p-0 py-2 px-2">
                        <Autocomplete
                            value={fields.find(option => option._id === formValues.fieldId)}
                            onChange={(_e, newValue) => {
                                if (!newValue) return;
                                setFormValues({
                                    ...formValues,
                                    fieldId: newValue.uuid, //TODO: check if uuid is correct or _id
                                    fieldName: newValue.nombre,
                                    hectares: newValue?.campo_geojson?.properties?.hectareas || 0
                                });
                            }}
                            options={fields}
                            getOptionLabel={(option) => option.nombre || ''}
                            renderInput={(params) => (
                                <TextField {...params} label={t("_fields")} variant="outlined" />
                            )}
                            fullWidth
                        />
                    </TableCellStyled>
                    <TableCellStyled align="center" sx={{ width: "25%" }}>
                        <ListItemText
                            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                            secondary={
                                <Typography letterSpacing={1} variant='subtitle1'>
                                    {formValues.hectares || "-"}
                                </Typography>}
                        />
                    </TableCellStyled>
                    <TableCellStyled align='right' sx={{ width: "20%" }}>
                        <Fab
                            color="success"
                            aria-label="add"
                            size='small'
                            disabled={!formValues.fieldId}
                            onClick={() => {
                                onClickAdd({
                                    ...formValues,
                                    id: uuid4(),
                                });
                                reset();
                            }}>
                            <AddIcon />
                        </Fab>
                    </TableCellStyled>
                </ItemRow>
                {
                    listFieldsByProductUnit.length === 0 ? (
                        <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                            <TableCell align="center" colSpan={11} >
                                <NoteAddIcon fontSize='medium' />
                            </TableCell>
                        </ItemRow>) :
                        listFieldsByProductUnit.map((row) => (
                            <ItemRow key={row.id}>
                                <TableCellStyled align="center">{row.fieldName}</TableCellStyled>
                                <TableCellStyled align="center">
                                    {row?.hectares || t('no_data')}
                                </TableCellStyled>
                                <TableCellStyled align="center">
                                    <Tooltip title={t("icon_delete")}>
                                        <IconButton
                                            aria-label={t("icon_delete")}
                                            color="error"
                                            onClick={() => {
                                                onClickDelete(row);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCellStyled>
                            </ItemRow>
                        ))}
            </DataTable>
        </TableContainer>

    );
}