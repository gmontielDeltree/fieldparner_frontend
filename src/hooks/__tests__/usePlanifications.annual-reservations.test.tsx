import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import PouchDBMemory from "pouchdb-adapter-memory";
import { usePlanActividad } from "../usePlanifications";

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBMemory);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../services");

vi.mock("../../services/notificationService", () => ({
  NotificationService: {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showAdded: vi.fn(),
    showUpdated: vi.fn(),
    showDeleted: vi.fn(),
    showWarning: vi.fn(),
  },
}));

import { dbContext } from "../../services";

const createStore = () =>
  configureStore({
    reducer: {
      auth: () => ({
        user: {
          id: "user-1",
          accountId: "acc-1",
          licenceId: "lic-1",
          currency: "ARS",
          countryId: "AR",
        },
      }),
      order: () => ({ withdrawalOrderActive: null }),
      campaign: () => ({
        selectedCampaign: {
          _id: "camp-doc",
          campaignId: "camp-1",
          name: "Campania 1",
          zafra: "2025/2026",
        },
      }),
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createStore()}>
    <MemoryRouter>{children}</MemoryRouter>
  </Provider>
);

const createPlanActivity = () =>
  ({
    accountId: "acc-1",
    _id: "planactividad:1",
    insumosLineasIds: ["planlinsumo:1"],
    laboresLineasIds: [],
    fecha: "2026-04-14T00:00:00.000Z",
    tipo: "siembra",
    area: 10,
    totalCosto: 0,
    campanaId: "camp-doc",
    cicloId: "ciclo:1",
    campoId: "field-1",
    loteId: "lot-1",
    ejecutada: false,
    created: { userId: "user-1", date: "2026-04-14T00:00:00.000Z" },
    modified: { userId: "user-1", date: "2026-04-14T00:00:00.000Z" },
    contratista: { _id: "contr-1", nombreCompleto: "Contratista Uno" },
  }) as any;

const createPlanSupplyLine = (totalCantidad: number) =>
  ({
    _id: "planlinsumo:1",
    accountId: "acc-1",
    insumoId: "sup-1",
    dosis: totalCantidad / 10,
    totalCantidad,
    hectareas: 10,
    precioUnitario: 0,
    actividadId: "planactividad:1",
    deposito: { _id: "dep-1", description: "Deposito 1" },
    depositoId: "dep-1",
    ubicacion: "",
    nroLote: "L1",
    ordenRetiro: null,
  }) as any;

const createPlanSupplyLineWithLot = (
  totalCantidad: number,
  nroLote: string | number,
) =>
  ({
    ...createPlanSupplyLine(totalCantidad),
    nroLote,
  }) as any;

let databases: PouchDB.Database<any>[] = [];
let dbNamePrefix = "";

const initMemoryDb = (name: string) =>
  new PouchDB(`${dbNamePrefix}-${name}`, { adapter: "memory" });

const initInMemoryDbs = () => {
  (dbContext as any).fields = initMemoryDb("fields");
  (dbContext as any).campaigns = initMemoryDb("campaigns");
  (dbContext as any).numerators = initMemoryDb("numerators");
  (dbContext as any).withdrawalOrders = initMemoryDb("withdrawalOrders");
  (dbContext as any).depositSupplyOrder = initMemoryDb("depositSupplyOrder");
  (dbContext as any).stock = initMemoryDb("stock");
  (dbContext as any).supplies = initMemoryDb("supplies");
  (dbContext as any).deposits = initMemoryDb("deposits");

  databases = [
    dbContext.fields,
    dbContext.campaigns,
    dbContext.numerators,
    dbContext.withdrawalOrders,
    dbContext.depositSupplyOrder,
    dbContext.stock,
    dbContext.supplies,
    dbContext.deposits,
  ] as PouchDB.Database<any>[];
};

const seedDatabases = async () => {
  await dbContext.numerators.createIndex({
    index: { fields: ["accountId", "numeratorType"] },
  } as any);
  await dbContext.depositSupplyOrder.createIndex({
    index: { fields: ["accountId", "order"] },
  } as any);
  await dbContext.stock.createIndex({
    index: { fields: ["accountId", "id", "depositId", "nroLot"] },
  } as any);

  await dbContext.campaigns.post({
    _id: "camp-doc",
    accountId: "acc-1",
    campaignId: "camp-1",
    name: "Campania 1",
    zafra: "2025/2026",
  } as any);

  await dbContext.fields.post({
    _id: "ciclo:1",
    accountId: "acc-1",
    actividadesIds: [],
    fechaInicio: "2026-04-01T00:00:00.000Z",
    fechaFin: "2026-10-01T00:00:00.000Z",
    campanaId: "camp-doc",
    campoId: "field-1",
    loteId: "lot-1",
    cultivoId: "crop-1",
    zafra: "2025/2026",
    created: { userId: "user-1", date: "2026-04-01T00:00:00.000Z" },
    modified: { userId: "user-1", date: "2026-04-01T00:00:00.000Z" },
  } as any);

  await dbContext.supplies.post({
    _id: "sup-1",
    accountId: "acc-1",
    name: "Semilla Soja",
    unitMeasurement: "kg",
    stockByLot: false,
    type: "Semillas",
  } as any);

  await dbContext.deposits.post({
    _id: "dep-1",
    accountId: "acc-1",
    description: "Deposito 1",
    locations: [],
  } as any);

  await dbContext.stock.post({
    _id: "stock:1",
    accountId: "acc-1",
    id: "sup-1",
    tipo: "insumo",
    depositId: "dep-1",
    location: "",
    nroLot: "L1",
    campaignId: "camp-1",
    fieldId: "field-1",
    fieldLot: "lot-1",
    currentStock: 100,
    reservedStock: 0,
    lastUpdate: "2026-04-14T00:00:00.000Z",
  } as any);
};

describe("usePlanActividad - annual sowing reservations", () => {
  beforeEach(async () => {
    dbNamePrefix = `annual-plan-${Date.now()}-${Math.round(Math.random() * 100000)}`;
    initInMemoryDbs();
    await seedDatabases();
  });

  afterEach(async () => {
    for (const db of databases) {
      try {
        await db.destroy();
      } catch {
        // noop
      }
    }
    databases = [];
    vi.clearAllMocks();
  });

  it("reserves stock when saving an annual sowing activity", async () => {
    const { result } = renderHook(() => usePlanActividad(), { wrapper });

    await act(async () => {
      await result.current.saveActividad(createPlanActivity(), [createPlanSupplyLine(10)], []);
    });

    await waitFor(async () => {
      const stock = await dbContext.stock.get("stock:1");
      expect(stock.reservedStock).toBe(10);
      expect(stock.currentStock).toBe(100);
    });

    const savedLine = await dbContext.fields.get("planlinsumo:1");
    expect(savedLine.ordenRetiro?.order).toBeTruthy();

    const savedActivity = await dbContext.fields.get("planactividad:1");
    expect(savedActivity.insumosLineasIds).toEqual(["planlinsumo:1"]);

    const cycle = await dbContext.fields.get("ciclo:1");
    expect(cycle.actividadesIds).toContain("planactividad:1");
  });

  it("updates the reservation when the annual sowing quantity changes", async () => {
    const { result } = renderHook(() => usePlanActividad(), { wrapper });
    const activity = createPlanActivity();

    await act(async () => {
      await result.current.saveActividad(activity, [createPlanSupplyLine(10)], []);
    });

    await act(async () => {
      await result.current.saveActividad(activity, [createPlanSupplyLine(6)], []);
    });

    await waitFor(async () => {
      const stock = await dbContext.stock.get("stock:1");
      expect(stock.reservedStock).toBe(6);
    });

    const savedLine = await dbContext.fields.get("planlinsumo:1");
    expect(savedLine.totalCantidad).toBe(6);
    expect(savedLine.ordenRetiro?.order).toBeTruthy();

    const orders = await dbContext.withdrawalOrders.allDocs({ include_docs: true });
    expect(orders.rows.filter((row) => row.doc).length).toBe(1);
  });

  it("releases reserved stock when deleting an annual sowing activity", async () => {
    const { result } = renderHook(() => usePlanActividad(), { wrapper });

    await act(async () => {
      await result.current.saveActividad(createPlanActivity(), [createPlanSupplyLine(10)], []);
    });

    await act(async () => {
      await result.current.removeActividad("planactividad:1");
    });

    await waitFor(async () => {
      const stock = await dbContext.stock.get("stock:1");
      expect(stock.reservedStock).toBe(0);
    });

    const orders = await dbContext.withdrawalOrders.allDocs({ include_docs: true });
    expect(orders.rows.filter((row) => row.doc).length).toBe(0);

    const lineDocs = await dbContext.fields.allDocs({
      include_docs: true,
      keys: ["planlinsumo:1", "planactividad:1"],
    });
    expect(lineDocs.rows.every((row) => !row.doc)).toBe(true);
  });

  it("reserves stock when plan lot number is string and stock lot number is stored as numeric-like value", async () => {
    const stock = await dbContext.stock.get("stock:1");
    await dbContext.stock.put({
      ...stock,
      nroLot: 123 as any,
    });

    const { result } = renderHook(() => usePlanActividad(), { wrapper });

    await act(async () => {
      await result.current.saveActividad(
        createPlanActivity(),
        [createPlanSupplyLineWithLot(10, "123")],
        [],
      );
    });

    await waitFor(async () => {
      const updatedStock = await dbContext.stock.get("stock:1");
      expect(updatedStock.reservedStock).toBe(10);
    });
  });

  it("repairs an existing broken reservation when the activity is saved again", async () => {
    await dbContext.withdrawalOrders.post({
      _id: "wo-broken",
      accountId: "acc-1",
      type: "Automatica",
      creationDate: "2026-04-14T00:00:00.000Z",
      order: 99,
      reason: "Reserva de stock",
      campaignId: "camp-1",
      field: "field-1",
      state: "Pendiente",
      withdrawId: "contr-1",
    } as any);

    await dbContext.depositSupplyOrder.post({
      _id: "dso-broken",
      accountId: "acc-1",
      order: 99,
      depositId: "dep-1",
      supplyId: "sup-1",
      location: "",
      nroLot: "L1",
      withdrawalAmount: 0,
      originalAmount: 10,
    } as any);

    await dbContext.fields.post({
      ...createPlanSupplyLine(10),
      ordenRetiro: {
        _id: "wo-broken",
        order: 99,
        campaignId: "camp-1",
      },
    } as any);

    await dbContext.fields.post(createPlanActivity());

    const { result } = renderHook(() => usePlanActividad(), { wrapper });

    await act(async () => {
      await result.current.saveActividad(createPlanActivity(), [createPlanSupplyLine(10)], []);
    });

    await waitFor(async () => {
      const updatedStock = await dbContext.stock.get("stock:1");
      expect(updatedStock.reservedStock).toBe(10);
    });

    await expect(dbContext.withdrawalOrders.get("wo-broken")).rejects.toMatchObject({
      name: "not_found",
    });
  });
});
