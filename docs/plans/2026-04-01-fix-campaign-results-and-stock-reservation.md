# Fix Campaign Results Display & Stock Reservation Flow

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix two client-reported bugs: (1) Campaign Results browse showing codes/IDs instead of descriptions with missing columns, and (2) Withdrawal orders not updating reserved stock.

**Architecture:** Bug 1 is a display-only fix in `CampaignsResultsPage.tsx` — we enrich data by loading fields/social entities and resolving IDs to names. Bug 2 requires wiring stock updates into the withdrawal order lifecycle across `useOrder.ts`, `activityService.tsx`, and `ExecuteActivity.tsx`.

**Tech Stack:** React, TypeScript, PouchDB, Vitest

---

## Bug 2: Stock Reservation Flow (Higher priority — data integrity)

### Task 1: Fix `withdrawalAmount` initialization in `activityService.tsx`

**Files:**
- Modify: `src/components/LotsMenu/components/activityService.tsx:90`

**Why:** When creating a `DepositSupplyOrder`, `withdrawalAmount` is set to `dosis.total` (same as `originalAmount`). This makes the order look "already fully withdrawn" from birth. The confirmation logic checks `originalAmount > withdrawalAmount` to determine completion — so the order is immediately "complete" with no actual withdrawal recorded.

**Step 1: Fix the initialization**

Change line 90 from:
```typescript
withdrawalAmount: dosis.total,
```
to:
```typescript
withdrawalAmount: 0,
```

The TODO at `useOrder.ts:173` confirms the developer was unsure about this. The correct semantic is: `originalAmount` = total to withdraw, `withdrawalAmount` = cumulative amount withdrawn so far (starts at 0).

**Step 2: Verify no other code depends on the old value**

Search for `withdrawalAmount` usage across the codebase. The only consumers are:
- `confirmWithdrawalOrder` and `confirmAutomaticWithdrawalOrder` in `useOrder.ts` — both ADD `amount` to `withdrawalAmount`, so starting at 0 is correct
- `ConfirmWithdrawalOrderPage.tsx` — calculates `saldo = originalAmount - withdrawalAmount`, which now correctly shows the full amount remaining

---

### Task 2: Add stock reservation to `createWithdrawalOrder` in `useOrder.ts`

**Files:**
- Modify: `src/hooks/useOrder.ts:176-180`

**Why:** `createWithdrawalOrder` writes to `dbContext.withdrawalOrders` and `dbContext.depositSupplyOrder` but never touches `dbContext.stock`. The stock query page reads `reservedStock` directly from `dbContext.stock` documents, so reservations are invisible.

**Step 1: Add stock update after order creation**

After the existing `Promise.all` at line 176, add stock reservation logic. Insert after line 180 (after `const response = await Promise.all([...]);`):

```typescript
// Update stock.reservedStock for each supply in the order
for (const item of inputsToBeWithdrawan) {
    try {
        const stockResult = await dbContext.stock.find({
            selector: {
                accountId: user.accountId,
                id: item.supplyId,
                depositId: item.depositId,
                nroLot: item.nroLot || '',
            }
        });
        if (stockResult.docs.length > 0) {
            const stockDoc = stockResult.docs[0];
            stockDoc.reservedStock = (stockDoc.reservedStock || 0) + Number(item.originalAmount || 0);
            stockDoc.lastUpdate = new Date().toISOString();
            await dbContext.stock.put(stockDoc);
        }
    } catch (stockError) {
        console.error('Error updating reserved stock:', stockError);
        // Non-blocking: order was created successfully, stock update is secondary
    }
}
```

**Key decisions:**
- Uses `item.originalAmount` (the total to reserve), NOT `item.withdrawalAmount` (which is now 0 per Task 1)
- Non-blocking: if stock update fails, the order still exists (better to have an order without reservation than to lose the order)
- Finds stock by `(accountId, supplyId, depositId, nroLot)` — same composite key used by `addStockMovementSupply` in `useStockMovement.ts:231-238`

---

### Task 3: Add stock deduction to `confirmAutomaticWithdrawalOrder` in `useOrder.ts`

**Files:**
- Modify: `src/hooks/useOrder.ts:438-445`

**Why:** When an automatic withdrawal order is confirmed (at execution time), the function only marks the order as `Completed` and records withdrawal history. It never deducts from `stock.reservedStock` or `stock.currentStock`.

