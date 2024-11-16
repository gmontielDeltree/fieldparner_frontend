import React from 'react'
import { useNavigate } from 'react-router-dom';
import { GenericListPage } from '../GenericListPage';
import { Handshake as HandshakeIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContractSaleCereals } from '../../hooks';

const titleColums = {
    nroContractSale: "Nro Contrato Venta",
    dateCreated: "Fecha",
    society: "Sociedad",
    campaign: "Campaña",
    cultive: "Cultivo",
    kg: "Kilos",
    currency: "Moneda",
    amountValue: "Valor",
    kgDelivered: "Kg Entregados",
    valueCollected: "Valor Cobrado",
    status: "Estado",
}

export const ListSalesCerealsPage: React.FC = () => {
    const navigate = useNavigate();
    // const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { getContractsSaleCereals } = useContractSaleCereals();


    const columns = [
        {
            field: "nroContractSale",
            headerName: titleColums["nroContractSale"],
            flex: 1
        },
        {
            field: "dateCreated",
            headerName: titleColums.dateCreated,
            flex: 1
        },
        {
            field: "society",
            headerName: titleColums.society,
            flex: 1,
        },
        {
            field: "campaign",
            headerName: titleColums.campaign,
            flex: 1,
        },
        {
            field: "cultive",
            headerName: titleColums.cultive,
            flex: 1,
            // renderCell: (params: GridRenderCellParams) => (
            //     params.row?.exitField?.cultive || "-"
            // ),
        },
        {
            field: "kg",
            headerName: titleColums.kg,
            flex: 1
        },
        {
            field: "Moneda",
            headerName: titleColums.currency,
            flex: 1
        },
        {
            field: "amountValue",
            headerName: titleColums.amountValue,
            flex: 1
        },
        {
            field: "kgDelivered",
            headerName: titleColums.kgDelivered,
            flex: 1
        },
        {
            field: "valueCollected",
            headerName: titleColums.valueCollected,
            flex: 1
        },
        {
            field: "status",
            headerName: titleColums.status,
            flex: 1
        },
        {
            field: "actions",
            headerName: "",
            flex: 1,
            sorteable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" justifyContent="center">
                    <Tooltip title="Edit">
                        <IconButton
                            aria-label="Edit"
                            onClick={() => {
                                console.log("edit", params.row._id);

                            }}
                            sx={{
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.2)" },
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            aria-label="Delete"
                            disabled
                            onClick={() => console.log(params.row._id, params.row._rev)}
                            sx={{
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.2)" },
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <GenericListPage
            title={t("title_sale_cereal")}
            isLoading={false}
            icon={<HandshakeIcon fontSize="large" sx={{ mr: 1 }} />}
            data={[]}
            columns={columns}
            getData={() => getContractsSaleCereals()}
            deleteData={() => console.log("delete")}
            setActiveItem={(item) => console.log("setActiveItem", item)}
            newItemPath="/init/overview/sales-cereals/new"
            editItemPath={(id) => `/init/overview/sales-cereals/edit/${id}`}

        />
    );
}
