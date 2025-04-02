import Swal from 'sweetalert2';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Paper, Box, Typography, Grid, TextField, InputAdornment, TableContainer, Divider, Link } from '@mui/material';
import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector, useBusiness, useCampaign, useDeposit, useForm, useOrder, useSupply } from '../../../hooks';
import { uiCloseModal } from '../../../redux/ui';
import { ColumnProps, DepositSupplyOrder, DepositSupplyOrderItem, DisplayModals, OrderStatus, Supply, TipoEntidad, TransformSupply, WithdrawalOrder, WithdrawalOrderType } from '../../../types';
import {
    Close as CloseIcon,
    Assignment as AssignmentIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { Icon } from "semantic-ui-react";
import { getShortDate } from '../../../helpers/dates';
import { DataTable, ItemRow, Loading, NewSupplyCropRow, TableCellStyled } from '../..';
import { useTranslation } from "react-i18next";

import {
    usePDF,
    Image,
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
} from '@react-pdf/renderer';


// Estilos para el PDF
const styles = StyleSheet.create({
    body: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 30,
    },
    subtitle: {
        fontSize: 18,
        margin: 12,
        fontFamily: 'Helvetica'
    },
    text: {
        margin: 12,
        fontSize: 18,
        textAlign: 'justify',
        fontFamily: 'Courier-Bold'
    },
    textDetail: {
        margin: 12,
        fontSize: 14,
        textAlign: 'justify',
        fontFamily: 'Courier-Bold'
    },
    textBody: {
        margin: 12,
        fontSize: 14,
        textAlign: 'justify',
        fontFamily: 'Times-Roman'
    },
    page: {
        display: "flex",
        flexDirection: 'row',
        backgroundColor: '#E4E4E4',
    },
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "90px"
    },
    section: {
        margin: 1,
        // flexGrow: 1,
    },
    image: {
        width: "30px",
        height: "30px",
        // objectFit: "center",
        // margin: 2
    },
    titleImage: {
        fontFamily: 'Helvetica',
        fontSize: 22,
        color: "#71d076",
        textAlign: "center",
        letterSpacing: "3px",
        // marginTop: 12,
        marginLeft: 5
    },
    titlePrincipal: {
        marginTop: 25,
        fontFamily: 'Courier',
        fontSize: 24,
        textAlign: "center",
    },
});

interface RowSupplyProps {
    row: DepositSupplyOrderItem;
    handleEdit: (item: DepositSupplyOrderItem) => void;
    handleDelete: (item: DepositSupplyOrderItem) => void;
}
const RowSupply: React.FC<RowSupplyProps> = ({ row, handleDelete, handleEdit }) => {
    const { t } = useTranslation();

    const { amountValue, handleInputChange } = useForm({ amountValue: row.amount });
    const [isEdit, setIsEdit] = useState(false);

    const onClickEdit = () => {
        setIsEdit(true);
    }
    const handleSaveEdit = () => {
        handleEdit({ ...row, amount: Number(amountValue) });
        setIsEdit(false);
    }
    const handleCancelEdit = () => {
        setIsEdit(false);
    }

    return (
        <ItemRow key={row._id}>
            <TableCellStyled align="left">
                {row.deposit.description}
            </TableCellStyled>
            <TableCellStyled align="left">{row.supply.name} </TableCellStyled>
            <TableCellStyled align="center">{row.supply.unitMeasurement}</TableCellStyled>
            <TableCellStyled align='center'>{row.location || "-"}</TableCellStyled>
            <TableCellStyled align='center'>{
                isEdit ? (
                    <TextField
                        type="number"
                        name="amountValue"
                        size='small'
                        value={amountValue}
                        onChange={handleInputChange}
                    />) : row.amount
            }</TableCellStyled>
            <TableCellStyled align='center'>
                {
                    isEdit ? (
                        <>
                            <IconButton
                                color="primary"
                                aria-label={t('save')}
                                onClick={handleSaveEdit}
                            >
                                <SaveIcon />
                            </IconButton>
                            <IconButton
                                color="secondary"
                                aria-label={t('cancel')}
                                onClick={handleCancelEdit}
                            >
                                <CloseIcon />
                            </IconButton>
                        </>
                    ) :
                        <>
                            <IconButton
                                onClick={onClickEdit}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => handleDelete(row)}
                                style={{ fontSize: '1rem' }}
                            >
                                <DeleteIcon />

                            </IconButton>
                        </>
                }
            </TableCellStyled>
        </ItemRow>
    )
}

