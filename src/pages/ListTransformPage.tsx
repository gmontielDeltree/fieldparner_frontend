import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { Add as AddIcon, Transform as TransformIcon } from "@mui/icons-material";
import { Loading, CloseButtonPage } from "../components";
import { useStockMovement } from "../hooks";
import { useTranslation } from "react-i18next";


interface RowStockMovementItem {
    id: string;
    date: string;
    movement: string;
    supply: string;
    deposit: string;
    movementType: string;
    isIncome: string;
    um: string;
    amount: number;
}

export const ListTransformPage: React.FC = () => {
    const navigate = useNavigate();
    const { isLoading, stockMovements, getStockMovements } = useStockMovement();
    const { t } = useTranslation();

    const columns: GridColDef[] = [
        // { field: "id", hide: true },
        { field: "date", headerName: t("_date"), width: 150 },
        { field: "supply", headerName: t("type_supply"), width: 150 },
        { field: "deposit", headerName: t("_warehouse"), width: 150 },
        { field: "isIncome", headerName: t("income_outcome"), width: 120 },
        { field: "um", headerName: "UM", width: 150 },
        { field: "amount", headerName: t("_quantity"), width: 150 },
    ];

    const rows = useMemo(() => {
        return stockMovements.map((sm) => {
            return {
                id: sm._id,
                date: sm.creationDate,
                movement: sm.movement,
                supply: `${sm.supply?.type}/${sm.supply?.name}`,
                deposit: sm.deposit?.description,
                movementType: sm.typeMovement,
                isIncome: sm.isIncome ? t("_income") : t("_outcome"),
                um: sm.supply?.unitMeasurement,
                amount: sm.amount,
            } as RowStockMovementItem;
        });
    }, [stockMovements]);

    // const onClickSearch = (): void => {
    //   if (filterText === "") {
    //     getStockMovements();
    //     return;
    //   }
    // };

    const onClickNewTransform = () =>
        navigate("/init/overview/value-transform/new");

    useEffect(() => {
        getStockMovements();
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
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        rowSelection={false}
                        loading={isLoading}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        pageSizeOptions={[10, 15, 20]}
                    />
                </Box>
            </Box>
        </Container>
    );
};


