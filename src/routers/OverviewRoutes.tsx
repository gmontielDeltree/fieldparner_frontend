import React, { useMemo } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  ListVehiclesPage,
  VehiclePage,
  ListBusinessesPage,
  BusinessPage,
  ListDepositsPage,
  DepositPage,
  SupplyPage,
  FieldsPage,
  ListSuppliesPage,
  StockMovementPage,
  NewStockMovementPage,
  ListStockPage,
  TransformPage,
  ListExitFieldPage,
  NewExitFieldPage,
  ListOriginsDestinationsPage,
  NewOriginsDestinationsPage,
  ListUsersPage,
  SatellitePage,
  DevicePage,
  PricesPage,
  ZoningPage,
  IntegrationsPage,
  PlanificationPage,
  ListWithdrawalOrdersPage,
  WithdrawalOrdersPage,
  ConfirmWithdrawalOrderPage,
  ListTransformPage,
  ListZonesPage,
  NewZonePage,
  NewLaborsServicesPage,
  ListLaborsServicesPage,
  ListPurchaseOrder,
  PurchaseOrderPage,
  NewCoporateCompaniesPage,
  ListCorporateCompaniesPage,
} from "../pages";
import { AppLayout } from "../components";
import { JohnDeereIntegration } from "../components/Integrations/JohnDeereIntegration";
import { MagrisIntegration, MagrisReportIntegration } from "../components/Integrations/MagrisIntegration";
import { NewUserPage } from "../pages/NewUserPage";
import { ComponentTestBed } from '../pages/ComponentTestBed';
import { useAppSelector } from "../hooks";
import { PlanificationByLotPage } from "../pages/PlanificationByLotPage";
import NewFieldPage from "../pages/NewFieldPage";
import { FieldPage } from "../pages/FieldPage";
import { LotPage } from "../pages/LotPage";
import { NewLotPage } from "../pages/NewLotPage";
import EditFieldPage from "../pages/EditFieldPage";
import EditLotePage from "../pages/EditLotePage";

export const OverviewRoutes: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  const { pathname, search } = useLocation();

  const lastPath = useMemo(() => pathname + search, [pathname, search]);
  localStorage.setItem("lastPath", lastPath);

  return (
    <AppLayout key="app-layout">
      <Routes>
        <Route path="/overview/fields" element={<FieldsPage />}>
          <Route path="new-field" element={<NewFieldPage />} />
          <Route path="edit-field/:campoId" element={<EditFieldPage />} />
          <Route path="edit-lot/:campoId/:loteId" element={<EditLotePage />} />

          <Route path="planification" element={<PlanificationPage />} />

          <Route path="device/:deviceId/:date" element={<DevicePage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="john-deere" element={<JohnDeereIntegration />} />
          <Route path="magris/:id" element={<MagrisReportIntegration />} />
          <Route path="magris" element={<MagrisIntegration />} />
          <Route path=":campoId" element={<FieldPage />} >
          </Route>
          <Route path=":campoId/new-lot" element={<NewLotPage />} />
          <Route path=":campoId/:loteId" element={<LotPage />}>
            <Route
              path="planification-by-lot/:parentId/:loteId2"
              element={<PlanificationByLotPage />}
            />
          </Route>
        </Route>

        <Route path="/overview/vehicle" element={<ListVehiclesPage />} />
        <Route path="/overview/vehicle/new" element={<VehiclePage />} />
        <Route path="/overview/vehicle/:id" element={<VehiclePage />} />

        <Route path="/overview/business" element={<ListBusinessesPage />} />
        <Route path="/overview/business/new" element={<BusinessPage />} />
        <Route path="/overview/business/:id" element={<BusinessPage />} />

        <Route path="/overview/deposit" element={<ListDepositsPage />} />
        <Route path="/overview/deposit/new" element={<DepositPage />} />
        <Route path="/overview/deposit/:id" element={<DepositPage />} />

        <Route
          path="/overview/origins-destinations"
          element={<ListOriginsDestinationsPage />}
        />
        <Route
          path="/overview/origins-destinations/new"
          element={<NewOriginsDestinationsPage />}
        />
        <Route
          path="/overview/origins-destinations/:id"
          element={<NewOriginsDestinationsPage />}
        />

        <Route path="/overview/supply" element={<ListSuppliesPage />} />
        <Route path="/overview/supply/new" element={<SupplyPage />} />
        <Route path="/overview/supply/:id" element={<SupplyPage />} />

        <Route
          path="/overview/stock-movements"
          element={<StockMovementPage />}
        />
        <Route
          path="/overview/stock-movements/new"
          element={<NewStockMovementPage />}
        />
        <Route path="/overview/list-stock" element={<ListStockPage />} />
        <Route
          path="/overview/value-transform"
          element={<ListTransformPage />}
        />
        <Route
          path="/overview/value-transform/new"
          element={<TransformPage />}
        />

        <Route path="/overview/exit-field" element={<ListExitFieldPage />} />
        <Route path="/overview/exit-field/new" element={<NewExitFieldPage />} />

        <Route path="/overview/satellite/:loteId" element={<SatellitePage />} />
        <Route
          path="/overview/zoning/:baseImageName"
          element={<ZoningPage />}
        />
        <Route path="/overview/prices" element={<PricesPage />} />
        {
          (user && user.isAdmin) && (
            <>
              <Route path="/overview/users" element={<ListUsersPage />} />
              <Route path="/overview/users/new" element={<NewUserPage />} />
              <Route path="/overview/users/:id" element={<NewUserPage />} />
            </>
          )
        }

        <Route
          path="/overview/list-orders"
          element={<ListWithdrawalOrdersPage />}
        />
        <Route path="/overview/order" element={<WithdrawalOrdersPage />} />
        <Route
          path="/overview/order/:orderId"
          element={<ConfirmWithdrawalOrderPage />}
        />

        <Route
          path="/overview/component-test-bed"
          element={<ComponentTestBed />}
        />

        <Route path="/overview/zones" element={<ListZonesPage />} />
        <Route path="/overview/zones/new" element={<NewZonePage />} />
        <Route path="/overview/zones/:id" element={<NewZonePage />} />

        <Route path="/overview/Labors-services" element={<ListLaborsServicesPage />} />
        <Route path="/overview/Labors-services/new" element={<NewLaborsServicesPage />} />
        <Route path="/overview/Labors-services/:id" element={<NewLaborsServicesPage />} />

        <Route path="/overview/purchase-order" element={<ListPurchaseOrder />} />
        <Route path="/overview/purchase-order/:order" element={<PurchaseOrderPage />} />
        <Route path="/overview/purchase-order/new" element={<PurchaseOrderPage />} />

        <Route path="/overview/corporate-companies/new" element={< NewCoporateCompaniesPage />} />
        <Route path="/overview/corporate-companies" element={< ListCorporateCompaniesPage />} />
        <Route path="/overview/corporate-companies/:id" element={< NewCoporateCompaniesPage />} />

        <Route path="/*" element={<Navigate to="/init/overview/fields" />} />
      </Routes>
    </AppLayout>
  );
};