interface LaborOrderDocProps {
    withdrawalOrder: WithdrawalOrder;
    depositAndSupplies: DepositSupplyOrderItem[];
}

const LaborOrderDoc: React.FC<LaborOrderDocProps> = ({
    withdrawalOrder,
    depositAndSupplies
}) => {
    const contractor = withdrawalOrder.contractor;
    let contractorName = (contractor && contractor.tipoEntidad === TipoEntidad.FISICA) ? contractor.nombreCompleto : contractor?.razonSocial;

    return (
        <Document title='QTS Agro'>
            <Page size="A3" style={styles.body}>
                <View style={styles.header}>
                    <Image style={styles.image} src={"/assets/images/logos/agrootolss_logo_sol.png"} />
                    <Text style={styles.titleImage}>QTS Agro</Text>
                    <Text style={styles.titlePrincipal}>Orden Retiro Nro: {withdrawalOrder.order} </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.text}>Fecha: <Text style={styles.textBody}>{withdrawalOrder.creationDate}</Text> - Contratista: <Text style={styles.textBody}>{contractorName || ""}</Text> - Labor: <Text style={styles.textBody}>{withdrawalOrder.labor?.toUpperCase()}</Text></Text>
                </View>
                {
                    depositAndSupplies.map(x => (
                        <>
                            <View key={x._id} style={styles.section}>
                                <Text style={styles.textDetail}>Deposito:<Text style={styles.textBody}>{x.deposit.description}</Text> Insumo:<Text style={styles.textBody}>{x.supply.name}</Text> UM:<Text style={styles.textBody}>{x.supply.unitMeasurement} </Text> Cantidad a Retirar:<Text style={styles.textBody}>{x.amount}</Text></Text>
                            </View>
                            <View style={{ width: "100%", borderBottom: "1px solid black" }} />
                        </>
                    ))
                }
            </Page>
        </Document >
    )
}

