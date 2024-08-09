import { useNavigate } from "react-router-dom";
import { ColumnProps, Deposit } from "../../types";
import React, { useEffect } from "react";
import { useAppDispatch, useDeposit, useForm } from "../../hooks";
import {
    DataTable,
    ItemRow,
    Loading,
    SearchButton,
    SearchInput,
    TableCellStyled,
    TemplateLayout,
    TopbarCustom,
} from "../../components";
import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    IconButton,
    Paper,
    Tooltip,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
import { Icon } from "semantic-ui-react";
import {
    Add as AddIcon,
    Edit as EditIcon,
    FireTruck as FireTruckIcon,

} from "@mui/icons-material";
import { setDepositActive } from "../../redux/deposit";
import { useTranslation } from "react-i18next";



export const ListTransportDocument: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { isLoading, deposits, getDeposits, setDeposits, deleteDeposit } = useDeposit();
    const { filterText, handleInputChange } = useForm({ filterText: "" });

    const columns: ColumnProps[] = [
        { text: "Nro Carta Porte", align: "left" },
        { text: "Fecha Emitida", align: "center" },
        { text: "Razon Social", align: "left" },
        { text: "Cultivo", align: "center" },
        { text: "Kg Estimados", align: "center" },
        { text: "Status", align: "center" },
        { text: "PDF", align: "center" },
        { text: "", align: "center" },
    ];

    const onClickSearch = () => {
        if (filterText === "") {
            getDeposits();
            return;
        }
        const filteredDeposits = deposits.filter(({ description: descripcion, owner: propietario }) => {
            (descripcion &&
                descripcion.toLowerCase().includes(filterText.toLowerCase())) ||
                (propietario &&
                    propietario.toLowerCase().includes(filterText.toLowerCase()));
        });
        setDeposits(filteredDeposits);
    };

    const onClickUpdateDeposit = (item: Deposit) => {
        dispatch(setDepositActive(item));
        navigate(`/init/overview/deposit/${item._id}`);
    };

    const handleDeleteDeposit = (item: Deposit) => {
        if (item._id && item._rev) {
            deleteDeposit(item._id, item._rev);
            getDeposits();
        }
    };

    useEffect(() => {
        getDeposits();
    }, []);

    return (
        <Box sx={{ width: "100%", height: "100%" }}>
            <Paper key="overview-deposits" elevation={1} sx={{ m: 2, minHeight: "80%" }}>
                {isLoading && <Loading loading />}
                <Container maxWidth="lg" sx={{ ml: 0 }}>
                    <TopbarCustom
                        mainTitle="Carta de Porte (Argentina)"
                        iconTitle={<FireTruckIcon fontSize="large" sx={{ mr: 1 }} />}
                        closeButton
                    />
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
                                    onClick={() => navigate("/init/overview/transport-documents/new")}
                                >
                                    {t("add_new")}
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={10}>
                                <Grid container justifyContent="flex-end">
                                    <Grid item xs={8} sm={7}>
                                        <SearchInput
                                            value={filterText}
                                            placeholder={t("description_owner")}
                                            handleInputChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={4} sm={3}>
                                        <SearchButton text={t("icon_search")} onClick={() => onClickSearch()} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Box component="div" sx={{ p: 1 }}>
                            <DataTable
                                key="table-transport-documents"
                                columns={columns}
                                isLoading={isLoading}
                            >
                                {deposits.map((row) => (
                                    <ItemRow key={row._id} hover>
                                        <TableCellStyled align="center">
                                            {row.description}
                                        </TableCellStyled>
                                        <TableCellStyled align="center">
                                            {row.owner}
                                        </TableCellStyled>
                                        <TableCellStyled align="center">
                                            <Chip
                                                variant={row.isVirtual ? "filled" : "outlined"}
                                                label={row.isVirtual ? t("_virtual") : t("physical_masculine")}
                                            />
                                        </TableCellStyled>
                                        <TableCellStyled align="center">
                                            {row.address}
                                        </TableCellStyled>
                                        <TableCellStyled align="center">
                                            {row.locality}
                                        </TableCellStyled>
                                        <TableCellStyled align="center">{row.country}</TableCellStyled>
                                        <TableCellStyled align="center">{row.country}</TableCellStyled>
                                        <TableCellStyled align="center">
                                            <Tooltip title={t("icon_edit")}>
                                                <IconButton
                                                    aria-label={t("icon_edit")}
                                                    onClick={() => onClickUpdateDeposit(row)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t("icon_delete")}>
                                                <IconButton
                                                    onClick={() => handleDeleteDeposit(row)}
                                                    style={{ fontSize: '1rem' }}
                                                >
                                                    <Icon name="trash alternate" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCellStyled>
                                    </ItemRow>
                                ))}
                            </DataTable>
                        </Box>
                    </Box>
                </Container>
            </Paper>
        </Box>
    );
};
