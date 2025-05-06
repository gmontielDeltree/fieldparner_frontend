import React, { useEffect, useState } from 'react';
import LaborOrderDoc from './LaborOrderPDF';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Paper,
    Box,
    Typography,
    Grid,
    TextField,
    Divider,
    Chip,
    Fade,
    useTheme,
    alpha,
    Card,
    CardContent,
    Stack,
    Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    Assignment as AssignmentIcon,
    Print as PrintIcon,
    Inventory2Rounded as InventoryIcon,
    CalendarToday as CalendarIcon,
    BusinessRounded as BusinessIcon,
    Grid4x4Rounded as GridIcon,
    TerrainRounded as TerrainIcon,
    CropRounded as CropIcon,
    StraightenRounded as MeasureIcon
} from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector, useBusiness, useCampaign, useForm, useOrder } from '../../../hooks';
import { uiCloseModal } from '../../../redux/ui';
import { ColumnProps, DepositSupplyOrderItem, DisplayModals, OrderStatus, WithdrawalOrder, WithdrawalOrderType } from '../../../types';
import { getShortDate } from '../../../helpers/dates';
import { DataTable, Loading } from '../..';
import { useLaborOrderPDF } from './LaborOrderPDF';
import { NotificationService } from "../../../services/notificationService";
import { RowSupply, InfoCard, SupplyHistory } from './LaborOrderComponents';
import {
    initializeOrderData,
    markItemsAsRetired,
    processActivityData
} from './LaborOrderHelpers';