export const LaborOrderModal = ({ activity }) => {
    const { t } = useTranslation();

    const columns: ColumnProps[] = [
        { text: t('warehouse'), align: "left" },
        { text: t('supply'), align: "left" },
        { text: t('measurementUnit'), align: "center" },
        { text: t('location'), align: "center" },
        { text: t('amountToWithdraw'), align: "center" },
        { text: "", align: "right" },
    ];

    const dispatch = useAppDispatch();
    const [initializeLoading, setinitializeLoading] = useState(false);
    const [orderActive, setOrderActive] = useState<WithdrawalOrder | null>(null);
    const { user } = useAppSelector(state => state.auth);
    const { showModal } = useAppSelector((state) => state.ui);
    const { selectedCampaign } = useAppSelector(state => state.campaign);
    const { lotActive } = useAppSelector(state => state.map);
    const [listWithdrawals, setListWithdrawals] = useState<DepositSupplyOrderItem[]>([]);
    const { isLoading,
        depositsSuppliesOrder,
        createLaborOrder,
        confirmLaborOrder,
        getLaborOrder,
        getOrderWithDepositsAndSuppliesByOrder } = useOrder();
    //Ver de donde obtenemos los insumos y depositos:
    const { deposits, getDeposits, getDepositsBySupply } = useDeposit();
    const { supplies, getSupplies } = useSupply();
    const { businesses, getBusinesses } = useBusiness();
    const { campaigns, getCampaigns } = useCampaign();
    const contractorActivity = useMemo(() => {
        return activity.contratista
    }, []);
    const { creationDate, handleInputChange } = useForm({ creationDate: getShortDate() });
    const [instance, updateInstance] = usePDF({ document: <></> });

    const onCloseModal = () => {
        dispatch(uiCloseModal());
        setListWithdrawals([]);
    };

    const handleAddDepositSupply = (item: TransformSupply) => {
        if (!user) return;

        let newDepositSupplyOrders: DepositSupplyOrderItem = {
            accountId: user.accountId,
            deposit: item.deposit,
            supply: item.supply,
            location: item.location,
            nroLot: item.nroLot,
            order: 0, // El numero lo genera en createWithdrawalOrder()
            withdrawalAmount: 0,
            originalAmount: Number(item.amount),
            amount: Number(item.amount)
        };
        setListWithdrawals([newDepositSupplyOrders, ...listWithdrawals]);
    }

    const generateLaborOrder = async () => {
        const findCampaing = campaigns.find(x => x.campaignId === selectedCampaign?.campaignId);
        const findContractor = businesses.find(x => x._id === contractorActivity._id);
        if (!user || !findCampaing || !findContractor) return;

        const newLaborOrder: WithdrawalOrder = {
            type: WithdrawalOrderType.Labor,
            campaign: findCampaing,
            creationDate,
            order: 0,
            contractor: findContractor,
            reason: "",
            state: OrderStatus.Pending,
            accountId: "",
            field: lotActive?.properties?.campo_parent_id || "",
            labor: activity.tipo
        };
        let newDepositSupplyOrders: DepositSupplyOrder[] = listWithdrawals.map(s => ({
            accountId: user.accountId,
            deposit: s.deposit,
            supply: s.supply,
            location: s.location,
            nroLot: s.nroLot,
            order: 0, // El numero lo genera en createWithdrawalOrder()
            withdrawalAmount: 0,
            originalAmount: Number(s.amount),
        }));
        const numberOrder = await createLaborOrder(newLaborOrder, newDepositSupplyOrders);

        if (numberOrder > 0)
            Swal.fire(t('withdrawalOrder'), t('orderCreatedSuccess', { number: numberOrder }), 'success');
        else
            Swal.fire(t('oops'), t('unexpectedError'), 'error');

        onCloseModal();
    }

    const initConfirmLaborOrder = async () => {
        confirmLaborOrder(listWithdrawals, creationDate);
        onCloseModal();
    }

    const deleteRowSupply = (item: DepositSupplyOrderItem) => {
        setListWithdrawals(listWithdrawals.filter(x => x._id !== item._id));
    }

    const editRowSupply = (item: DepositSupplyOrderItem) => {
        setListWithdrawals(listWithdrawals.map(x => x._id === item._id ? item : x));
    }

    const onClickCreateOrder = () => {
        if (orderActive)
            initConfirmLaborOrder()
        else
            generateLaborOrder()
    }

    const onChangeSupply = (item: Supply) => {
        getDepositsBySupply(item);
    };

    useEffect(() => {
        const initializeGetOrder = async () => {
            console.log("start initialize order");
            setinitializeLoading(true);
            const responseAll = await Promise.all([
                getBusinesses(),
                getSupplies(),
                getDeposits(),
                getCampaigns(),
            ]);

            if (responseAll) console.log("initialized success.");

            const field = lotActive?.properties?.campo_parent_id as string;
            const campaignId = selectedCampaign?.campaignId;
            const contractorId = contractorActivity._id;
            if (!campaignId) return;
            const order = await getLaborOrder(field, campaignId, contractorId);
            if (order) {
                setOrderActive(order);
                await getOrderWithDepositsAndSuppliesByOrder(order.order);
            }

            setinitializeLoading(false);
        }

        initializeGetOrder();
    }, [])

    useEffect(() => {
        if (depositsSuppliesOrder.length) {
            setListWithdrawals(depositsSuppliesOrder.map(x => ({ ...x, amount: 0 } as DepositSupplyOrderItem)));
        }
    }, [depositsSuppliesOrder])

    useEffect(() => {
        if (orderActive && listWithdrawals.length) {
            console.log('update file', { orderActive });
            updateInstance(<LaborOrderDoc
                withdrawalOrder={orderActive}
                depositAndSupplies={listWithdrawals} />)
        }
    }, [listWithdrawals, orderActive])


    return (
        <Dialog
            open={showModal === DisplayModals.LaborOrder}
            maxWidth="md"
            fullWidth
            scroll="paper"
            onClose={onCloseModal}
        >
            <DialogTitle variant="h5" sx={{ m: 0, p: 2 }}>
                <Box className="text-center">
                    <AssignmentIcon fontSize='large' />
                </Box>
                <Typography
                    component="h1"
                    variant="h4"
                    align="center"
                    sx={{ mt: 1, mb: 7 }}
                >
                    {t('warehouseWithdrawalOrder')}
                </Typography>
            </DialogTitle>
            <IconButton
                aria-label={t('close')}
                onClick={onCloseModal}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <Loading key="loading-labor" loading={isLoading || initializeLoading} />
                <Paper
                    variant="outlined"
                    sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
                >
                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={12} sm={5}>
                            <Typography variant="subtitle1">
                                <strong> {t('campaign')}:</strong> {selectedCampaign?.campaignId.toString().toUpperCase()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <Typography variant="subtitle1">
                                <strong> {t('crop')}:</strong> {activity?.tipo.toString().toUpperCase()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                                <strong> {t('field')}:</strong> {lotActive?.properties?.campo_parent_id}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                                <strong> {t('lot')}:</strong> {lotActive?.properties?.nombre}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                                <strong> {t('hectares')}:</strong> {lotActive?.properties?.hectareas}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ mt: 3 }}>
                            <TextField
                                variant="outlined"
                                type="date"
                                label={t('date')}
                                name="creationDate"
                                value={creationDate}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                inputProps={{
                                    min: getShortDate(), // Establece la fecha mínima permitida como la fecha actual
                                }}
                                fullWidth
                            />
                        </Grid>
                        {
                            orderActive && (
                                <Grid item xs={12} sm={4} sx={{ mt: 3, display: "flex", alignItems: "center" }}>
                                    <Typography variant="subtitle1">
                                        <strong> {t('withdrawalOrder')}:</strong> {orderActive.order.toString().toUpperCase()}
                                    </Typography>
                                </Grid>
                            )
                        }
                        <Grid item xs={12} sm={4} sx={{ mt: 3, display: "flex", alignItems: "center" }}>
                            <Typography variant="subtitle1">
                                <strong> {t('contractor')}:</strong> {contractorActivity.nombre}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Box sx={{ my: 3 }}>
                        <NewSupplyCropRow
                            key="new-supply-order"
                            supplies={supplies}
                            deposits={deposits}
                            showDueDate={false}
                            onChangeSupply={onChangeSupply}
                            addNewSupplyOrCultive={handleAddDepositSupply} />
                    </Box>
                    <Typography
                        variant="h5"
                        align="left"
                        sx={{ mt: 1, mb: 3 }}
                    >
                        {t('suppliesToWithdraw')}:
                    </Typography>
                    <TableContainer
                        key="table-labor-order"
                        sx={{
                            minHeight: "120px",
                            maxHeight: "440",
                            overflow: "scroll",
                            mb: 5
                        }}
                        component={Paper}
                    >
                        <DataTable
                            key="datatable-orders"
                            columns={columns}
                            isLoading={false}
                        >
                            {listWithdrawals.map((row) => (
                                <RowSupply
                                    key={row._id}
                                    row={row}
                                    handleEdit={editRowSupply}
                                    handleDelete={deleteRowSupply} />
                            ))}
                        </DataTable>
                    </TableContainer>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-around"
                    sx={{ mt: 3 }}
                >
                    <Grid item xs={12} sm={3}>
                        <Button onClick={onCloseModal}>{t('cancel')}</Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => onClickCreateOrder()}
                        >
                            {orderActive ? t('confirm') : t('generate')}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            href={instance.url || "#"}
                            target='_blank'
                            download={`order-${orderActive?.order}.pdf`}
                            color="primary"
                            disabled={!orderActive}
                        >
                            {t('print')}
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    )
}