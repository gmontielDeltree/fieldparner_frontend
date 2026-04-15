import { Stock } from "../interfaces/stock";

const normalizeValue = (value?: string | null) => String(value ?? "").trim().toLowerCase();

export const getAvailableStockAmount = (stock: Partial<Stock>) =>
  Math.max(0, Number(stock.currentStock || 0) - Number(stock.reservedStock || 0));

export interface StockAllocationCriteria {
  supplyId?: string;
  depositId?: string;
  campaignId?: string;
  location?: string;
  nroLot?: string;
}

export interface StockAllocationItem {
  stock: Stock;
  amount: number;
}

export interface StockAllocationResult {
  allocations: StockAllocationItem[];
  totalAvailable: number;
  remaining: number;
}

export const getMatchingSupplyStocks = (
  stocks: Stock[] = [],
  criteria: StockAllocationCriteria,
) => {
  const supplyId = normalizeValue(criteria.supplyId);
  const depositId = normalizeValue(criteria.depositId);
  const location = normalizeValue(criteria.location);
  const nroLot = normalizeValue(criteria.nroLot);
  const campaignId = normalizeValue(criteria.campaignId);

  return stocks
    .filter((stock) => normalizeValue(stock.id) === supplyId)
    .filter((stock) => normalizeValue(stock.depositId) === depositId)
    .filter((stock) => !location || !normalizeValue(stock.location) || normalizeValue(stock.location) === location)
    .filter((stock) => !nroLot || !normalizeValue(stock.nroLot) || normalizeValue(stock.nroLot) === nroLot)
    .sort((a, b) => {
      const campaignScoreA = campaignId && normalizeValue(a.campaignId) === campaignId ? 1 : 0;
      const campaignScoreB = campaignId && normalizeValue(b.campaignId) === campaignId ? 1 : 0;
      if (campaignScoreA !== campaignScoreB) return campaignScoreB - campaignScoreA;

      return getAvailableStockAmount(b) - getAvailableStockAmount(a);
    });
};

export const allocateStockWithdrawal = (
  stocks: Stock[] = [],
  requestedAmount: number,
): StockAllocationResult => {
  let remaining = Number(requestedAmount || 0);
  const allocations: StockAllocationItem[] = [];
  const totalAvailable = stocks.reduce(
    (acc, stock) => acc + getAvailableStockAmount(stock),
    0,
  );

  for (const stock of stocks) {
    if (remaining <= 0) break;

    const available = getAvailableStockAmount(stock);
    if (available <= 0) continue;

    const amount = Math.min(available, remaining);
    allocations.push({ stock, amount });
    remaining -= amount;
  }

  return {
    allocations,
    totalAvailable,
    remaining,
  };
};