export const LaborOrderModal = ({ activity, fieldName }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(false);
    const [withdrawalItems, setWithdrawalItems] = useState<DepositSupplyOrderItem[]>([]);
    const [activeOrder, setActiveOrder] = useState<WithdrawalOrder | null>(null);
    const [hasPrinted, setHasPrinted] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    const [retiredSupplies, setRetiredSupplies] = useState<any[]>([]);
    const [removedSupplies, setRemovedSupplies] = useState<any[]>([]);

    const { user } = useAppSelector((state) => state.auth);
    const { showModal } = useAppSelector((state) => state.ui);
    const { selectedCampaign } = useAppSelector((state) => state.campaign);
    const { lotActive } = useAppSelector((state) => state.map);

    const { getLaborOrder, getOrderWithDepositsAndSuppliesByOrder, createWithdrawalOrder } = useOrder();
    const { getBusinesses } = useBusiness();
    const { getCampaigns } = useCampaign();
    const { creationDate, handleInputChange } = useForm({ creationDate: getShortDate() });
    const { pdfInstance, updatePDF } = useLaborOrderPDF(activeOrder, withdrawalItems);

    // Debugging function to log state for print button conditions
    const logPrintButtonState = () => {
        console.log("Print Button Debug Info:");
        console.log("- activeOrder:", activeOrder);
        console.log("- withdrawalItems:", withdrawalItems);
        console.log("- withdrawalItems length:", withdrawalItems.length);
        console.log("- PDF instance URL:", pdfInstance?.url);
        console.log("- Print button should be enabled:", !!(activeOrder && withdrawalItems.length > 0));
    };

    // Cierra el modal y, si se imprimió, marca en la base
    const onCloseModal = async () => {
        if (hasPrinted && activeOrder) {
            try {
                await markItemsAsRetired(activity, withdrawalItems, t);
            } catch (error) {
                console.error("Error al cerrar el modal:", error);
            }
        }
        dispatch(uiCloseModal());
        setWithdrawalItems([]);
        setRemovedSupplies([]);
        setRetiredSupplies([]);
        setHasPrinted(false);
    };

    // Elimina de la lista de retiro
    const handleDeleteRow = (item: DepositSupplyOrderItem) => {
        console.log("Removing item from withdrawal list:", item);
        setRemovedSupplies(prev => [...prev, { ...item, removedDate: new Date().toISOString() }]);
        setWithdrawalItems(prev => prev.filter(x => x._id !== item._id));
        NotificationService.showInfo(t("itemRemovedFromList"), { name: item.supply.name });

        // Log updated state after a short delay to allow state to update
        setTimeout(logPrintButtonState, 100);
    };

    // Restaura un insumo eliminado
    const handleRestoreSupply = (item) => {
        console.log("Restoring item to withdrawal list:", item);
        setWithdrawalItems(prev => [...prev, { ...item, _id: `restored-${Date.now()}-${item._id}` }]);
        setRemovedSupplies(prev => prev.filter(x => x._id !== item._id));
        NotificationService.showSuccess(t("itemRestoredToList"), { name: item.supply.name });

        // Log updated state after a short delay to allow state to update
        setTimeout(logPrintButtonState, 100);
    };

    // Imprime y fija en `activity` las dosis como retiradas
    const handlePrint = async () => {
        console.log("Print button clicked. Current state:", {
            activeOrder: !!activeOrder,
            withdrawalItemsCount: withdrawalItems.length,
            hasPrinted
        });

        setHasPrinted(true);

        // 1) Tomo los nombres impresos
        const printedNames = withdrawalItems.map(item => item.supply.name);
        console.log("Printed supply names:", printedNames);

        // 2) Marco en activity.detalles.dosis
        if (activity?.detalles?.dosis) {
            activity.detalles.dosis.forEach(dose => {
                const originalName = dose.insumo?.name || dose.selectedOption?.name;
                if (printedNames.includes(originalName)) {
                    dose.retired = true;
                }
            });
            console.log("Updated activity.detalles.dosis:", activity.detalles.dosis);
        } else {
            console.warn("activity.detalles.dosis is undefined or null");
        }

        // 3) Actualizo UI de retirados
        const newlyRetired = withdrawalItems.map(item => ({
            ...item,
            retiredDate: new Date().toISOString()
        }));
        setRetiredSupplies(prev => [...prev, ...newlyRetired]);
        console.log("Updated retired supplies:", [...retiredSupplies, ...newlyRetired]);

        // 4) Crear orden de retiro en el sistema
        try {
            if (activeOrder && selectedCampaign && user) {
                // Extraer IDs limpios (sin prefijos)
                const campaignId = selectedCampaign._id?.includes(':')
                    ? selectedCampaign._id.split(':')[1]
                    : selectedCampaign._id || "";

                const contractorId = activity?.detalles?.contratista?._id?.includes(':')
                    ? activity.detalles.contratista._id.split(':')[1]
                    : activity?.detalles?.contratista?._id ||
                        activity?.contratista?._id?.includes(':')
                        ? activity.contratista._id.split(':')[1]
                        : activity?.contratista?._id || "";

                console.log("Using cleaned IDs:", {
                    campaignId,
                    contractorId,
                    originalCampaignId: selectedCampaign._id,
                    originalContractorId: activity?.detalles?.contratista?._id || activity?.contratista?._id
                });

                // Preparar objeto para la orden de retiro
                const withdrawalOrder = {
                    type: WithdrawalOrderType.Manual,
                    campaignId,
                    creationDate,
                    withdrawId: contractorId,
                    order: activeOrder.order || 0,
                    reason: `${t("laborOrder")} - ${fieldName || ""}`,
                    state: OrderStatus.Pending,
                    accountId: user.accountId || "",
                    field: fieldName || ""
                };

                // Preparar items de la orden
                const depositSupplyOrders = withdrawalItems.map(item => ({
                    accountId: user.accountId || "",
                    depositId: item.deposit?._id || "",
                    supplyId: item.supply?._id || "",
                    crop: activity?.tipo || "",
                    location: item.location || "",
                    nroLot: item.nroLot || "",
                    order: activeOrder.order || 0,
                    withdrawalAmount: 0,
                    originalAmount: Number(item.amount || 0),
                }));

                console.log("Creating withdrawal order:", withdrawalOrder);
                console.log("With deposit supply orders:", depositSupplyOrders);

                // Crear la orden
                const success = await createWithdrawalOrder(withdrawalOrder, depositSupplyOrders);
                if (success) {
                    NotificationService.showSuccess(
                        t("withdrawal_order_created_successfully"),
                        { number: activeOrder.order },
                    );
                } else {
                    console.error("Failed to create withdrawal order");
                    NotificationService.showError(t("error_creating_document"));
                }
            } else {
                console.warn("Missing required data to create withdrawal order:", {
                    hasActiveOrder: !!activeOrder,
                    hasSelectedCampaign: !!selectedCampaign,
                    hasUser: !!user
                });
                NotificationService.showError(t("error_creating_document"));
            }
        } catch (error) {
            console.error("Error creating withdrawal order:", error);
            NotificationService.showError(t("unexpectedError"));
        }

        // 5) Notificación
        NotificationService.showInfo(
            t("itemsWillBeMarkedAsWithdrawn"),
            { order: activeOrder?.order },
            t("orderPrinted")
        );
    };

    // Al abrir el modal inicializamos todo
    useEffect(() => {
        const initialize = async () => {
            if (showModal !== DisplayModals.LaborOrder) return;
            console.log("Initializing LaborOrderModal");
            setRemovedSupplies([]);
            setRetiredSupplies([]);
            setWithdrawalItems([]);
            setHasPrinted(false);
            setLoading(true);

            try {
                console.log("Fetching business and campaign data");
                await Promise.all([getBusinesses(), getCampaigns()]);

                console.log("Selected campaign:", selectedCampaign);
                if (selectedCampaign) {
                    console.log("Initializing order data with:", {
                        lotActive,
                        selectedCampaign,
                        activity,
                        fieldName
                    });

                    const orderData = await initializeOrderData({
                        lotActive,
                        selectedCampaign,
                        activity,
                        fieldName,
                        getLaborOrder,
                        getOrderWithDepositsAndSuppliesByOrder
                    });

                    console.log("Order data initialized:", orderData);
                    if (orderData) setActiveOrder(orderData);
                }

                console.log("Activity details:", activity?.detalles);
                if (activity?.detalles?.dosis?.length) {
                    console.log("Processing activity data for user:", user?.id);
                    // Preparo items activos
                    const activeItems = processActivityData(activity, user);
                    console.log("Active items processed:", activeItems);
                    setWithdrawalItems(activeItems);

                    // Ya retirados en DB o tras imprimir
                    const retiredInActivity = activity.detalles.dosis
                        .filter(d => d.retired)
                        .map((dose, idx) => {
                            const amount = parseFloat(dose.dosificacion || "0");
                            return {
                                _id: `retired-${idx}`,
                                accountId: user?.accountId || "",
                                deposit: dose.deposito || {},
                                supply: dose.insumo || dose.selectedOption || {},
                                location: dose.ubicacion || "",
                                nroLot: dose.nro_lote || "",
                                order: 0,
                                withdrawalAmount: amount,
                                originalAmount: amount,
                                amount,
                                retiredDate: dose.retiredDate || activity.fecha
                            };
                        });
                    console.log("Retrieved retired items:", retiredInActivity);
                    setRetiredSupplies(retiredInActivity);
                } else {
                    console.warn("No activity.detalles.dosis data found");
                }

                setTimeout(() => setFadeIn(true), 100);
            } catch (err) {
                console.error("Error initializing LaborOrderModal:", err);
            } finally {
                setLoading(false);
                // Log print button state after initialization
                setTimeout(logPrintButtonState, 200);
            }
        };

        initialize();
        return () => setFadeIn(false);
    }, [showModal]);

    // Actualizo el PDF cada vez que cambian los items
    useEffect(() => {
        if (activeOrder && withdrawalItems.length) {
            console.log("Updating PDF with:", {
                order: activeOrder.order,
                itemCount: withdrawalItems.length,
                creationDate
            });

            const orderWithDate = {
                ...activeOrder,
                creationDate,
                fieldName: fieldName || lotActive?.properties?.campo_nombre || lotActive?.properties?.campo_parent_nombre
            };

            updatePDF(
                <LaborOrderDoc withdrawalOrder={orderWithDate} depositAndSupplies={withdrawalItems} />
            );
        } else {
            console.log("Not updating PDF because conditions not met:", {
                hasActiveOrder: !!activeOrder,
                withdrawalItemsCount: withdrawalItems.length
            });
        }

        // Log print button state after PDF update
        logPrintButtonState();
    }, [activeOrder, withdrawalItems, creationDate, lotActive, fieldName]);

    // Columnas de la tabla
    const columns: ColumnProps[] = [
        { text: t("warehouse"), align: "left" },
        { text: t("supply"), align: "left" },
        { text: t("measurementUnit"), align: "center" },
        { text: t("location"), align: "center" },
        { text: t("amountToWithdraw"), align: "center" },
        { text: "", align: "right" }
    ];

    // Log every render
    console.log("LaborOrderModal render state:", {
        isModalShown: showModal === DisplayModals.LaborOrder,
        loading,
        hasActiveOrder: !!activeOrder,
        withdrawalItemsCount: withdrawalItems.length,
        hasPrinted,
        creationDate
    });

    return (
        <Dialog
            open={showModal === DisplayModals.LaborOrder}
            maxWidth="lg"
            fullWidth
            scroll="paper"
            onClose={onCloseModal}
            PaperProps={{ elevation: 12, sx: { borderRadius: 2, overflow: 'hidden' } }}
            TransitionComponent={Fade}
            transitionDuration={400}
        >
            {/* Header */}
            <Box sx={{
                position: 'relative',
                p: 3,
                textAlign: 'center',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                color: 'white'
            }}>
                <IconButton
                    aria-label={t("close")}
                    onClick={onCloseModal}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: 'white',
                        '&:hover': { backgroundColor: alpha('#ffffff', 0.1) }
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Fade in={fadeIn} timeout={800}>
                    <Box>
                        <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 2, bgcolor: 'white', color: theme.palette.primary.main }}>
                            <AssignmentIcon fontSize="large" />
                        </Avatar>
                        <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                            {t("warehouseWithdrawalOrder")}
                        </Typography>
                        {activeOrder && (
                            <Chip
                                label={`${t("order")}: ${activeOrder.order.toString().toUpperCase()}`}
                                color="secondary"
                                sx={{ borderRadius: '8px', px: 2, fontWeight: 'bold', fontSize: '0.9rem' }}
                            />
                        )}
                    </Box>
                </Fade>
            </Box>

            {/* Body */}
            <DialogContent sx={{ p: 3 }}>
                <Loading key="loading-labor" loading={loading} />
                <Fade in={fadeIn && !loading} timeout={600}>
                    <Paper variant="outlined" sx={{
                        my: { xs: 2, md: 3 },
                        p: { xs: 2, md: 3 },
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <Grid container spacing={2} mb={4}>
                            <Grid item xs={12} sm={4} md={3}>
                                <InfoCard
                                    icon={<CropIcon />}
                                    title={t("crop")}
                                    value={activity?.tipo?.toString().toUpperCase()}
                                    color="success"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <InfoCard
                                    icon={<CalendarIcon />}
                                    title={t("campaign")}
                                    value={selectedCampaign?.campaignId?.toString().toUpperCase()}
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <InfoCard
                                    icon={<TerrainIcon />}
                                    title={t("field")}
                                    value={
                                        fieldName ||
                                        lotActive?.properties?.campo_nombre ||
                                        lotActive?.properties?.campo_parent_nombre ||
                                        t("noAvailable")
                                    }
                                    color="info"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <InfoCard
                                    icon={<GridIcon />}
                                    title={t("lot")}
                                    value={lotActive?.properties?.nombre}
                                    color="secondary"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <InfoCard
                                    icon={<MeasureIcon />}
                                    title={t("hectares")}
                                    value={lotActive?.properties?.hectareas}
                                    color="warning"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <InfoCard
                                    icon={<BusinessIcon />}
                                    title={t("contractor")}
                                    value={
                                        activity?.detalles?.contratista?.nombreCompleto ||
                                        activity?.contratista?.nombreCompleto ||
                                        activity?.detalles?.contractor?.razonSocial ||
                                        "No disponible"
                                    }
                                    color="error"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}` }}>
                                    <CardContent>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                                <CalendarIcon />
                                            </Avatar>
                                            <TextField
                                                variant="outlined"
                                                type="date"
                                                label={t("date")}
                                                name="creationDate"
                                                value={creationDate}
                                                onChange={handleInputChange}
                                                InputProps={{ sx: { borderRadius: 1.5 } }}
                                                fullWidth
                                                size="small"
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {(retiredSupplies.length > 0 || removedSupplies.length > 0) && (
                            <SupplyHistory
                                retiredSupplies={retiredSupplies}
                                removedSupplies={removedSupplies}
                                onRestoreSupply={handleRestoreSupply}
                            />
                        )}

                        <Divider sx={{ my: 3, '&::before, &::after': { borderColor: alpha(theme.palette.primary.main, 0.2) } }}>
                            <Chip label={t("suppliesToWithdraw")} color="primary" icon={<InventoryIcon />} sx={{ px: 1, fontWeight: 'bold' }} />
                        </Divider>

                        <Box
                            component={Paper}
                            sx={{
                                minHeight: "120px",
                                maxHeight: "440px",
                                overflow: "auto",
                                mb: 5,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`
                            }}
                        >
                            <DataTable
                                key="datatable-orders"
                                columns={columns}
                                isLoading={false}
                                sx={{
                                    '& .MuiTableHead-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                                    '& .MuiTableHead-root .MuiTableCell-root': { color: theme.palette.primary.main, fontWeight: 'bold' }
                                }}
                            >
                                {withdrawalItems.map((row, index) => (
                                    <RowSupply key={row._id || `deposit-supply-${index}`} row={row} handleDelete={handleDeleteRow} />
                                ))}
                            </DataTable>
                            {withdrawalItems.length === 0 && (
                                <Box py={5} textAlign="center" sx={{ backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
                                    <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', backgroundColor: alpha(theme.palette.warning.light, 0.1), mb: 2 }}>
                                        <InventoryIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />
                                    </Box>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {t("noItemsToWithdraw")}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Fade>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
                    <Grid item>
                        <Button onClick={onCloseModal} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>
                            {t("cancel")}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            href={pdfInstance?.url || "#"}
                            target="_blank"
                            download={`order-${activeOrder?.order}.pdf`}
                            color="primary"
                            disabled={!activeOrder || withdrawalItems.length === 0}
                            onClick={handlePrint}
                            startIcon={<PrintIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                '&:hover': { boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}` }
                            }}
                        >
                            {t("printAndGenerateOrder")}
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};