import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Collapse, Container, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Add as AddIcon, Transform as TransformIcon } from "@mui/icons-material";
import { Loading, CloseButtonPage, TableCellStyled } from "../components";
import { useTransformStock } from "../hooks";
import { useTranslation } from "react-i18next";
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { StockMovementItem } from "../types";


interface RowProps {
    row: {
        income: StockMovementItem[],
        output: StockMovementItem[],
    }
};

function Row(props: RowProps) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    const totalIncome = row.income.reduce((total, row) => total + row.amount, 0);
    const totalOutput = row.output.reduce((total, row) => total + row.amount, 0);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.income[0].operationDate}
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.income[0].detail}
                </TableCell>
                <TableCell align="right">{totalIncome}</TableCell>
                <TableCell align="right">{totalOutput}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Insumo Origen
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCellStyled align="center">Insumo</TableCellStyled>
                                        <TableCellStyled align="center">Deposito</TableCellStyled>
                                        <TableCellStyled align="right">UM</TableCellStyled>
                                        <TableCellStyled align="right">Cantidad</TableCellStyled>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.income.map((rowIn, i) => (
                                        <TableRow key={i}>
                                            <TableCell align="center" component="th" scope="row">
                                                {rowIn.supply?.name}
                                            </TableCell>
                                            <TableCell align="center">{rowIn.deposit?.description}</TableCell>
                                            <TableCell align="right">{rowIn.supply?.unitMeasurement}</TableCell>
                                            <TableCell align="right">
                                                {rowIn.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Typography variant="h6" gutterBottom component="div" sx={{ mt: 1 }}>
                                Insumo Destino
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCellStyled align="center">Insumo</TableCellStyled>
                                        <TableCellStyled align="center">Deposito</TableCellStyled>
                                        <TableCellStyled align="right">UM</TableCellStyled>
                                        <TableCellStyled align="right">Cantidad</TableCellStyled>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.output.map((rowOut, i) => (
                                        <TableRow key={i}>
                                            <TableCell align="center" component="th" scope="row">
                                                {rowOut.supply?.name}
                                            </TableCell>
                                            <TableCell align="center">{rowOut.deposit?.description}</TableCell>
                                            <TableCell align="right">{rowOut.supply?.unitMeasurement}</TableCell>
                                            <TableCell align="right">
                                                {rowOut.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export const ListTransformPage: React.FC = () => {
    const navigate = useNavigate();
    const { isLoading, transformMovements, getTransformationMovements } = useTransformStock();
    const { t } = useTranslation();

    // const columns: GridColDef[] = [
    //     // { field: "id", hide: true },
    //     { field: "date", headerName: t("_date"), width: 150 },
    //     { field: "supply", headerName: t("type_supply"), width: 150 },
    //     { field: "deposit", headerName: t("_warehouse"), width: 150 },
    //     { field: "isIncome", headerName: t("income_outcome"), width: 120 },
    //     { field: "um", headerName: "UM", width: 150 },
    //     { field: "amount", headerName: t("_quantity"), width: 150 },
    // ];

    // const onClickSearch = (): void => {
    //   if (filterText === "") {
    //     getStockMovements();
    //     return;
    //   }
    // };

    const onClickNewTransform = () =>
        navigate("/init/overview/value-transform/new");

    useEffect(() => {
        getTransformationMovements();
    }, []);

    return (
        <Container sx={{ paddingLeft: "0px !important" }} maxWidth="lg">
            {isLoading && <Loading loading={true} />}
            <Box
                component="div"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
            >
                <Box display="flex" alignItems="center">
                    <TransformIcon />
                    <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
                        {t("transformation_added_value")}
                    </Typography>
                </Box>
                <CloseButtonPage />
            </Box>
            <Box component="div" sx={{ mt: 3 }}>
                <Grid
                    container
                    spacing={0}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2, mt: { sm: 2 } }}
                >
                    <Grid item xs={6} sm={2}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={onClickNewTransform}
                        >
                            {t("add_new")}
                        </Button>
                    </Grid>
                </Grid>
                <Box component="div" sx={{ p: 1 }}>
                    <TableContainer component={Paper}>
                        <Table aria-label="collapsible table">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCellStyled>Fecha</TableCellStyled>
                                    <TableCellStyled align="center">Detalle</TableCellStyled>
                                    <TableCellStyled align="right">Total Ingreso</TableCellStyled>
                                    <TableCellStyled align="right">Total Salida</TableCellStyled>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.values(transformMovements).map((row, index) => (
                                    <Row key={index} row={row} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Container>
    );
};


