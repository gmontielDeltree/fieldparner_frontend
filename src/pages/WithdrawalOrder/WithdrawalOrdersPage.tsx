import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    useAppSelector,
    useBusiness,
    useCampaign,
    useForm,
    useOrder,
    useStockMovement,
} from '../../hooks';
import { Loading, TemplateLayout } from '../../components';
import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { OrderStatus, DepositSupplyOrder, TransformSupply, WithdrawalOrderType, WithdrawalOrder, Campaign } from '../../types';
import { getShortDate } from '../../helpers/dates';
import { Stock, TipoStock } from '../../interfaces/stock';
import { TableNewWithdrawalOrder } from '../../components/WithdrawalOrder/TableNewWithdrawalOrder';
import { AutocompleteCampaign } from '../../components/Autocomplete';

//TODO: agregar traduccion
const initialForm = {
    accountId: "",
    creationDate: getShortDate(),
    reason: "",
    campaignId: "",
    withdrawId: "",
    order: 0,
    state: OrderStatus.Pending,
    type: WithdrawalOrderType.Individual,
};

export const WithdrawalOrdersPage: React.FC = () => {

    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const { isLoading, createWithdrawalOrder } = useOrder();
    const [suppliesToAdd, setSuppliesToAdd] = useState<TransformSupply[]>([]);
    const [campaignSelected, setCampaignSelected] = useState<Campaign | null>(null);
    const { campaigns, getCampaigns } = useCampaign();
    const { businesses: socialEntities, getBusinesses } = useBusiness();
    const { getStock } = useStockMovement();
    const {
        formulario: formValues,
        handleInputChange,
        handleSelectChange,
        setFormulario: setFormValues,
    } = useForm(initialForm);

    const onClickCancel = () => navigate("/init/overview/list-orders");

    const addNewWithdrawalOrder = async (newOrder: WithdrawalOrder, suppliesOrder: DepositSupplyOrder[]) => {
        if (await createWithdrawalOrder(newOrder, suppliesOrder))
            navigate("/init/overview/list-orders");
    }

    const onClickGenerate = () => {
        const campaign = campaigns.find(c => c._id === formValues.campaignId);
        const withdraw = socialEntities.find(s => s._id === formValues.withdrawId);

        if (!user || !campaign || !withdraw) {
            Swal.fire('Error', 'Debe seleccionar campaña y quien retira.', 'error');
            return;
        }

        let newDepositSupplyOrders: DepositSupplyOrder[] = suppliesToAdd.map(s => ({
            accountId: user?.accountId,
            deposit: s.deposit,
            supply: s.supply,
            crop: s.crop,
            location: s.location,
            nroLot: s.nroLot,
            order: 0, // Se genera en createWithdrawalOrder()
            withdrawalAmount: 0,
            originalAmount: Number(s.amount),
        }));

        addNewWithdrawalOrder({
            type: WithdrawalOrderType.Individual,
            campaign,
            creationDate: formValues.creationDate,
            withdraw,
            order: formValues.order,
            reason: formValues.reason,
            state: OrderStatus.Pending,
            accountId: "",
            field: ""
        }, newDepositSupplyOrders);
    }

    const validateStock = async (newSupply: TransformSupply) => {
        try {
            const { supply, deposit } = newSupply;
            const id = supply?._id;
            const depositId = deposit?._id;
            if (!id && !depositId) return false;
            let result = await getStock(
                {
                    campaignId: formValues.campaignId,
                    tipo: TipoStock.INSUMO,
                    id,
                    depositId,
                    location: newSupply.location,
                    nroLot: newSupply.nroLot
                }
            );
            if (result && result[0]?.currentStock > 0) {
                let supplyStock: Stock = result[0];
                const newCurrentStock = (Number(supplyStock.currentStock) - Number(newSupply.amount));
                if (newCurrentStock <= 0) {
                    Swal.fire('Stock insuficiente.', 'La cantidad supera al stock actual.', 'error');
                    return false;
                }
                return true;
            }
            else {
                Swal.fire('Stock insuficiente.', 'No tiene stock del insumo.', 'error');
                return false;
            }
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    const addNewSupply = async (item: TransformSupply) => {
        const depositId = item.deposit?._id;
        const supplyId = item.supply?._id;

        if (!supplyId && !depositId && !item.location) return;

        const existSupply = suppliesToAdd.find(s =>
            s.deposit?._id === depositId &&
            s.supply?._id === supplyId &&
            s.location === item.location
        );

        if (existSupply) {
            Swal.fire('Insumo.', 'Deposito / Insumo existente.', 'error');
            return;
        }

        if (await validateStock(item)) setSuppliesToAdd([item, ...suppliesToAdd]);
    }

    const deleteSupply = (supply: TransformSupply) => {
        const newSupplies = suppliesToAdd.filter(s => s.id !== supply.id);
        setSuppliesToAdd(newSupplies);
    }

    useEffect(() => {
        getCampaigns();
        getBusinesses();
    }, [])

    return (
        <TemplateLayout key="new-withdrawal-order" viewMap={true}>
            <Loading loading={isLoading} />
            <Paper
                variant="outlined"
                sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}

            >
                <Box className="text-center">
                    <AssignmentIcon fontSize='large' />
                </Box>
                <Typography
                    component="h1"
                    variant="h4"
                    align="center"
                    sx={{ mt: 1, mb: 7 }}
                >
                    Nueva Orden de Retiro
                </Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            variant="outlined"
                            type="date"
                            label="Fecha"
                            name="creationDate"
                            value={formValues.creationDate}
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
                    <Grid item xs={12} sm={8}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label="Motivo"
                            name="reason"
                            value={formValues.reason}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AutocompleteCampaign
                            value={campaignSelected}
                            onChange={(campaign) => {
                                if (campaign) {
                                    setCampaignSelected(campaign);
                                    setFormValues((prevState) => ({
                                        ...prevState,
                                        campaignId: campaign?._id || "",
                                    }));
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl key="trucker-select" fullWidth>
                            <InputLabel id="withdraw">Retira</InputLabel>
                            <Select
                                labelId="trucker"
                                name="withdrawId"
                                value={formValues.withdrawId}
                                label="Retira"
                                onChange={handleSelectChange}
                            >
                                {socialEntities?.map((f) => (
                                    <MenuItem key={f._id} value={f._id}>
                                        {f.nombreCompleto || f.razonSocial}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <TableNewWithdrawalOrder
                    suppliesToAdd={suppliesToAdd}
                    onClickDelete={deleteSupply}
                    onClickAdd={addNewSupply}
                />
                <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-around"
                    sx={{ mt: 3 }}
                >
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant='contained'
                            color="inherit"
                            onClick={onClickCancel}>
                            Cancelar
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            disabled={suppliesToAdd.length === 0 || !formValues.campaignId || !formValues.withdrawId}
                            color="success"
                            onClick={() => onClickGenerate()}
                        >
                            Generar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </TemplateLayout>
    )
}