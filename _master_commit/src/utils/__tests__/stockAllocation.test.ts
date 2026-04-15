import { describe, expect, it } from "vitest";

import {
  allocateStockWithdrawal,
  getAvailableStockAmount,
  getMatchingSupplyStocks,
} from "../stockAllocation";

const buildStock = (overrides = {}) =>
  ({
    _id: "stock-1",
    _rev: "1-a",
    id: "supply-1",
    tipo: "insumo",
    accountId: "acc-1",
    depositId: "deposit-1",
    location: "",
    nroLot: "",
    campaignId: "camp-1",
    fieldId: "",
    fieldLot: "",
    currentStock: 100,
    reservedStock: 20,
    lastUpdate: new Date().toISOString(),
    ...overrides,
  } as any);

describe("stockAllocation", () => {
  it("computes available stock from current minus reserved", () => {
    expect(getAvailableStockAmount(buildStock())).toBe(80);
  });

  it("filters by deposit and supply and prefers matching campaign", () => {
    const stocks = [
      buildStock({ _id: "a", campaignId: "camp-2", currentStock: 40, reservedStock: 0 }),
      buildStock({ _id: "b", campaignId: "camp-1", currentStock: 10, reservedStock: 0 }),
    ];

    const matches = getMatchingSupplyStocks(stocks, {
      supplyId: "supply-1",
      depositId: "deposit-1",
      campaignId: "camp-1",
    });

    expect(matches.map((stock) => stock._id)).toEqual(["b", "a"]);
  });

  it("keeps exact location and lot filters when provided", () => {
    const stocks = [
      buildStock({ _id: "a", location: "A1", nroLot: "L1" }),
      buildStock({ _id: "b", location: "A2", nroLot: "L2" }),
    ];

    const matches = getMatchingSupplyStocks(stocks, {
      supplyId: "supply-1",
      depositId: "deposit-1",
      location: "A2",
      nroLot: "L2",
    });

    expect(matches.map((stock) => stock._id)).toEqual(["b"]);
  });

  it("allocates across multiple stock rows when the deposit view is aggregated", () => {
    const stocks = [
      buildStock({ _id: "a", currentStock: 50, reservedStock: 10 }),
      buildStock({ _id: "b", currentStock: 30, reservedStock: 0 }),
    ];

    const result = allocateStockWithdrawal(stocks, 60);

    expect(result.totalAvailable).toBe(70);
    expect(result.remaining).toBe(0);
    expect(result.allocations).toEqual([
      { stock: stocks[0], amount: 40 },
      { stock: stocks[1], amount: 20 },
    ]);
  });
});