**Step 1: Populate `amount` in `getOrderDetailByNumber`**

The root cause is that `getOrderDetailByNumber` (line 259-268) creates `DepositSupplyOrderItem` objects by spreading `DepositSupplyOrder` fields, but `amount` (from the `DepositSupplyOrderItem` interface) is never set. This means `Number(w.amount || 0)` in `confirmAutomaticWithdrawalOrder` always equals 0.

In `getOrderDetailByNumber`, change the mapping at lines 259-268:

```typescript
const suppliesOfTheOrder = depositAndSuppliesOrder.map(d => {
    const deposit = deposits.find(de => de._id === d.depositId);
    const supply = supplies.find(s => s._id === d.supplyId);
    if (!deposit || !supply) throw new Error("Deposit or Supply not found");
    return {
        ...d,
        deposit,
        supply,
        amount: Number(d.originalAmount || 0) - Number(d.withdrawalAmount || 0),
    } as DepositSupplyOrderItem;
});
```

This sets `amount` to the remaining amount to be withdrawn (originalAmount - withdrawalAmount).

**Step 2: Add stock updates in `confirmAutomaticWithdrawalOrder`**

After the existing `Promise.all` at line 438 and before marking the order as completed (line 444), add:

```typescript
// Update stock: decrement reservedStock and currentStock
for (const w of listWithdrawals) {
    try {
        const withdrawnAmount = Number(w.amount || 0);
        if (withdrawnAmount <= 0) continue;

        const stockResult = await dbContext.stock.find({
            selector: {
                accountId: user.accountId,
                id: w.supplyId,
                depositId: w.depositId,
                nroLot: w.nroLot || '',
            }
        });
        if (stockResult.docs.length > 0) {
            const stockDoc = stockResult.docs[0];
            stockDoc.reservedStock = Math.max(0, (stockDoc.reservedStock || 0) - withdrawnAmount);
            stockDoc.currentStock = (stockDoc.currentStock || 0) - withdrawnAmount;
            stockDoc.lastUpdate = new Date().toISOString();
            await dbContext.stock.put(stockDoc);
        }
    } catch (stockError) {
        console.error('Error updating stock on withdrawal confirmation:', stockError);
    }
}
```

**Key decisions:**
- `Math.max(0, ...)` on `reservedStock` prevents negative values from edge cases
- `currentStock` CAN go negative (matches `addStockMovementSupply` behavior in `useStockMovement.ts:282` which allows negative stock for certain deposits)
- Both fields updated atomically per supply item

---

### Task 4: Fix execution flow in `ExecuteActivity.tsx`

**Files:**
- Modify: `src/components/LotsMenu/ExecuteActivity.tsx:945-948`

**Why:** Line 947 has `removeReservedStock` commented out, and line 948 calls `initConfirmWithdrawal` without `await`. Since we added stock updates to `confirmAutomaticWithdrawalOrder` in Task 3, the `removeReservedStock` function is no longer needed (it was just a wrapper around `confirmAutomaticWithdrawalOrder`). But `initConfirmWithdrawal` MUST be awaited to ensure stock updates complete before proceeding.

**Step 1: Add `await` to `initConfirmWithdrawal`**

Change lines 945-948 from:
```typescript
if (dosis.orden_de_retiro) {
    console.log('Usando orden de retiro existente para:', supplyInfo.name);
    // await removeReservedStock(dosis);
    initConfirmWithdrawal(dosis.orden_de_retiro as WithdrawalOrder);
```
to:
```typescript
if (dosis.orden_de_retiro) {
    console.log('Usando orden de retiro existente para:', supplyInfo.name);
    await initConfirmWithdrawal(dosis.orden_de_retiro as WithdrawalOrder);
```

The `removeReservedStock` comment can stay as-is (dead code) or be removed. The function at line 616 is no longer needed since `confirmAutomaticWithdrawalOrder` now handles stock updates directly.

---

### Task 5: Implement `deleteWithdrawalOrder` in `useOrder.ts`

**Files:**
- Modify: `src/hooks/useOrder.ts:516`

**Why:** `deleteWithdrawalOrder` is an empty function body `() => { }`. If a user deletes an activity that has a withdrawal order, the reserved stock is never released.

**Step 1: Implement the function**

