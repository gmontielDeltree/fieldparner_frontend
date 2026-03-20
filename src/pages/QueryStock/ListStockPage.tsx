import React, { useEffect, useState, useMemo } from "react";
import {
  Loading,
  DataTable,
  ItemRow,
  TableCellStyled,
  CloseButtonPage,
  StockSupplyModal,
  SupplyByDepositsModal
} from "../../components";
import { ColumnProps, DisplayModals, Supply } from "../../types";
import {
  Box,
  Chip,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  Grid,
} from "@mui/material";
import {
  QueryStats as QueryStatsIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useAppDispatch, useSupply, useAppSelector } from "../../hooks";
import { uiOpenModal } from "../../redux/ui";
import { setSupplyActive } from "../../redux/supply";
import { useTranslation } from "react-i18next";
import { StockItem } from "../../interfaces/stock";
import { dbContext } from "../../services";




interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const ListStockPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const {
    isLoading,
    stockBySupplies,
    stockByDeposits,
    getStockByDeposits,
    getStockData,
  } = useSupply();
  // const { getStock } = useStockMovement();
  const [tabValue, setTabValue] = React.useState(0);
  const [cropStockData, setCropStockData] = useState<any[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const { t } = useTranslation();

  // Filter states for supplies tab
  const [supplyTypeFilter, setSupplyTypeFilter] = useState("");
  const [supplyNameFilter, setSupplyNameFilter] = useState("");

  // Filter states for deposits tab
  const [depositFilter, setDepositFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [depositSupplyTypeFilter, setDepositSupplyTypeFilter] = useState("");
  const [depositSupplyNameFilter, setDepositSupplyNameFilter] = useState("");

  const columnsBySupply: ColumnProps[] = [
    { text: t("_type"), align: "left" },
    { text: t("_supply"), align: "center" },
    { text: "UM", align: "center" },
    { text: t("current_stock"), align: "center" },
    { text: t("reserved_stock"), align: "center" },
    { text: t("available_stock"), align: "center" },
  ];

  const columnsByDeposit: ColumnProps[] = [
    { text: t("_warehouse"), align: "left" },
    { text: t("_location"), align: "left" },
    { text: t("_type"), align: "left" },
    { text: `${t("_supply")} / ${t("_crop")}`, align: "center" },
    { text: "UM", align: "center" },
    { text: t("current_stock"), align: "center" },
    { text: t("reserved_stock"), align: "center" },
    { text: t("available_stock"), align: "center" },
  ];

  const [selectedSupplyDeposit, setSelectedSupplyDeposit] =
    useState<StockItem | null>(null);

  // Filter supplies data
  const filteredStockBySupplies = useMemo(() => {
    return stockBySupplies.filter((stock) => {
      const typeMatch = !supplyTypeFilter ||
        stock?.dataSupply?.type?.toLowerCase().includes(supplyTypeFilter.toLowerCase());
      const nameMatch = !supplyNameFilter ||
        stock?.dataSupply?.name?.toLowerCase().includes(supplyNameFilter.toLowerCase());
      return typeMatch && nameMatch;
    });
  }, [stockBySupplies, supplyTypeFilter, supplyNameFilter]);

  // Filter deposits data
  const filteredStockByDeposits = useMemo(() => {
    return stockByDeposits.filter((stock) => {
      const depositMatch = !depositFilter ||
        stock?.dataDeposit?.description?.toLowerCase().includes(depositFilter.toLowerCase());
      const locationMatch = !locationFilter ||
        stock?.location?.toLowerCase().includes(locationFilter.toLowerCase());
      const typeMatch = !depositSupplyTypeFilter ||
        stock?.dataSupply?.type?.toLowerCase().includes(depositSupplyTypeFilter.toLowerCase());
      const nameMatch = !depositSupplyNameFilter ||
        stock?.dataSupply?.name?.toLowerCase().includes(depositSupplyNameFilter.toLowerCase());
      return depositMatch && locationMatch && typeMatch && nameMatch;
    });
  }, [stockByDeposits, depositFilter, locationFilter, depositSupplyTypeFilter, depositSupplyNameFilter]);

  const onChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Clear filters when changing tabs
    if (newValue === 0) {
      setDepositFilter("");
      setLocationFilter("");
      setDepositSupplyTypeFilter("");
      setDepositSupplyNameFilter("");
    } else {
      setSupplyTypeFilter("");
      setSupplyNameFilter("");
    }
  };

  const onClickSupply = (supplySelected: Supply) => {
    dispatch(setSupplyActive(supplySelected));
    dispatch(uiOpenModal(DisplayModals.SupplyByDeposits));
  };

  const onClickDeposit = (item: StockItem) => {
    setSelectedSupplyDeposit(item);
    dispatch(uiOpenModal(DisplayModals.SupplyByLots));
  };

  const loadCropStock = async () => {
    if (!user) return;
    setLoadingCrops(true);
    try {
      const [cropsRes, controlRes, campaignsRes] = await Promise.all([
        dbContext.crops.allDocs({ include_docs: true }),
        dbContext.cropStockControl.find({ selector: { accountId: user.accountId } }),
        dbContext.campaigns.find({ selector: { accountId: user.accountId } })
      ]);
      const crops = cropsRes.rows.map(r => r.doc);
      const controls = controlRes.docs;
      const campaigns = campaignsRes.docs;

      const data = controls.map((ctrl: any) => {
        const crop = crops.find((c: any) => c._id === ctrl.cropId);
        const campaign = campaigns.find((c: any) => c._id === ctrl.campaignId);
        return {
          _id: ctrl._id,
          cropName: crop?.descriptionES || crop?.descriptionEN || ctrl.cropId,
          campaign: campaign?.name || ctrl.campaignId,
          zafra: ctrl.zafra || '-',
          currentStock: ctrl.currentStock || 0,
          committedStock: ctrl.committedStock || 0,
          deliveredStock: ctrl.deliveredStock || 0,
          available: (ctrl.currentStock || 0) - (ctrl.committedStock || 0),
          pending: (ctrl.committedStock || 0) - (ctrl.deliveredStock || 0),
        };
      });
      setCropStockData(data);
    } finally {
      setLoadingCrops(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) getStockData();
    else if (tabValue === 1) getStockByDeposits();
    else if (tabValue === 2) loadCropStock();
  }, [tabValue]);


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {isLoading && <Loading loading={true} />}
      <Card elevation={5} sx={{ p: 2, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', borderRadius: '16px' }}>
        <CardHeader
          avatar={<QueryStatsIcon sx={{ fontSize: 40, color: "#424242" }} />}
          title={
            <Typography component="h2" variant="h4" sx={{ fontWeight: 'bold', color: "#424242" }}>
              {t("stock_query")}
            </Typography>
          }
          action={<CloseButtonPage />}
        />
        <CardContent>
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Tabs
                value={tabValue}
                onChange={onChangeTab}
                aria-label="tabs-stock"
              >
                <Tab
                  label={
                    <Box>
                      {t("by_supply")} <InventoryIcon sx={{ ml: 1 }} />
                    </Box>
                  }
                  {...a11yProps(0)}
                />
                <Tab
                  label={
                    <Box>
                      {t("by_warehouse")} <WarehouseIcon sx={{ ml: 1 }} />
                    </Box>
                  }
                  {...a11yProps(1)}
                />
                <Tab
                  label={
                    <Box>
                      {t("_crop")} <QueryStatsIcon sx={{ ml: 1 }} />
                    </Box>
                  }
                  {...a11yProps(2)}
                />
              </Tabs>
              {/* <FormControlLabel
              control={
                <Switch
                  name="stockWithZero"
                  checked={showStockValueZero}
                  onChange={(_e, checked: boolean) =>
                    setShowStockValueZero(checked)
                  }
                />
              }
              label={t("show_zero_stock")}
              labelPlacement="start"
            /> */}
            </Box>
            <CustomTabPanel value={tabValue} index={0}>
              <Box component="div">
                {/* Filter inputs for supplies */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t("filterByType")}
                      value={supplyTypeFilter}
                      onChange={(e) => setSupplyTypeFilter(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: '8px',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t("filterBySupply")}
                      value={supplyNameFilter}
                      onChange={(e) => setSupplyNameFilter(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: '8px',
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <DataTable
                    key="bySupply"
                    columns={columnsBySupply}
                    isLoading={isLoading}
                  >
                    {filteredStockBySupplies
                      .filter((s) => !s.dataCrop)
                      .map((stock) => (
                        <ItemRow key={stock._id} hover>
                          <TableCellStyled align="left">{stock?.dataSupply?.type}</TableCellStyled>
                          <TableCellStyled align="center">{stock?.dataSupply?.name}</TableCellStyled>
                          <TableCellStyled align="center">
                            {stock?.dataSupply?.unitMeasurement}
                          </TableCellStyled>
                          <TableCellStyled align="center">
                            <Chip
                              label={stock?.currentStock}
                              variant="filled"
                              color="primary"
                              onClick={() => stock.dataSupply && onClickSupply(stock.dataSupply)}
                            />
                          </TableCellStyled>
                          <TableCellStyled align="center">
                            <Chip label={stock.reservedStock} variant="outlined" />
                          </TableCellStyled>
                          <TableCellStyled align="center">
                            <Chip
                              label={stock?.currentStock - stock?.reservedStock}
                              color="success"
                            />
                          </TableCellStyled>
                        </ItemRow>
                      ))}
                  </DataTable>
                </Paper>
              </Box>
              <SupplyByDepositsModal key="supply-deposits-modal" />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={1}>
              <Box component="div">
                {selectedSupplyDeposit && (
                  <StockSupplyModal
                    key="supply-lot-modal"
                    selectedRow={selectedSupplyDeposit}
                  />
                )}
                {/* Filter inputs for deposits */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t("filterByWarehouse")}
                      value={depositFilter}
                      onChange={(e) => setDepositFilter(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: '8px',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t("filterByLocation")}
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: '8px',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t("filterByType")}
                      value={depositSupplyTypeFilter}
                      onChange={(e) => setDepositSupplyTypeFilter(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: '8px',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t("filterBySupply")}
                      value={depositSupplyNameFilter}
                      onChange={(e) => setDepositSupplyNameFilter(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: '8px',
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <DataTable
                    key="byDeposit"
                    columns={columnsByDeposit}
                    isLoading={isLoading}
                  >
                    {filteredStockByDeposits
                      // .filter((s) => (showStockValueZero ? s : s.currentStock > 0))
                      .map((row) => (
                        <ItemRow
                          key={`${row?.dataDeposit?._id}-${row?.dataSupply?._id}`}
                          hover
                        >
                          <TableCellStyled align="left">
                            {row?.dataDeposit?.description.trim()}
                          </TableCellStyled>
                          <TableCellStyled align="left">
                            {row?.location.trim() || row?.dataDeposit?.locations[0] || "-"}
                          </TableCellStyled>
                          <TableCellStyled>{row?.dataSupply?.type || row?.dataCrop?.cropType}</TableCellStyled>
                          <TableCellStyled align="center">{row?.dataSupply?.name || row?.dataCrop?.descriptionEN}</TableCellStyled>
                          <TableCellStyled align="center">
                            {row?.dataSupply?.unitMeasurement || "-"}
                          </TableCellStyled>
                          <TableCellStyled align="center">
                            <Chip
                              label={row.currentStock}
                              variant="filled"
                              color="primary"
                              onClick={() => row && onClickDeposit(row)}
                            />
                          </TableCellStyled>
                          <TableCellStyled align="center">
                            <Chip label={row.reservedStock} variant="outlined" />
                          </TableCellStyled>
                          <TableCellStyled align="center">
                            <Chip
                              label={row.currentStock - row.reservedStock}
                              color="success"
                            />
                          </TableCellStyled>
                        </ItemRow>
                      ))}
                  </DataTable>
                </Paper>
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={2}>
              <Box component="div">
                {loadingCrops && <Loading loading={true} />}
                <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <DataTable
                    key="byCrop"
                    columns={[
                      { text: t("_crop"), align: "left" },
                      { text: t("_campaign"), align: "center" },
                      { text: "Zafra", align: "center" },
                      { text: t("available"), align: "center" },
                      { text: t("committed"), align: "center" },
                      { text: t("delivered"), align: "center" },
                      { text: t("available_to_sell"), align: "center" },
                      { text: t("pending_delivery"), align: "center" },
                    ]}
                    isLoading={loadingCrops}
                  >
                    {cropStockData.map((row) => (
                      <ItemRow key={row._id} hover>
                        <TableCellStyled align="left">{row.cropName}</TableCellStyled>
                        <TableCellStyled align="center">{row.campaign}</TableCellStyled>
                        <TableCellStyled align="center">{row.zafra}</TableCellStyled>
                        <TableCellStyled align="center">
                          <Chip label={row.currentStock} variant="filled" color="primary" />
                        </TableCellStyled>
                        <TableCellStyled align="center">
                          <Chip label={row.committedStock} variant="outlined" color="warning" />
                        </TableCellStyled>
                        <TableCellStyled align="center">
                          <Chip label={row.deliveredStock} variant="outlined" color="success" />
                        </TableCellStyled>
                        <TableCellStyled align="center">
                          <Chip label={row.available} color={row.available > 0 ? "success" : "error"} />
                        </TableCellStyled>
                        <TableCellStyled align="center">
                          <Chip label={row.pending} color={row.pending > 0 ? "warning" : "default"} />
                        </TableCellStyled>
                      </ItemRow>
                    ))}
                  </DataTable>
                </Paper>
              </Box>
            </CustomTabPanel>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};