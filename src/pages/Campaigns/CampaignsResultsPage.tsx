import React, { useState, useEffect } from "react";
import { QueryStats as QueryStatsIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "../GenericListPage";
import { useAppSelector, useCampaign } from "../../hooks";
import { format } from "date-fns";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  InputAdornment,
  Grid,
  Alert
} from "@mui/material";
import { useContractSaleCereals } from "../../hooks/useContractSaleCereals";
import { useCampaingExpenses } from "../../hooks/useCampaignExpenses";
import { ListCampingExpeses } from "../../interfaces/campaignExpenses";

interface TableRow {
  id: string;
  campaña: string;
  sociedad: string;
  contrato: string;
  campo: string;
  lote: string;
  cultivo: string;
  fecha: string;
  tipo: string;
  labor: string;
  detalle: string;
  referencia: string;
  moneda: string;
  importe: number;
  importeAlternativo: number;
}

interface CampaignTotals {
  contracts: number;
  expenses: number;
  result: number;
  alternativeContracts: number;
  alternativeExpenses: number;
  alternativeResult: number;
}

const calculateTotals = (data: TableRow[], isMultiply: boolean, rate: number): CampaignTotals => {
  const contracts = data.filter(item => item.tipo === 'Contrato')
    .reduce((sum, item) => sum + item.importe, 0);

  const expenses = data.filter(item => item.tipo !== 'Contrato')
    .reduce((sum, item) => sum + Math.abs(item.importe), 0);

  const factor = isMultiply ? rate : 1 / rate;

  return {
    contracts,
    expenses,
    result: contracts - expenses,
    alternativeContracts: contracts * factor,
    alternativeExpenses: expenses * factor,
    alternativeResult: (contracts - expenses) * factor
  };
};