Replace line 516:
```typescript
const deleteWithdrawalOrder = async (withdrawalOrder: WithdrawalOrder) => {
    try {
        if (!user) throw new Error(t("user_not_found"));

        // Get deposit supply orders for this order
        const depositSupplyResult = await dbContext.depositSupplyOrder.find({
            selector: {
                accountId: user.accountId,
                order: withdrawalOrder.order,
            }
        });

        // Release reserved stock for each supply
        for (const dso of depositSupplyResult.docs) {
            const reservedAmount = Number(dso.originalAmount || 0) - Number(dso.withdrawalAmount || 0);
            if (reservedAmount <= 0) continue;

            try {
                const stockResult = await dbContext.stock.find({
                    selector: {
                        accountId: user.accountId,
                        id: dso.supplyId,
                        depositId: dso.depositId,
                        nroLot: dso.nroLot || '',
                    }
                });
                if (stockResult.docs.length > 0) {
                    const stockDoc = stockResult.docs[0];
                    stockDoc.reservedStock = Math.max(0, (stockDoc.reservedStock || 0) - reservedAmount);
                    stockDoc.lastUpdate = new Date().toISOString();
                    await dbContext.stock.put(stockDoc);
                }
            } catch (stockError) {
                console.error('Error releasing reserved stock:', stockError);
            }
        }

        // Delete deposit supply orders
        const docsToDelete = depositSupplyResult.docs.map(d => ({ ...d, _deleted: true }));
        if (docsToDelete.length > 0) {
            await dbContext.depositSupplyOrder.bulkDocs(docsToDelete);
        }

        // Delete the withdrawal order itself
        await dbContext.withdrawalOrders.remove(withdrawalOrder._id, withdrawalOrder._rev);

        NotificationService.showSuccess(
            t("withdrawal_order_deleted_successfully"),
            {},
            t("withdrawal_order_label")
        );
    } catch (error) {
        console.error('Error deleting withdrawal order:', error);
        NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
    }
}
```

**Step 2: Update return type signature**

The function signature changes from `() => void` to accepting a `WithdrawalOrder` parameter. This is safe because the only current caller passes no args to an empty function. Any future callers will now pass the order.

---

### Task 6: Verify with existing test

**Step 1: Run the existing full-flow test**

```bash
cd fieldpartner_frontend && RUN_HEAVY_TESTS=1 npx vitest run src/components/LotsMenu/__tests__/PlanActivity.fullflow.test.tsx
```

The test at line 209 expects `reservedStock` to be 10 after creating a withdrawal order, and at line 230 expects `reservedStock` to be 0 and `currentStock` to be 90 after confirmation. These assertions should now pass with our changes.

---

## Bug 1: Campaign Results Display

### Task 7: Fix contracts section in `CampaignsResultsPage.tsx`

**Files:**
- Modify: `src/pages/Campaigns/CampaignsResultsPage.tsx:275,279`

**Why:** Contracts use `company?.name` and `crop?.name` while other pages use `socialReason` and `descriptionES`. The `useContractSaleCereals` hook already enriches contracts with full objects — we just need to access the right fields.

**Step 1: Fix field access**

Change line 275:
```typescript
sociedad: contract.company?.socialReason || contract.company?.name || '',
```

Change line 279:
```typescript
cultivo: contract.crop?.descriptionES || contract.crop?.name || '',
```

Fallbacks to `.name` ensure backward compatibility if some records lack the preferred field.

---

### Task 8: Fix executions section — load fields and resolve lot names

**Files:**
- Modify: `src/pages/Campaigns/CampaignsResultsPage.tsx:163-168, 326-404`

**Why:** Executions show `lote_uuid` (raw UUID) instead of lot name, `execution.campo` doesn't exist on the `Ejecucion` interface, and `sociedad`/`contrato` are hardcoded empty. The `useExecutions` hook returns raw PouchDB data without enrichment. Rather than modifying the hook (which is used elsewhere), we load fields in the page and resolve names locally.

**Step 1: Import dbContext and add fields state**

Add import at top of file:
```typescript
import { dbContext } from '../../services';
```

Add state inside the component (after the existing `useState` declarations around line 176):
```typescript
const [fields, setFields] = useState<any[]>([]);
```

**Step 2: Load fields in the existing `useEffect`**

In the `loadData` function (line 216-231), add field loading to the `Promise.all`:

```typescript
await Promise.all([
    getCampaigns(),
    getContractsSaleCereals(),
    getCampaingExpenses(),
    getExecutions(),
    dbContext.fields.allDocs({ include_docs: true }).then(result => {
        setFields(result.rows.map(row => row.doc).filter(Boolean));
    }),
]);
```

