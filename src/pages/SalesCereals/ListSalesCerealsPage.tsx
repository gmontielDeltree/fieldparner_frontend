import React from 'react'
import { useNavigate } from 'react-router-dom';
import { GenericListPage } from '../GenericListPage';
import { Handshake as HandshakeIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
//TODO: calcular los kg entregados y el valor cobrado
//TODO: permitir editar solo si ninguna carta de porte tiene el nro de contrato
export const ListSalesCerealsPage: React.FC = () => {
    const navigate = useNavigate();
    // const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { getContractsSaleCereals, contractsSaleCerealsFull } = useContractSaleCereals();
    const [zafraFilter, setZafraFilter] = React.useState<string>("");


    const columns = [
        {
            field: "contractSaleNumber",
            headerName: "Nro Contrato Venta",
            flex: 1
        },
        {
            field: "dateCreated",
            headerName: "Fecha",
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                if (!params.value) return "-";
                const date = new Date(params.value);
                return date.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).replace(/\//g, '/');
            },
        },
        {
            field: "companyId",
            headerName: "Sociedad",
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                params.row?.company?.socialReason || "-"
            ),
        },
        {
            field: "campaignId",
            headerName: "Campaña",
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                params.row?.campaign?.campaignId || "-"
            ),
        },
        {
            field: "zafra",
            headerName: "Zafra",
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                const z = (params.row?.campaign && (params.row.campaign as any).zafra) || null;
                if (!z) return "-";
                return Array.isArray(z) ? z.join(", ") : String(z);
            }
        },
        {
            field: "cropId",
            headerName: "Cultivo",
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                params.row?.crop?.descriptionES || "-"
            ),
        },
        {
            field: "kg",
            headerName: titleColums.kg,
            flex: 1
        },
        {
            field: "currency",
            headerName: "Moneda",
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
            data={zafraFilter ? contractsSaleCerealsFull.filter(c => {
                const z = (c.campaign as any)?.zafra;
                return Array.isArray(z) ? z.includes(zafraFilter) : z === zafraFilter;
            }) : contractsSaleCerealsFull}
            columns={columns}
            getData={getContractsSaleCereals}
            deleteData={() => console.log("delete")}
            setActiveItem={(item) => console.log("setActiveItem", item)}
            newItemPath="/init/overview/sales-cereals/new"
            editItemPath={(id) => `/init/overview/sales-cereals/edit/${id}`}
            headerContent={
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Zafra</InputLabel>
                    <Select label="Zafra" value={zafraFilter} onChange={(e) => setZafraFilter(e.target.value)}>
                        <MenuItem value="">{t('all')}</MenuItem>
                        {Array.from(new Set(contractsSaleCerealsFull
                            .map(c => (c.campaign as any)?.zafra)
                            .flatMap((z: any) => Array.isArray(z) ? z : (z ? [z] : []))
                        )).map((z: any) => (
                            <MenuItem key={z} value={z}>{z}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            }

        />
    );
}
