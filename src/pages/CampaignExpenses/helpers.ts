import { Campaign, Field, Lot, LaborsServices } from '../../types';
import { Company } from '../../interfaces/company';
import { CostsExpenses } from '../../interfaces/costsExpenses';
import { CampaingExpenses, ListCampingExpeses } from '../../interfaces/campaignExpenses';

const uniqueValues = (...values: Array<string | undefined>) =>
  Array.from(new Set(values.map(value => (value || '').trim()).filter(Boolean)));

export const normalizeValue = (value?: string) => (value || '').trim().toLowerCase();

export const matchesStoredValue = (storedValue: string | undefined, candidates: Array<string | undefined>) =>
  candidates.some(candidate => normalizeValue(candidate) === normalizeValue(storedValue));

export const getCampaignCandidates = (campaign: Campaign) =>
  uniqueValues(campaign._id, campaign.campaignId, campaign.name);

export const getFieldCandidates = (field: Field) =>
  uniqueValues(field._id, field.uuid, field.nombre);

export const getLotCandidates = (lot: Lot) =>
  {
    const dynamicLot = lot as Lot & {
      id?: string;
      uuid?: string;
      properties?: {
        uuid?: string;
        id?: string;
        nombre?: string;
      };
    };

    return uniqueValues(
      dynamicLot.id,
      dynamicLot._id,
      dynamicLot.uuid,
      dynamicLot.properties?.uuid,
      dynamicLot.properties?.id,
      dynamicLot.properties?.nombre,
    );
  };

export const getCompanyCandidates = (company: Company) =>
  uniqueValues(company._id, company.companyId, company.socialReason, company.fantasyName, company.name);

export const findCampaignByStoredValue = (campaigns: Campaign[], storedValue?: string) =>
  campaigns.find(campaign => matchesStoredValue(storedValue, getCampaignCandidates(campaign))) || null;

export const findFieldByStoredValue = (fields: Field[], storedValue?: string) =>
  fields.find(field => matchesStoredValue(storedValue, getFieldCandidates(field))) || null;

export const findLotByStoredValue = (field: Field | null, storedValue?: string) => {
  if (!field) return null;
  return field.lotes.find(lot => matchesStoredValue(storedValue, getLotCandidates(lot))) || null;
};

export const findCompanyByStoredValue = (companies: Company[], storedValue?: string) =>
  companies.find(company => matchesStoredValue(storedValue, getCompanyCandidates(company))) || null;

export const findLaborByStoredValue = (laborsServices: LaborsServices[], storedValue?: string) =>
  laborsServices.find(labor => matchesStoredValue(storedValue, [labor.service, labor.description])) || null;

export const findCostByStoredValue = (costsExpenses: CostsExpenses[], storedValue?: string) =>
  costsExpenses.find(cost => matchesStoredValue(storedValue, [cost.costCode, cost.description])) || null;

export const getCampaignDisplayName = (campaigns: Campaign[], storedValue?: string) =>
  findCampaignByStoredValue(campaigns, storedValue)?.name || storedValue || '';

export const getFieldDisplayName = (fields: Field[], storedValue?: string) =>
  findFieldByStoredValue(fields, storedValue)?.nombre || storedValue || '';

export const getLotDisplayName = (fields: Field[], fieldValue?: string, lotValue?: string) => {
  const selectedField = findFieldByStoredValue(fields, fieldValue);
  return findLotByStoredValue(selectedField, lotValue)?.properties?.nombre || lotValue || '';
};

export const getCompanyDisplayName = (companies: Company[], storedValue?: string) => {
  const company = findCompanyByStoredValue(companies, storedValue);
  return company?.socialReason || company?.fantasyName || company?.name || storedValue || '';
};

export const getExpenseTotalAmount = (expense: CampaingExpenses) =>
  (expense.listCamapingExpeses || []).reduce((sum, current) => sum + (parseFloat(current.amount || '0') || 0), 0);

export const formatAmount = (amount: number) =>
  amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const buildEmptyDetail = (): ListCampingExpeses => ({
  id: '',
  date: '',
  company: '',
  labor: '',
  costCode: '',
  amount: '',
  detail: '',
  reference: '',
});

export const buildEmptyExpense = (): CampaingExpenses => ({
  campaign: '',
  zafra: '',
  field: '',
  lot: '',
  hectares: '',
  partial: '',
  listCamapingExpeses: [],
});

export const createDetailId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
