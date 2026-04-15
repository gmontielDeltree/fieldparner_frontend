import React, { useState, useEffect, useMemo } from 'react';
import {
  QueryStats as QueryStatsIcon,
  GetApp as GetAppIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GenericListPage } from '../../components';
import { useAppSelector, useCampaign, useExecutions } from '../../hooks';
import { format } from 'date-fns';
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
  Alert,
  InputLabel,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useContractSaleCereals } from '../../hooks/useContractSaleCereals';
import { useCampaingExpenses } from '../../hooks/useCampaignExpenses';
import { ListCampingExpeses } from '../../interfaces/campaignExpenses';
import { dbContext } from '../../services';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

const normalizeValue = (value: unknown) => (value ?? '').toString().trim().toLowerCase();

const uniqueIdentifiers = (...values: unknown[]) =>
  Array.from(
    new Set(
      values
        .map(value => (value ?? '').toString().trim())
        .filter(Boolean),
    ),
  );

const getFieldIdentifiers = (field: any, fallback?: string) =>
  uniqueIdentifiers(
    fallback,
    field?._id,
    field?.uuid,
    field?.id,
    field?.nombre,
    field?.name,
    field?.properties?.nombre,
    field?.properties?.name,
  );

const getLotIdentifiers = (lot: any, fallback?: string) =>
  uniqueIdentifiers(
    fallback,
    lot?.id,
    lot?._id,
    lot?.uuid,
    lot?.properties?.uuid,
    lot?.properties?.id,
    lot?.properties?.nombre,
    lot?.properties?.name,
    lot?.properties?.description,
  );

const getCampaignIdentifiers = (campaign: any, fallback?: string) =>
  uniqueIdentifiers(
    fallback,
    campaign?._id,
    campaign?.campaignId,
    campaign?.id,
    campaign?.name,
    campaign?.description,
  );

