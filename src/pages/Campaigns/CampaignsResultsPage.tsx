import React, { useState, useEffect } from "react";
import { QueryStats as QueryStatsIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "../GenericListPage";
import { useCampaign } from "../../hooks";
import { dbContext } from "../../services";
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
  Grid
} from "@mui/material";

interface Activity {
  uuid: string;
  lote_uuid: string;
  type: string;
  tipo: string;
  fecha: string;
  nombre: string;
  proxima_visita: string;
  last_updated: {
    last_updated: string;
    last_updated_by: string;
  };
  created: {
    created: string;
    created_by: string;
  };
  features: Array<{
    properties: {
      nombre: string;
      notas: string;
      detalles: any[];
      fotos: string[];
      audios: string[];
      posicion: [number, number];
      program: string;
      severity: string;
      imageAnalysis: any[];
    };
  }>;
  hora: string;
  campaña: {
    campaignId: string;
    name: string;
    description: string;
    zoneId: string;
    startDate: string;
    endDate: string;
    state: string;
    accountId: string;
    creationDate: string;
    _id: string;
    _rev: string;
  };
  _id: string;
  _rev: string;
}

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
    .reduce((sum, item) => sum + item.importe, 0);

  const factor = isMultiply ? rate : 1/rate;
  
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
  const { campaigns, getCampaigns, isLoading } = useCampaign();
  const [campaign, setCampaign] = useState("");
  const [altCurrency, setAltCurrency] = useState("35");
  const [isMultiply, setIsMultiply] = useState(true);
  const [activities, setActivities] = useState<TableRow[]>([]);
  const db = dbContext.fields;

  const columns = [
    { field: "campaña", headerName: t("_campaign"), flex: 0.8 },
    { field: "sociedad", headerName: t("_society"), flex: 1 },
    { field: "contrato", headerName: t("_contract"), flex: 0.8 },
    { field: "campo", headerName: t("_field"), flex: 1 },
    { field: "lote", headerName: t("_lot"), flex: 0.7 },
    { field: "cultivo", headerName: t("_crop"), flex: 0.8 },
    { field: "fecha", headerName: t("_date"), flex: 0.8 },
    { field: "tipo", headerName: t("_type"), flex: 0.8 },
    { field: "labor", headerName: t("_labor"), flex: 1 },
    { field: "detalle", headerName: t("_detail"), flex: 1.2 },
    { field: "referencia", headerName: t("_reference"), flex: 0.8 },
    { field: "moneda", headerName: t("_currency"), flex: 0.7 },
    { 
      field: "importe",
      headerName: t("_amount"),
      flex: 0.8,
      type: 'number',
      renderCell: (params) => `${params.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    },
    { 
      field: "importeAlternativo",
      headerName: t("alternative_amount"),
      flex: 0.8,
      type: 'number',
      renderCell: (params) => `${params.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    },
  ];

  useEffect(() => {
    getCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length > 0 && !campaign) {
      setCampaign(campaigns[0]._id);
    }
  }, [campaigns]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!campaign) return;
      
      try {
        console.log('Fetching activities for campaign:', campaign);
        const result = await db.allDocs({
          include_docs: true,
          startkey: 'actividad:',
          endkey: 'actividad:\ufff0'
        });

        console.log('All activities:', result.rows);

        const filteredActivities = result.rows
          .map(row => row.doc)
          .filter(doc => doc?.campaña?._id === campaign);

        console.log('Filtered activities for campaign:', filteredActivities);

        const processedData = filteredActivities.map(activity => ({
          id: activity.uuid,
          campaña: activity.campaña?.name || '',
          sociedad: '', // Add if available in your data
          contrato: '', // Add if available in your data
          campo: '', // Add if available in your data
          lote: activity.lote_uuid,
          cultivo: '', // Add if available in your data
          fecha: activity.fecha ? format(new Date(activity.fecha), 'dd/MM/yyyy') : '',
          tipo: activity.tipo,
          labor: activity.features?.[0]?.properties?.program || '',
          detalle: activity.features?.[0]?.properties?.notas || '',
          referencia: activity.nombre,
          moneda: 'USD', // Add proper currency if available
          importe: 0, // Add proper amount if available
          importeAlternativo: 0 // Calculate based on exchange rate
        }));

        console.log('Processed activities:', processedData);
        setActivities(processedData);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [campaign]);

  const headerControls = (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 3, 
        p: 2, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 1,
        width: '100%'
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
        >
          {campaigns.map(camp => (
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
  );

  return (
    <GenericListPage
      isLoading={isLoading}
      title={t("campaign_results")}
      icon={<QueryStatsIcon sx={{ fontSize: 40, color: "#424242" }} />}
      data={activities}
      columns={columns}
      getData={() => {}} // Not needed as we're handling data fetching in useEffect
      deleteData={() => {}} // Add if needed
      setActiveItem={() => {}} // Add if needed
      newItemPath=""
      editItemPath={(id) => ``}
      showAddButton={false}
      headerContent={headerControls}
      footerContent={<TotalsSummary totals={calculateTotals(activities, isMultiply, parseFloat(altCurrency))} />}
    />
  );
};