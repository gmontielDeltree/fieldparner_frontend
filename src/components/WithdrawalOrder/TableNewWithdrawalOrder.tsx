import { Fab, FormControl, IconButton, InputAdornment, InputLabel, ListItemText, MenuItem, Paper, Select, SelectChangeEvent, TableCell, TableContainer, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { DataTable, ItemRow, TableCellStyled } from "../DataTable";
import { ColumnProps, Deposit, Supply, TransformSupply } from "../../types";
import {
    NoteAdd as NoteAddIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { AutocompleteDeposit, AutocompleteSupply } from "../Autocomplete";
import { useDeposit, useForm, useSupply } from "../../hooks";
import uuid4 from "uuid4";
import { useTranslation } from "react-i18next";


interface Props {
    suppliesToAdd: TransformSupply[];
    onClickAdd: (supply: TransformSupply) => void;
    onClickDelete: (supply: TransformSupply) => void;
}

const initialFormValues = {
    campaignId: "",
    supplyId: "",
    cropId: "",
    depositId: "",
    location: "",
    nroLot: "",
    amount: 0
};

export const TableNewWithdrawalOrder: React.FC<Props> = ({
    suppliesToAdd,
    onClickAdd,
    onClickDelete
}) => {
    const { t } = useTranslation();
    const {
        location,
        nroLot,
        amount,
        handleInputChange,
        reset,
        formulario: formValues,
        setFormulario,
    } = useForm(initialFormValues);
    const { isLoading: supplyLoading,
        stockBySupplies, //Data de stock por cada insumo 
        getStockData } = useSupply();
    const {
        isLoading: depositLoading,
        deposits,
        getDeposits,
        getDepositsBySupplyId } = useDeposit();

    const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
    const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);

    const columns: ColumnProps[] = [
        { text: t("_supply"), align: "left" },
        { text: t("_warehouse"), align: "left" },
        { text: t("_location"), align: "left" },
        { text: t("batchNumber"), align: "center" },
        { text: t("measurementUnit"), align: "center" },
        { text: t("amountToWithdraw"), align: "center" },
        { text: "", align: "center" },
    ];

    const onChangeLocation = ({ target }: SelectChangeEvent) => {
        const { value } = target;
        setFormulario((prevState) => ({ ...prevState, location: value }));
    };

    useEffect(() => {
        getStockData();
        getDeposits();
    }, [])

    return (
        <TableContainer
            key="table-new-supply"
            sx={{
                minHeight: "120px",
                maxHeight: "440",
                overflow: "scroll",
                mb: 5
            }}
            component={Paper}
        >
            <DataTable
                key="datatable-new-orders"
                columns={columns}
                isLoading={supplyLoading || depositLoading}
            >
                <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                    <TableCellStyled align="left" sx={{ minWidth: "150px" }} className="p-0 py-2 px-2">
                        <AutocompleteSupply
                            size="small"
                            value={supplySelected}
                            options={stockBySupplies.map(x => x.dataSupply).filter((supply): supply is Supply => supply !== undefined)}
                            error={false}
                            helperText=""
                            onChange={(newValue) => {
                                if (newValue?._id) {
                                    setSupplySelected(newValue);
                                    getDepositsBySupplyId(newValue._id);
                                    setFormulario((prevState) => ({
                                        ...prevState,
                                        supplyId: newValue._id || ""
                                    }));
                                }
                            }}
                        />
                    </TableCellStyled>
                    <TableCellStyled
                        align="left"
                        sx={{ minWidth: "150px" }}
                        className="p-0 py-2 px-2">
                        <AutocompleteDeposit
                            size="small"
                            value={depositSelected}
                            options={deposits}
                            onChange={(newValue) => {
                                if (newValue?._id) {
                                    setDepositSelected(newValue);
                                    setFormulario((prevState) => ({
                                        ...prevState,
                                        depositId: newValue._id || ""
                                    }));
                                }
                            }}
                        />
                    </TableCellStyled>
                    <TableCellStyled align="left" sx={{ minWidth: "140px" }} className="p-0 py-2 px-2">
                        <FormControl size="small" fullWidth>
                            <InputLabel id="location">{t("id_location")}</InputLabel>
                            <Select
                                labelId="location"
                                size="small"
                                name="origin"
                                value={location}
                                label={t("id_location")}
                                onChange={onChangeLocation}
                            >
                                {depositSelected?.locations.map((loc) => (
                                    <MenuItem key={loc} value={loc}>
                                        {loc}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </TableCellStyled>
                    <TableCellStyled align='center' sx={{ maxWidth: "100px" }} className="p-0 py-2 px-2">
                        <TextField
                            key="nroLot-input"
                            variant="outlined"
                            type="text"
                            size="small"
                            name="nroLot"
                            value={nroLot}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </TableCellStyled>
                    <TableCellStyled align="center" sx={{ maxWidth: "140px" }}>
                        <ListItemText
                            primary={<Typography variant='subtitle2'>{supplySelected?.unitMeasurement || "-"}</Typography>}
                            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        />
                    </TableCellStyled>
                    <TableCellStyled align='center' sx={{ maxWidth: "120px" }} className="p-0 py-2 px-2">
                        <TextField
                            key="amount"
                            variant="outlined"
                            type="number"
                            name="amount"
                            size="small"
                            value={amount}
                            onChange={handleInputChange}
                            inputProps={{ maxLength: 15, min: 1 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                        />
                    </TableCellStyled>
                    <TableCellStyled align='center'>
                        <Fab
                            color="success"
                            aria-label="add"
                            size='small'
                            onClick={() => {
                                if (supplySelected && depositSelected) {
                                    onClickAdd({
                                        id: uuid4(),
                                        campaignId: formValues.campaignId,
                                        deposit: depositSelected,
                                        supply: supplySelected,
                                        location,
                                        nroLot,
                                        crop: null,
                                        dueDate: "",
                                        amount: Number(amount),
                                        currentStock: 0
                                    });

                                    reset();
                                    setSupplySelected(null);
                                    setDepositSelected(null);
                                }
                            }}>
                            <AddIcon />
                        </Fab>
                    </TableCellStyled>
                </ItemRow>
                {
                    suppliesToAdd.length === 0 ? (
                        <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                            <TableCell align="center" colSpan={11} >
                                <NoteAddIcon fontSize='medium' />
                            </TableCell>
                        </ItemRow>
                    ) : suppliesToAdd.map((row) => (
                        <ItemRow key={row.id}>
                            <TableCellStyled align="left">{row.supply?.name} </TableCellStyled>
                            <TableCellStyled align="left">
                                {row.deposit?.description}
                            </TableCellStyled>
                            <TableCellStyled align="center">{row.location}</TableCellStyled>
                            <TableCellStyled align='center'>{row.nroLot || "-"}</TableCellStyled>
                            <TableCellStyled align="center">{row.supply?.unitMeasurement}</TableCellStyled>
                            <TableCellStyled align='center'>{row.amount}</TableCellStyled>
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