const TotalsSummary: React.FC<{ totals: CampaignTotals }> = ({ totals }) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        mt: 3,
        p: 3,
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
        {t("campaign_summary")}
      </Typography>

      <Grid container spacing={2}>
        {[
          { label: t("contracts"), values: [totals.contracts, totals.alternativeContracts] },
          { label: t("expenses"), values: [totals.expenses, totals.alternativeExpenses], isNegative: true },
          { label: t("campaign_result"), values: [totals.result, totals.alternativeResult] }
        ].map((row, index) => (
          <Grid item xs={12} key={index}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                backgroundColor: index === 2 ? '#ffffff' : 'transparent',
                borderRadius: '4px',
                ...(index === 2 && {
                  borderTop: '1px solid rgba(0,0,0,0.12)',
                  mt: 1
                })
              }}
            >
              <Typography
                sx={{
                  flex: '1 1 33%',
                  fontWeight: index === 2 ? 'bold' : 'normal',
                  color: '#424242'
                }}
              >
                {row.label}
              </Typography>
              {row.values.map((value, i) => (
                <Typography
                  key={i}
                  sx={{
                    flex: '1 1 33%',
                    textAlign: 'right',
                    fontWeight: index === 2 ? 'bold' : 'normal',
                    color: row.isNegative ? '#d32f2f' : '#424242'
                  }}
                >
                  {value.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: i === 0 ? 'USD' : 'ARS',
                    minimumFractionDigits: 2
                  })}
                </Typography>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const CampaignsResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const { campaigns = [], getCampaigns } = useCampaign();
  const { contractsSaleCerealsFull = [], getContractsSaleCereals } = useContractSaleCereals();
  const { campaingExpenses = [], getCampaingExpenses } = useCampaingExpenses();

  const [campaign, setCampaign] = useState<string>("");
  const [altCurrency, setAltCurrency] = useState<string>("35");
  const [isMultiply, setIsMultiply] = useState<boolean>(true);
  const [reportData, setReportData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sociedad: "",
    contrato: "",
    campo: "",
    lote: "",
    cultivo: ""
  });

  const columns = [
    { field: "campaña", headerName: t("_campaign"), flex: 0.8, filterable: false },
    { field: "sociedad", headerName: t("_society"), flex: 1, filterable: true },
    { field: "contrato", headerName: t("_contract"), flex: 0.8, filterable: true },
    { field: "campo", headerName: t("_field"), flex: 1, filterable: true },
    { field: "lote", headerName: t("_lot"), flex: 0.7, filterable: true },
    { field: "cultivo", headerName: t("_crop"), flex: 0.8, filterable: true },
    { field: "fecha", headerName: t("_date"), flex: 0.8, filterable: false },
    { field: "tipo", headerName: t("_type"), flex: 0.8, filterable: false },
    { field: "labor", headerName: t("_labor"), flex: 1, filterable: false },
    { field: "detalle", headerName: t("_detail"), flex: 1.2, filterable: false },
    { field: "referencia", headerName: t("_reference"), flex: 0.8, filterable: false },
    { field: "moneda", headerName: t("_currency"), flex: 0.7, filterable: false },
    {
      field: "importe",
      headerName: t("_amount"),
      flex: 0.8,
      type: 'number',
      filterable: false,
      renderCell: (params) => `${params.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    },
    {
      field: "importeAlternativo",
      headerName: t("alternative_amount"),
      flex: 0.8,
      type: 'number',
      filterable: false,
      renderCell: (params) => `${params.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        await Promise.all([
          getCampaigns(),
          getContractsSaleCereals(),
          getCampaingExpenses()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(t("error_loading_data"));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (campaigns && campaigns.length > 0 && !campaign) {
      setCampaign(campaigns[0]._id);
    }
  }, [campaigns, campaign]);

  useEffect(() => {
    if (!campaign) return;

    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        const selectedCampaign = campaigns.find(c => c._id === campaign);
        if (!selectedCampaign) {
          setReportData([]);
          return;
        }

        const rate = parseFloat(altCurrency) || 1;
        const factor = isMultiply ? rate : 1 / rate;

        // Procesar contratos
        let contractsData = [];
        if (contractsSaleCerealsFull && contractsSaleCerealsFull.length > 0) {
          contractsData = contractsSaleCerealsFull
            .filter(contract =>
              contract && (contract.campaignId === campaign ||
                (contract.campaign && contract.campaign._id === campaign))
            )
            .map(contract => ({
              id: contract._id,
              campaña: selectedCampaign.name || "",
              sociedad: contract.company?.name || "",
              contrato: contract.contractSaleNumber || "",
              campo: contract.destination?.name || "",
              lote: "",
              cultivo: contract.crop?.name || "",
              fecha: contract.dateCreated ? format(new Date(contract.dateCreated), 'dd/MM/yyyy') : "",
              tipo: t("_contract_type"),
              labor: "",
              detalle: contract.condition || "",
              referencia: contract.contractSaleNumber || "",
              moneda: contract.currency || "USD",
              importe: parseFloat(contract.amountValue || "0"),
              importeAlternativo: parseFloat(contract.amountValue || "0") * factor
            }));
        }

        let expensesData = [];
        if (campaingExpenses && campaingExpenses.length > 0) {
          expensesData = campaingExpenses
            .filter(expense => expense && expense.campaign === campaign)
            .flatMap(expense => {
              if (!expense.listCamapingExpeses || expense.listCamapingExpeses.length === 0) {
                return [];
              }

              return expense.listCamapingExpeses.map((item: ListCampingExpeses) => ({
                id: expense._id + "-" + item.id,
                campaña: selectedCampaign.name || "",
                sociedad: "",
                contrato: "",
                campo: expense.field || "",
                lote: expense.lot || "",
                cultivo: "",
                fecha: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : "",
                tipo: t("_expense_type"),
                labor: item.labor || "",
                detalle: item.detail || "",
                referencia: item.reference || "",
                moneda: "USD",
                importe: -parseFloat(item.amount || "0"),
                importeAlternativo: -parseFloat(item.amount || "0") * factor
              }));
            });
        }
        setReportData([...contractsData, ...expensesData]);
      } catch (error) {
        console.error("Error fetching report data:", error);
        setError(t("error_report_data"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [campaign, campaigns, contractsSaleCerealsFull, campaingExpenses]);

  useEffect(() => {
    if (reportData.length === 0) return;

    const rate = parseFloat(altCurrency) || 1;
    const factor = isMultiply ? rate : 1 / rate;

    const updatedData = reportData.map(row => ({
      ...row,
      importeAlternativo: row.importe * factor
    }));

    setReportData(updatedData);
  }, [altCurrency, isMultiply]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const filteredData = reportData.filter(row => {
    return (
      (filters.sociedad === "" || (row.sociedad && row.sociedad.toLowerCase().includes(filters.sociedad.toLowerCase()))) &&
      (filters.contrato === "" || (row.contrato && row.contrato.toLowerCase().includes(filters.contrato.toLowerCase()))) &&
      (filters.campo === "" || (row.campo && row.campo.toLowerCase().includes(filters.campo.toLowerCase()))) &&
      (filters.lote === "" || (row.lote && row.lote.toLowerCase().includes(filters.lote.toLowerCase()))) &&
      (filters.cultivo === "" || (row.cultivo && row.cultivo.toLowerCase().includes(filters.cultivo.toLowerCase())))
    );
  });

  const headerControls = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          width: '100%',
          flexWrap: 'wrap'
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <Typography variant="subtitle2" mb={1}>
            {t("_campaign")}
          </Typography>
          <Select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            size="small"
            disabled={isLoading || !campaigns || campaigns.length === 0}
          >
            {campaigns && campaigns.map(camp => (
              <MenuItem key={camp._id} value={camp._id}>
                {camp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <Typography variant="subtitle2" mb={1}>
            {t("alternative_currency_quote")}
          </Typography>
          <TextField
            size="small"
            value={altCurrency}
            onChange={(e) => setAltCurrency(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">ARS</InputAdornment>,
            }}
            sx={{ minWidth: 150 }}
          />
        </FormControl>

        <FormControl>
          <Typography variant="subtitle2" mb={1}>
            {t("operation")}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isMultiply}
                onChange={() => setIsMultiply(!isMultiply)}
              />
            }
            label={isMultiply ? t("multiply") : t("divide")}
          />
        </FormControl>
      </Box>
    </Box>
  );

  return (
    <GenericListPage
      isLoading={isLoading}
      title={t("campaign_results")}
      icon={<QueryStatsIcon sx={{ fontSize: 40, color: "#424242" }} />}
      data={filteredData}
      columns={columns}
      getData={() => { }}
      deleteData={() => { }}
      setActiveItem={() => { }}
      newItemPath=""
      editItemPath={(id) => ``}
      showAddButton={false}
      headerContent={headerControls}
      footerContent={
        reportData.length > 0 ?
          <TotalsSummary totals={calculateTotals(filteredData, isMultiply, parseFloat(altCurrency) || 1)} /> :
          null
      }
      onFilter={handleFilterChange}
    />
  );
};