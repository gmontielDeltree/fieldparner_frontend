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
import { GenericListPage } from "../GenericListPage";



export const ListTransportDocument: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const columns = [
        { field: "nroCartaPorte", headerName: "Nro Carta Porte", flex: 1 },
        { field: "fechaEmitida", headerName: "Fecha Emitida", flex: 1 },
        { field: "razonSocial", headerName: "Razon Social", flex: 1 },
        { field: "cultive", headerName: "Cultivo", flex: 1 },
        { field: "kgEstimado", headerName: "Kg Estimados", flex: 1 },
        { field: "status", headerName: "Status", flex: 1 },
        { field: "archivo", headerName: "PDF", flex: 1 },
        { field: "actions", headerName: "", flex: 1 },
    ];

    useEffect(() => {
        // getDeposits();
    }, []);

    return (
        <GenericListPage
            title="Carta de Porte (Argentina)"
            icon={<FireTruckIcon fontSize="large" sx={{ mr: 1 }} />}
            data={[]}
            columns={columns}
            getData={() => []} //TODO: getTransportDocuments
            deleteData={() => console.log("delete")}
            setActiveItem={setDepositActive}
            newItemPath="/init/overview/transport-documents/new"
            editItemPath={(id) => `/init/overview/deposit/${id}`}

        />
    );
};