const calculateTotals = (data: TableRow[], isMultiply: boolean, rate: number): CampaignTotals => {
  const contracts = data
    .filter(item => item.tipo === 'Contrato')
    .reduce((sum, item) => sum + item.importe, 0);

  const expenses = data
    .filter(item => item.tipo !== 'Contrato')
    .reduce((sum, item) => sum + Math.abs(item.importe), 0);

  const factor = isMultiply ? rate : 1 / rate;

  return {
    contracts,
    expenses,
    result: contracts - expenses,
    alternativeContracts: contracts * factor,
    alternativeExpenses: expenses * factor,
    alternativeResult: (contracts - expenses) * factor,
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
        gap: 2,
      }}
    >
      <Typography variant='h6' sx={{ mb: 2, color: '#424242' }}>
        {t('campaign_summary')}
      </Typography>

      <Grid container spacing={2}>
        {[
          { label: t('contracts'), values: [totals.contracts, totals.alternativeContracts] },
          {
            label: t('expenses'),
            values: [totals.expenses, totals.alternativeExpenses],
            isNegative: true,
          },
          { label: t('campaign_result'), values: [totals.result, totals.alternativeResult] },
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
                  mt: 1,
                }),
              }}
            >
              <Typography
                sx={{
                  flex: '1 1 33%',
                  fontWeight: index === 2 ? 'bold' : 'normal',
                  color: '#424242',
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
                    color: row.isNegative ? '#d32f2f' : '#424242',
                  }}
                >
                  {value.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: i === 0 ? 'USD' : 'ARS',
                    minimumFractionDigits: 2,
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
  const { user } = useAppSelector(state => state.auth);
  const { campaigns = [], getCampaigns } = useCampaign();
  const { contractsSaleCerealsFull = [], getContractsSaleCereals } = useContractSaleCereals();
  const { campaingExpenses = [], getCampaingExpenses } = useCampaingExpenses();
  const { executions = [], getExecutions } = useExecutions();

  const [campaign, setCampaign] = useState<string>('');
  const [altCurrency, setAltCurrency] = useState<string>('35');
  const [isMultiply, setIsMultiply] = useState<boolean>(true);
  const [reportData, setReportData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sociedad: '',
    contrato: '',
    campo: '',
    lote: '',
    cultivo: '',
  });
  const [fields, setFields] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const resolveFieldLotInfo = (fieldValue?: string, lotValue?: string) => {
    const normalizedFieldValue = normalizeValue(fieldValue);
    const normalizedLotValue = normalizeValue(lotValue);

    const orderedFields = normalizedFieldValue
      ? [
          ...fields.filter(field =>
            getFieldIdentifiers(field).some(identifier => normalizeValue(identifier) === normalizedFieldValue),
          ),
          ...fields.filter(
            field =>
              !getFieldIdentifiers(field).some(
                identifier => normalizeValue(identifier) === normalizedFieldValue,
              ),
          ),
        ]
      : fields;

    for (const field of orderedFields) {
      const lotes = Array.isArray(field?.lotes) ? field.lotes : [];
      const fieldName =
        field?.nombre || field?.properties?.nombre || field?.name || field?.properties?.name || '';

      if (normalizedLotValue) {
        const lot = lotes.find((candidateLot: any) =>
          getLotIdentifiers(candidateLot).some(
            identifier => normalizeValue(identifier) === normalizedLotValue,
          ),
        );

        if (lot) {
          const lotId = lot.id || lot.properties?.uuid || lot.properties?.id || lotValue || '';
          return {
            fieldName,
            fieldId: field?._id || field?.uuid || field?.id || fieldValue || '',
            lotId,
            lotName:
              lot.properties?.nombre ||
              lot.properties?.name ||
              lot.properties?.description ||
              lotId,
          };
        }
      }

      if (
        normalizedFieldValue &&
        getFieldIdentifiers(field).some(identifier => normalizeValue(identifier) === normalizedFieldValue)
      ) {
        return {
          fieldName,
          fieldId: field?._id || field?.uuid || field?.id || fieldValue || '',
          lotId: lotValue || '',
          lotName: lotValue || '',
        };
      }
    }

    return {
      fieldName: fieldValue || '',
      fieldId: fieldValue || '',
      lotId: lotValue || '',
      lotName: lotValue || '',
    };
  };

  const resolveCompanyName = (companyValue?: string) => {
    if (!companyValue) return '';

    const company = companies.find((currentCompany: any) =>
      uniqueIdentifiers(
        currentCompany?._id,
        currentCompany?.companyId,
        currentCompany?.socialReason,
        currentCompany?.fantasyName,
        currentCompany?.name,
      ).some(identifier => normalizeValue(identifier) === normalizeValue(companyValue)),
    );

    return company?.socialReason || company?.fantasyName || company?.name || companyValue;
  };

  const columns = [
    { field: 'campaña', headerName: t('_campaign'), flex: 0.8, filterable: false },
    { field: 'sociedad', headerName: t('_society'), flex: 1, filterable: true },
    { field: 'contrato', headerName: t('_contract'), flex: 0.8, filterable: true },
    { field: 'campo', headerName: t('_field'), flex: 1, filterable: true },
    { field: 'lote', headerName: t('_lot'), flex: 0.7, filterable: true },
    { field: 'cultivo', headerName: t('_crop'), flex: 0.8, filterable: true },
    { field: 'fecha', headerName: t('_date'), flex: 0.8, filterable: false },
    { field: 'tipo', headerName: t('_type'), flex: 0.8, filterable: false },
    { field: 'labor', headerName: t('_labor'), flex: 1, filterable: false },
    { field: 'detalle', headerName: t('_detail'), flex: 1.2, filterable: false },
    { field: 'referencia', headerName: t('_reference'), flex: 0.8, filterable: false },
    { field: 'moneda', headerName: t('_currency'), flex: 0.7, filterable: false },
    {
      field: 'importe',
      headerName: t('_amount'),
      flex: 0.8,
      type: 'number',
      filterable: false,
      renderCell: params => `${params.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    },
    {
      field: 'importeAlternativo',
      headerName: t('alternative_amount'),
      flex: 0.8,
      type: 'number',
      filterable: false,
      renderCell: params => `${params.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        await Promise.all([
          getCampaigns(),
          getContractsSaleCereals(),
          getCampaingExpenses(),
          getExecutions(),
          dbContext.companies.allDocs({ include_docs: true }).then(result => {
            setCompanies(
              result.rows
                .map(row => row.doc as any)
                .filter(doc => {
                  if (!doc) return false;
                  if (doc._id?.startsWith('_')) return false;
                  if (user?.accountId && doc.accountId !== user.accountId) return false;
                  if (user?.licenceId && doc.licenceId && doc.licenceId !== user.licenceId) return false;
                  return true;
                }),
            );
          }),
          dbContext.fields.allDocs({ include_docs: true }).then(result => {
            setFields(
              result.rows
                .filter(row => {
                  const doc = row.doc as any;
                  if (!doc) return false;
                  if (!row.id?.includes('campos_')) return false;
                  if (user?.accountId && doc.accountId && doc.accountId !== user.accountId) return false;
                  return Array.isArray(doc.lotes);
                })
                .map(row => row.doc),
            );
          }),
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(t('error_loading_data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.accountId, user?.licenceId]);

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
        console.log('Selected Campaign:', selectedCampaign);
        console.log('Campaign ID:', campaign);

        if (!selectedCampaign) {
          setReportData([]);
          return;
        }

        const rate = parseFloat(altCurrency) || 1;
        const factor = isMultiply ? rate : 1 / rate;
        const selectedCampaignIdentifiers = getCampaignIdentifiers(selectedCampaign, campaign);
        const matchesSelectedCampaign = (...values: unknown[]) =>
          values
            .flatMap(value => {
              if (value && typeof value === 'object') {
                return getCampaignIdentifiers(value);
              }
              return [(value ?? '').toString().trim()];
            })
            .filter(Boolean)
            .some(candidate =>
              selectedCampaignIdentifiers.some(
                identifier => normalizeValue(identifier) === normalizeValue(candidate),
              ),
            );

        // Procesar contratos
        let contractsData = [];
        const filteredContracts =
          contractsSaleCerealsFull && contractsSaleCerealsFull.length > 0
            ? contractsSaleCerealsFull.filter(
                contract => contract && matchesSelectedCampaign(contract.campaignId, contract.campaign),
              )
            : [];
        if (filteredContracts.length > 0) {
          contractsData = filteredContracts.map(contract => ({
            id: contract._id,
            campaña: selectedCampaign.name || '',
            sociedad: contract.company?.socialReason || contract.company?.name || '',
            contrato: contract.contractSaleNumber || '',
            campo: contract.destination?.name || '',
            lote: '',
            cultivo: contract.crop?.descriptionES || contract.crop?.name || '',
            fecha: contract.dateCreated ? format(new Date(contract.dateCreated), 'dd/MM/yyyy') : '',
            tipo: t('_contract_type'),
            labor: '',
            detalle: contract.condition || '',
            referencia: contract.contractSaleNumber || '',
            moneda: contract.currency || 'USD',
            importe: parseFloat(contract.amountValue || '0'),
            importeAlternativo: parseFloat(contract.amountValue || '0') * factor,
          }));
        }

        let expensesData = [];
        console.log('Campaign Expenses:', campaingExpenses);
        if (campaingExpenses && campaingExpenses.length > 0) {
          const filteredExpenses = campaingExpenses.filter(
            expense => expense && matchesSelectedCampaign(expense.campaign),
          );
          console.log('Filtered Expenses:', filteredExpenses);
          expensesData = filteredExpenses.flatMap(expense => {
            if (!expense.listCamapingExpeses || expense.listCamapingExpeses.length === 0) {
              return [];
            }

            const expenseFieldLotInfo = resolveFieldLotInfo(expense.field, expense.lot);

            return expense.listCamapingExpeses.map((item: ListCampingExpeses) => ({
              id: expense._id + '-' + item.id,
              campaña: selectedCampaign.name || '',
              sociedad: resolveCompanyName(item.company),
              contrato: (item as any).contractSaleNumber || (item as any).contrato || (expense as any).contractSaleNumber || (expense as any).contrato || '',
              campo: expenseFieldLotInfo.fieldName || expense.field || '',
              lote: expenseFieldLotInfo.lotName || expense.lot || '',
              cultivo: '',
              fecha: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '',
              tipo: t('_expense_type'),
              labor: item.labor || '',
              detalle: item.detail || '',
              referencia: item.reference || '',
              moneda: 'USD',
              importe: -parseFloat(item.amount || '0'),
              importeAlternativo: -parseFloat(item.amount || '0') * factor,
            }));
          });
        }

        // Procesar ejecuciones
        let executionsData = [];
        console.log('All Executions:', executions);
        if (executions && executions.length > 0) {
          const filteredExecutions = executions.filter(execution => {
            if (!execution || !execution.campaña) return false;
            const campaignObj = execution.campaña;
            return matchesSelectedCampaign(campaignObj);
          });
          console.log('Filtered Executions:', filteredExecutions.length);
          executionsData = filteredExecutions.map(execution => {
            // Calcular costo de la ejecución basado en insumos y servicios
            let costoTotal = 0;

            // Sumar costos de insumos
            if (execution.detalles?.dosis) {
              execution.detalles.dosis.forEach(dosis => {
                const cantidad = parseFloat(dosis.dosificacion || dosis.total || '0');
                const precio = parseFloat(dosis.precio || '0');
                costoTotal += cantidad * precio;
              });
            }

            // Sumar costos de servicios/labores
            if (execution.detalles?.costo_labor) {
              execution.detalles.costo_labor.forEach(labor => {
                costoTotal += parseFloat(labor.costo || '0');
              });
            }

            const cropIdentifiers = uniqueIdentifiers(
              execution.detalles?.cultivo?._id,
              execution.detalles?.cultivo?.cropId,
              execution.detalles?.cultivo?.descriptionES,
              execution.detalles?.cultivo?.name,
              execution.detalles?.cultivo?.nombre,
            );

            const relatedContract =
              filteredContracts.find(contract => {
                const contractCropIdentifiers = uniqueIdentifiers(
                  contract.cropId,
                  contract.crop?._id,
                  contract.crop?.cropId,
                  contract.crop?.descriptionES,
                  contract.crop?.name,
                  contract.crop?.nombre,
                );

                return (
                  cropIdentifiers.length > 0 &&
                  contractCropIdentifiers.some(contractIdentifier =>
                    cropIdentifiers.some(
                      executionIdentifier =>
                        normalizeValue(contractIdentifier) === normalizeValue(executionIdentifier),
                    ),
                  )
                );
              }) ||
              (filteredContracts.length === 1 ? filteredContracts[0] : undefined);

            const lotInfo = resolveFieldLotInfo(undefined, execution.lote_uuid || '');
            return {
              id: execution._id,
              campaña: selectedCampaign.name || '',
              sociedad:
                relatedContract?.company?.socialReason ||
                relatedContract?.company?.name ||
                execution.detalles?.contratista?.razonSocial ||
                execution.detalles?.contratista?.nombreCompleto ||
                execution.contratista?.razonSocial ||
                execution.contratista?.nombreCompleto ||
                execution.contratista?.nombre ||
                '',
              contrato: relatedContract?.contractSaleNumber || (execution as any).contractSaleNumber || (execution as any).contrato || '',
              campo: lotInfo.fieldName,
              lote: lotInfo.lotName || execution.lote_uuid || '',
              cultivo:
                execution.detalles?.cultivo?.descriptionES ||
                execution.detalles?.cultivo?.name ||
                '',
              fecha: execution.detalles?.fecha_ejecucion
                ? format(new Date(execution.detalles.fecha_ejecucion), 'dd/MM/yyyy')
                : '',
              tipo: t('_execution_type'),
              labor: execution.detalles?.costo_labor?.[0]?.labor?.descriptionES
                || execution.detalles?.costo_labor?.[0]?.labor?.name
                || execution.tipo
                || '',
              detalle: `${execution.detalles?.hectareas || 0} ha - ${
                execution.detalles?.contratista?.nombreCompleto ||
                execution.detalles?.contratista?.razonSocial ||
                ''
              }`,
              referencia: execution.uuid || '',
              moneda: 'USD',
              importe: -costoTotal,
              importeAlternativo: -costoTotal * factor,
            };
          });
        }

        const allData = [...contractsData, ...expensesData, ...executionsData];
        setReportData(allData);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(t('error_report_data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [campaign, campaigns, contractsSaleCerealsFull, campaingExpenses, executions, fields, companies]);

  useEffect(() => {
    if (reportData.length === 0) return;

    const rate = parseFloat(altCurrency) || 1;
    const factor = isMultiply ? rate : 1 / rate;

    const updatedData = reportData.map(row => ({
      ...row,
      importeAlternativo: row.importe * factor,
    }));

    setReportData(updatedData);
  }, [altCurrency, isMultiply]);

  // Obtener valores únicos para los filtros dropdown
  const uniqueValues = useMemo(() => {
    const getUnique = (field: string) => {
      const values = reportData
        .map(row => row[field])
        .filter(value => value && value !== '')
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort();
      return values;
    };

    return {
      sociedades: getUnique('sociedad'),
      contratos: getUnique('contrato'),
      campos: getUnique('campo'),
      lotes: getUnique('lote'),
      cultivos: getUnique('cultivo'),
    };
  }, [reportData]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados Campaña');

    // Agregar hoja de resumen
    const totals = calculateTotals(filteredData, isMultiply, parseFloat(altCurrency) || 1);
    const summaryData = [
      {
        Concepto: t('contracts'),
        'Importe USD': totals.contracts,
        'Importe ARS': totals.alternativeContracts,
      },
      {
        Concepto: t('expenses'),
        'Importe USD': -totals.expenses,
        'Importe ARS': -totals.alternativeExpenses,
      },
      {
        Concepto: t('campaign_result'),
        'Importe USD': totals.result,
        'Importe ARS': totals.alternativeResult,
      },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    XLSX.writeFile(wb, `ResultadosCampaña_${campaign}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const selectedCampaign = campaigns.find(c => c._id === campaign);

    // Título
    doc.setFontSize(16);
    doc.text(`Resultados de Campaña: ${selectedCampaign?.name || ''}`, 14, 15);

    // Información de cotización
    doc.setFontSize(10);
    doc.text(
      `Cotización Moneda Alternativa: ${altCurrency} ARS (${
        isMultiply ? 'Multiplicar' : 'Dividir'
      })`,
      14,
      25,
    );
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

    // Tabla de datos
    const tableData = filteredData.map(row => [
      row.campaña,
      row.sociedad,
      row.contrato,
      row.campo,
      row.lote,
      row.cultivo,
      row.fecha,
      row.tipo,
      row.labor,
      row.detalle,
      row.referencia,
      row.moneda,
      row.importe.toFixed(2),
      row.importeAlternativo.toFixed(2),
    ]);

    (doc as any).autoTable({
      head: [columns.map(col => col.headerName)],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    // Agregar resumen al final
    const totals = calculateTotals(filteredData, isMultiply, parseFloat(altCurrency) || 1);
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text('Resumen:', 14, finalY);
    doc.setFontSize(10);
    doc.text(
      `Contratos: USD ${totals.contracts.toFixed(2)} / ARS ${totals.alternativeContracts.toFixed(
        2,
      )}`,
      14,
      finalY + 7,
    );
    doc.text(
      `Gastos: USD ${totals.expenses.toFixed(2)} / ARS ${totals.alternativeExpenses.toFixed(2)}`,
      14,
      finalY + 14,
    );
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(
      `Resultado: USD ${totals.result.toFixed(2)} / ARS ${totals.alternativeResult.toFixed(2)}`,
      14,
      finalY + 21,
    );

    doc.save(`ResultadosCampaña_${campaign}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const filteredData = reportData.filter(row => {
    return (
      (filters.sociedad === '' ||
        (row.sociedad && row.sociedad.toLowerCase().includes(filters.sociedad.toLowerCase()))) &&
      (filters.contrato === '' ||
        (row.contrato && row.contrato.toLowerCase().includes(filters.contrato.toLowerCase()))) &&
      (filters.campo === '' ||
        (row.campo && row.campo.toLowerCase().includes(filters.campo.toLowerCase()))) &&
      (filters.lote === '' ||
        (row.lote && row.lote.toLowerCase().includes(filters.lote.toLowerCase()))) &&
      (filters.cultivo === '' ||
        (row.cultivo && row.cultivo.toLowerCase().includes(filters.cultivo.toLowerCase())))
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
        <Alert severity='error' onClose={() => setError(null)}>
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
          flexWrap: 'wrap',
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <Typography variant='subtitle2' mb={1}>
            {t('_campaign')} *
          </Typography>
          <Select
            value={campaign}
            onChange={e => setCampaign(e.target.value)}
            size='small'
            disabled={isLoading || !campaigns || campaigns.length === 0}
          >
            {campaigns &&
              campaigns.map(camp => (
                <MenuItem key={camp._id} value={camp._id}>
                  {camp.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl>
          <Typography variant='subtitle2' mb={1}>
            {t('alternative_currency_quote')}
          </Typography>
          <TextField
            size='small'
            value={altCurrency}
            onChange={e => setAltCurrency(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position='end'>ARS</InputAdornment>,
            }}
            sx={{ minWidth: 150 }}
          />
        </FormControl>

        <FormControl>
          <Typography variant='subtitle2' mb={1}>
            {t('operation')}
          </Typography>
          <FormControlLabel
            control={<Switch checked={isMultiply} onChange={() => setIsMultiply(!isMultiply)} />}
            label={isMultiply ? t('multiply') : t('divide')}
          />
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={t('export_excel') || 'Exportar a Excel'}>
            <span>
              <IconButton
                onClick={exportToExcel}
                disabled={filteredData.length === 0}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    backgroundColor: 'action.hover',
                  },
                  color: 'success.main',
                }}
                size='large'
              >
                <FileDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={t('export_pdf') || 'Exportar a PDF'}>
            <span>
              <IconButton
                onClick={exportToPDF}
                disabled={filteredData.length === 0}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    backgroundColor: 'action.hover',
                  },
                  color: 'error.main',
                }}
                size='large'
              >
                <PdfIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      {/* Filtros con dropdowns */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          backgroundColor: '#fafafa',
          borderRadius: 1,
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        <Typography variant='subtitle2' sx={{ width: '100%', mb: 1, fontWeight: 'bold' }}>
          {t('filters')}:
        </Typography>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>{t('_society')}</InputLabel>
          <Select
            value={filters.sociedad}
            onChange={e => handleFilterChange('sociedad', e.target.value)}
            label={t('_society')}
          >
            <MenuItem value=''>{t('all')}</MenuItem>
            {uniqueValues.sociedades.map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>{t('_contract')}</InputLabel>
          <Select
            value={filters.contrato}
            onChange={e => handleFilterChange('contrato', e.target.value)}
            label={t('_contract')}
          >
            <MenuItem value=''>{t('all')}</MenuItem>
            {uniqueValues.contratos.map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>{t('_field')}</InputLabel>
          <Select
            value={filters.campo}
            onChange={e => handleFilterChange('campo', e.target.value)}
            label={t('_field')}
          >
            <MenuItem value=''>{t('all')}</MenuItem>
            {uniqueValues.campos.map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>{t('_lot')}</InputLabel>
          <Select
            value={filters.lote}
            onChange={e => handleFilterChange('lote', e.target.value)}
            label={t('_lot')}
          >
            <MenuItem value=''>{t('all')}</MenuItem>
            {uniqueValues.lotes.map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>{t('_crop')}</InputLabel>
          <Select
            value={filters.cultivo}
            onChange={e => handleFilterChange('cultivo', e.target.value)}
            label={t('_crop')}
          >
            <MenuItem value=''>{t('all')}</MenuItem>
            {uniqueValues.cultivos.map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );

  return (
    <GenericListPage
      isLoading={isLoading}
      moduleRoute='init/overview/campaign-results'
      data={filteredData}
      columns={columns}
      getData={() => {}}
      deleteData={() => {}}
      setActiveItem={() => {}}
      newItemPath=''
      editItemPath={id => ``}
      showAddButton={false}
      headerContent={headerControls}
      footerContent={
        reportData.length > 0 ? (
          <TotalsSummary
            totals={calculateTotals(filteredData, isMultiply, parseFloat(altCurrency) || 1)}
          />
        ) : null
      }
      onFilter={handleFilterChange}
    />
  );
};
