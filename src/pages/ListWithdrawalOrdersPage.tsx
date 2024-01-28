import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useForm, useOrder } from '../hooks';
import { CloseButtonPage, DataTable, ItemRow, Loading, TableCellStyled, TemplateLayout } from '../components';
import { Box, Button, Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    PendingActions as PendingActionsIcon,
    CheckCircle as CheckCircleIcon,
    MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { ColumnProps, OrderStatus, WithdrawalOrder } from '../types';
import { Icon } from 'semantic-ui-react';

const columns: ColumnProps[] = [
    { text: "Tipo", align: "left" },
    { text: "Fecha", align: "center" },
    { text: "Orden", align: "center" },
    { text: "Motivo", align: "left" },
    { text: "Retira", align: "center" },
    { text: "Campaña", align: "center" },
    { text: "Status", align: "center" },
    { text: "", align: "center" }
];

export const ListWithdrawalOrdersPage: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { filterText, handleInputChange } = useForm({ filterText: "" });
    const { isLoading, orders: listWithdrawal, getWithdrawalOrders } = useOrder();

    const onClickBuscar = (): void => {
        console.log('search');
    };

    const onClickEdit = (row: WithdrawalOrder) => {
        // dispatch();
    }

    useEffect(() => {
        getWithdrawalOrders();
    }, [])

    return (
        <TemplateLayout key="list-orders" viewMap={true}>
            {isLoading && <Loading loading={true} />}
            <Box
                component="div"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
            >
                <Box display="flex" alignItems="center">
                    <AssignmentIcon sx={{ marginRight: '8px' }} />
                    <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
                        Ordenes de Retiro
                    </Typography>
                </Box>
                <CloseButtonPage />
            </Box>
            <Box component="div" sx={{ mt: 7 }}>
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
                            onClick={() => navigate('/init/overview/order')}
                        >
                            Nuevo
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                        <Grid container justifyContent="flex-end">
                            <Grid item xs={8} sm={7}>
                                <TextField
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    placeholder="Ordenes de retiro"
                                    autoComplete="off"
                                    name="filterText"
                                    value={filterText}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" />,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4} sm={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="medium"
                                    fullWidth
                                    sx={{
                                        height: "98%",
                                        margin: "auto",
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0,
                                    }}
                                    onClick={() => onClickBuscar()}
                                    startIcon={<SearchIcon />}
                                >
                                    Buscar
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Box component="div" sx={{ p: 1 }}>
                    <DataTable
                        key="datatable-orders"
                        columns={columns}
                        isLoading={isLoading}
                    >
                        {listWithdrawal.map((row) => (
                            <ItemRow key={row._id}>
                                <TableCellStyled align="center">
                                    {row.type}
                                </TableCellStyled>
                                <TableCellStyled align="center">{row.creationDate} </TableCellStyled>
                                <TableCellStyled align="center">{row.order}</TableCellStyled>
                                <TableCellStyled>{row.reason}</TableCellStyled>
                                <TableCellStyled align="center">{row.withdrawId}</TableCellStyled>
                                <TableCellStyled align="center">{row.campaignId}</TableCellStyled>
                                <TableCellStyled align="center">
                                    <IconButton
                                        aria-label="acation"
                                        onClick={() => console.log}
                                    >
                                        {
                                            (row.state === OrderStatus.Completed) ?
                                                <CheckCircleIcon color='success' fontSize='medium' />
                                                : (row.state === OrderStatus.Parcial) ?
                                                    <PendingActionsIcon color='warning' fontSize='medium' />
                                                    : <MoreHorizIcon color="action" fontSize='medium' />
                                        }
                                    </IconButton>
                                </TableCellStyled>
                                <TableCellStyled align="center">
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            // onClick={() =>  handleDeleteVehicle (row)}
                                            sx={{ fontSize: '1.5rem' }}
                                        >
                                            <Icon name="trash alternate" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar">
                                        <IconButton
                                            aria-label="Editar"
                                            onClick={() => onClickEdit(row)}
                                        >
                                            <EditIcon fontSize='medium' />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download">
                                        <IconButton
                                            // onClick={() =>  handleDeleteVehicle (row)}
                                            sx={{ fontSize: '1.5rem' }}
                                        >
                                            <Icon name="file pdf outline" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCellStyled>
                            </ItemRow>
                        ))}
                    </DataTable>
                </Box>
            </Box>
        </TemplateLayout>
    )
}
