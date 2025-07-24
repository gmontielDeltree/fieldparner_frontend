import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayArrowIcon,
  FileDownload as FileDownloadIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "../GenericListPage";
import { useAnnualPlanValorization } from "../../hooks/useAnnualPlanValorization";
import { IAnnualPlanValorization } from "../../interfaces/annualPlanValorization";
import { GridColDef } from "@mui/x-data-grid";

export const ListAnnualPlanValorization: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    annualPlanValorizations,
    isLoading,
    getAnnualPlanValorizations,
    deleteAnnualPlanValorization,
  } = useAnnualPlanValorization();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");

  useEffect(() => {
    getAnnualPlanValorizations();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      abierto: { label: t("open"), color: "success" as const },
      cerrado: { label: t("closed"), color: "default" as const },
      en_proceso: { label: t("in_process"), color: "warning" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.abierto;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: "medium" }}
      />
    );
  };

  const columns: GridColDef[] = [
    { field: "campanaName", headerName: t("campaign"), flex: 1 },
    { field: "zafra", headerName: t("harvest"), flex: 0.8 },
    { field: "campoName", headerName: t("field"), flex: 1 },
    { field: "loteName", headerName: t("lot"), flex: 1 },
    { 
      field: "has", 
      headerName: t("hectares"), 
      flex: 0.6,
      type: "number",
      valueFormatter: ({ value }) => value?.toFixed(1) || "0"
    },
    { field: "cultivoName", headerName: t("crop"), flex: 1 },
    { 
      field: "cosechaEstimada", 
      headerName: t("estimated_harvest_tn"), 
      flex: 1.2,
      type: "number",
      valueFormatter: ({ value }) => 
        value ? `${value.toLocaleString('es-AR')} ${t("tons")}` : "0"
    },
    { 
      field: "tendenciaMonLocal", 
      headerName: t("trend_local_currency"), 
      flex: 1.2,
      type: "number",
      valueFormatter: ({ value }) => value ? formatCurrency(value) : formatCurrency(0)
    },
    {
      field: "status",
      headerName: t("status"),
      flex: 0.8,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: { row: IAnnualPlanValorization }) => (
        <Box display="flex" justifyContent="center" gap={1}>
          {params.row.status === 'abierto' && (
            <Tooltip title={t("start_valorization")}>
              <IconButton
                aria-label={t("start_valorization")}
                onClick={() => onClickStartValorization(params.row)}
                color="primary"
                sx={{
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.2)" },
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => onClickEditValorization(params.row)}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("export_to_excel")}>
            <IconButton
              aria-label={t("export_to_excel")}
              onClick={() => onClickExportValorization(params.row)}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
              }}
              color="success"
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("icon_delete")}>
            <IconButton
              aria-label={t("icon_delete")}
              onClick={() => handleDeleteValorization(params.row)}
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

  const onClickStartValorization = (item: IAnnualPlanValorization): void => {
    // TODO: Implementar navegación a pantalla de carga de valorización
    console.log("Starting valorization for:", item);
    navigate(`/init/overview/annual-plan-valorization/edit/${item._id}`);
  };

  const onClickEditValorization = (item: IAnnualPlanValorization): void => {
    navigate(`/init/overview/annual-plan-valorization/edit/${item._id}`);
  };

  const onClickExportValorization = (item: IAnnualPlanValorization): void => {
    // Por ahora solo mostramos un mensaje, la exportación completa se hace desde la página de edición
    alert(t("export_functionality_available_in_edit_page"));
  };

  const handleDeleteValorization = (item: IAnnualPlanValorization) => {
    const doc = item as any;
    if (doc._id && doc._rev) {
      deleteAnnualPlanValorization(doc._id, doc._rev);
    }
  };

  const setActiveItem = () => {
    // This is required by GenericListPage but we don't use Redux for this feature
  };

  // Filtrar datos
  const filteredData = annualPlanValorizations.filter((item) => {
    // Filtro por término de búsqueda
    const matchesSearch = searchTerm === "" || 
      item.campanaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cultivoName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    // Filtro por campaña
    const matchesCampaign = campaignFilter === "all" || item.campanaName === campaignFilter;

    return matchesSearch && matchesStatus && matchesCampaign;
  });

  // Obtener lista única de campañas para el filtro
  const uniqueCampaigns = Array.from(
    new Set(annualPlanValorizations.map(item => item.campanaName).filter(Boolean))
  );

  return (
    <Box>
      {/* Filtros */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("status")}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={t("status")}
              >
                <MenuItem value="all">{t("all")}</MenuItem>
                <MenuItem value="abierto">{t("open")}</MenuItem>
                <MenuItem value="cerrado">{t("closed")}</MenuItem>
                <MenuItem value="en_proceso">{t("in_process")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("campaign")}</InputLabel>
              <Select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                label={t("campaign")}
              >
                <MenuItem value="all">{t("all")}</MenuItem>
                {uniqueCampaigns.map((campaign) => (
                  <MenuItem key={campaign} value={campaign}>
                    {campaign}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate("/init/overview/annual-plan-valorization/analysis")}
            >
              {t("view_analysis")}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <GenericListPage
        title={t("annual_plan_valorization")}
        icon={
          <Box display="flex" alignItems="center">
            <AssessmentIcon />
          </Box>
        }
        data={filteredData}

        columns={columns}
        getData={getAnnualPlanValorizations}
        deleteData={deleteAnnualPlanValorization}
        setActiveItem={setActiveItem}
        newItemPath="/init/overview/annual-plan-valorization/new"
        editItemPath={(id) => `/init/overview/annual-plan-valorization/edit/${id}`}
        isLoading={isLoading}
      />
    </Box>
  );
}; 