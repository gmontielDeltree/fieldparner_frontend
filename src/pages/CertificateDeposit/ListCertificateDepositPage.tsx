import { useNavigate } from "react-router-dom";
import React from "react";
import { useTransportDocument } from "../../hooks";

import {
  FireTruck as FireTruckIcon,
} from "@mui/icons-material";
import { GenericListPage } from "../GenericListPage";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ForwardToInbox as ForwardToInboxIcon

} from "@mui/icons-material";
import { urlImg } from "../../config";


const renderPdfIcon = (params: GridRenderCellParams) => (
  <Tooltip title="View PDF">
    <IconButton
      aria-label="View PDF"
      onClick={() => {
        console.log('PDF file:', params.row.fileName);
        const url = `${urlImg}${params.row.fileName}`;
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('target', "_blank");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
    >
      <PictureAsPdfIcon />
    </IconButton>
  </Tooltip>
);

export const ListCertificateDepositPage: React.FC = () => {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();
  // const { t } = useTranslation();
  const { transportDocumentsItem, isLoading, getTransportDocuments } = useTransportDocument();


  const columns = [
    { field: "nroCartaPorte", headerName: "Nro Cert. Porte", flex: 1 },
    { field: "fechaEmision", headerName: "Fecha Emitida", flex: 1 },
    {
      field: "razonSocial",
      headerName: "Planta Destino",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        params.row?.company?.socialReason || "-"
      ),
    },
    {
      field: "campaign",
      headerName: "Campaña",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        params.row?.exitField?.cultive || "-"
      ),
    },
    { field: "cultivo", headerName: "Cultivo", flex: 1 }, //salidaCampoId
    { field: "KG Confirmados", headerName: "Status", flex: 1 },
    {
      field: "fileName",
      headerName: "PDF",
      flex: 1,
      renderCell: renderPdfIcon
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
                // if (params.row._id) getTransporDocumentById(params.row._id);
                navigate(`/init/overview/transport-documents/edit/${params.row._id}`);
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
      title="Certificado Deposito Granos (Argentina)"
      isLoading={false}
      icon={<ForwardToInboxIcon fontSize="large" sx={{ mr: 1 }} />}
      data={transportDocumentsItem}
      columns={columns}
      getData={getTransportDocuments}
      deleteData={() => console.log("delete")}
      setActiveItem={(item) => console.log("setActiveItem", item)}
      newItemPath="/init/overview/certificate-deposits/new"
      editItemPath={(id) => `/init/overview/deposit/${id}`}
    />
  );
};
