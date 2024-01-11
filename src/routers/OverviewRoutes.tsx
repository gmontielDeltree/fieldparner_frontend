import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
} from "../pages";
import { AppLayout } from "../components";

export const OverviewRoutes: React.FC = () => {
  return (
    <AppLayout key="app-layout">
      <Routes>
        <Route path="/overview/fields" element={<FieldsPage />} />
        <Route path="/overview/vehicle" element={<ListVehiclesPage />} />
        <Route path="/overview/vehicle/new" element={<VehiclePage />} />
        <Route path="/overview/vehicle/:id" element={<VehiclePage />} />

        <Route path="/overview/business" element={<ListBusinessesPage />} />
        <Route path="/overview/business/new" element={<BusinessPage />} />
        <Route path="/overview/business/:id" element={<BusinessPage />} />

        <Route path="/overview/deposit" element={<ListDepositsPage />} />
        <Route path="/overview/deposit/new" element={<DepositPage />} />
        <Route path="/overview/deposit/:id" element={<DepositPage />} />

        <Route path="/overview/origins-destinations" element={<ListOriginsDestinationsPage />} />
        <Route path="/overview/origins-destinations/new" element={<NewOriginsDestinationsPage />} />
        <Route path="/overview/origins-destinations/:id" element={<NewOriginsDestinationsPage />} />

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
        <Route path="/overview/transform" element={<TransformPage />} />

        <Route path="/overview/exit-field" element={<ListExitFieldPage />} />
        <Route path="/overview/exit-field/new" element={<NewExitFieldPage />} />

        <Route path="/*" element={<Navigate to="/init/overview/fields" />} />
      </Routes>
    </AppLayout>
  );
};