**Step 3: Create a lot/field resolution helper**

Add before the `useEffect` blocks (after the state declarations):

```typescript
const resolveLotInfo = (loteUuid: string) => {
    for (const field of fields) {
        if (!field?.features) continue;
        const lot = field.features.find(
            (f: any) => f.properties?.uuid === loteUuid || f.id === loteUuid
        );
        if (lot) {
            return {
                lotName: lot.properties?.nombre || lot.properties?.name || loteUuid,
                fieldName: field.properties?.nombre || field.properties?.name || field.name || '',
            };
        }
    }
    return { lotName: loteUuid, fieldName: '' };
};
```

**Step 4: Fix the executions mapping**

Replace lines 378-404 (the return object inside `filteredExecutions.map`):

```typescript
return {
    id: execution._id,
    campaña: selectedCampaign.name || '',
    sociedad: '',
    contrato: '',
    campo: resolveLotInfo(execution.lote_uuid || '').fieldName,
    lote: resolveLotInfo(execution.lote_uuid || '').lotName,
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
```

Changes:
- `campo`: resolves from `lote_uuid` → parent field name via `resolveLotInfo`
- `lote`: resolves from UUID to lot name via `resolveLotInfo`
- `labor`: uses `costo_labor[0].labor.descriptionES` instead of raw `execution.tipo`

**Note on `sociedad`:** Left empty because there's no direct execution→company relationship. The field GeoJSON doesn't carry a company reference. This would require a schema change.

---

### Task 9: Fix executions campaign filter

**Files:**
- Modify: `src/pages/Campaigns/CampaignsResultsPage.tsx:329-353`

**Why:** The filter is disabled (shows ALL executions with any campaign). The commented-out filter has the correct logic.

**Step 1: Replace the temporary filter**

Replace lines 329-353:
```typescript
const filteredExecutions = executions.filter(execution => {
    if (!execution || !execution.campaña) return false;
    const campaignObj = execution.campaña;
    return (
        campaignObj.campaignId === selectedCampaign.campaignId ||
        campaignObj._id === campaign ||
        campaignObj.name === selectedCampaign.name
    );
});
```

This uses the simplified version of the commented-out filter, removing the redundant comparisons.

---

### Task 10: Fix expenses section — resolve company names

**Files:**
- Modify: `src/pages/Campaigns/CampaignsResultsPage.tsx:303-320`

**Why:** Expenses have `sociedad: ''` hardcoded, and `item.company` is a string in the `ListCampingExpeses` interface (likely a company name or ID). The expense itself has `field` and `lot` as strings which may already be names (stored at creation time).

**Step 1: Use the company string from expense items**

Change the expense mapping (lines 303-320):
```typescript
return expense.listCamapingExpeses.map((item: ListCampingExpeses) => ({
    id: expense._id + '-' + item.id,
    campaña: selectedCampaign.name || '',
    sociedad: item.company || '',
    contrato: '',
    campo: expense.field || '',
    lote: expense.lot || '',
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
```

The only change is `sociedad: item.company || ''` — using the `company` field from `ListCampingExpeses` which stores the company name/identifier at expense creation time.

---

### Task 11: Remove sample data

**Files:**
- Modify: `src/pages/Campaigns/CampaignsResultsPage.tsx:407-460`

**Why:** Lines 407-460 contain hardcoded sample data for demo purposes. With real data now displaying correctly, this dead code should be removed.

**Step 1: Delete the sample data block**

Remove lines 407-460 (the entire `sampleData` constant and the three sample objects). The `allData` at line 463 already correctly combines real data without the samples.

---

### Task 12: Add `fields` to the `useEffect` dependency for data refresh

**Files:**
- Modify: `src/pages/Campaigns/CampaignsResultsPage.tsx:484`

**Why:** The `fetchReportData` effect depends on `fields` for lot name resolution. Adding it to the dependency array ensures data re-renders when fields finish loading.

**Step 1: Add `fields` to the dependency array**

Change line 484:
```typescript
}, [campaign, campaigns, contractsSaleCerealsFull, campaingExpenses, executions, fields]);
```

---

## Commit Strategy

1. **Commit after Tasks 1-6:** `fix: wire stock reservation into withdrawal order lifecycle`
2. **Commit after Tasks 7-12:** `fix: resolve IDs to descriptions in campaign results browse`
