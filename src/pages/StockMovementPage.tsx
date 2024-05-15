import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridToolbar, esES, ptBR, enUS } from "@mui/x-data-grid";
// import { esES as dateLocale } from '@mui/material/locale';
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { Add as AddIcon, SyncAlt as SyncAltIcon } from "@mui/icons-material";
import { Loading, CloseButtonPage } from "../components";
import { useStockMovement } from "../hooks";
import { useTranslation } from "react-i18next";

//TODO: cambiar DataGrid por un DataTable custom

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
  documentFile: string;
}

export const StockMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, stockMovements, getStockMovements } = useStockMovement();
  const { t } = useTranslation();

  const columns: GridColDef[] = [
    // { field: "id", hide: true },
    { field: "date", headerName: t("_date"), width: 150 },
    { field: "movement", headerName: t("_movement"), width: 120 },
    { field: "supply", headerName: t("type_supply"), width: 150 },
    { field: "deposit", headerName: t("_warehouse"), width: 150 },
    { field: "movementType", headerName: t("movement_type"), width: 150 },
    { field: "isIncome", headerName: t("income_outcome"), width: 120 },
    { field: "um", headerName: "UM", width: 150 },
    { field: "amount", headerName: t("_quantity"), width: 150 },
    { field: "documentFile", headerName: t("_file"), width: 250 },
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
        documentFile: sm.documentFile
      }
    });
  }, [stockMovements]);

  const localeText = useMemo(() => {
    const language = localStorage.getItem("language") || "es";

    if (language === "en")
      return enUS.components.MuiDataGrid.defaultProps.localeText;
    if (language === "pt")
      return ptBR.components.MuiDataGrid.defaultProps.localeText;

    return esES.components.MuiDataGrid.defaultProps.localeText;
  }, []);

  // const onClickSearch = (): void => {
  //   if (filterText === "") {
  //     getStockMovements();
  //     return;
  //   }
  // };

  const onClickAddMovement = () =>
    navigate("/init/overview/stock-movements/new");

  useEffect(() => {
    getStockMovements();
  }, []);

  return (
    <Container sx={{ paddingLeft: "0px !important" }} maxWidth={"lg"}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
          <SyncAltIcon sx={{ marginRight: '8px' }} />
          <Typography component="h4" variant="h5" sx={{ ml: { sm: 2 } }}>
            {t("stock_movements")}
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
              onClick={onClickAddMovement}
            >
              {t("add_new")}
            </Button>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            localeText={localeText}
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


