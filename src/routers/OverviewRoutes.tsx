import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  ListVehiclesPage,
  VehiclePage,
  ListBusinessesPage,
  BusinessPage,
  ListDepositsPage,
  DepositPage,
} from "../pages";
import { AppLayout } from "../components";

export const OverviewRoutes: React.FC = () => {
  return (
    <AppLayout key="app-layout">
      <Routes>
        <Route path="/overview/vehiculo" element={<ListVehiclesPage />} />
        <Route path="/overview/vehiculo/nuevo" element={<VehiclePage />} />
        <Route path="/overview/vehiculo/:vehiculo" element={<VehiclePage />} />

        <Route path="/overview/business" element={<ListBusinessesPage />} />
        <Route path="/overview/business/new" element={<BusinessPage />} />
        <Route path="/overview/business/:id" element={<BusinessPage />} />

        <Route path="/overview/deposit" element={<ListDepositsPage />} />
        <Route path="/overview/deposit/new" element={<DepositPage />} />
        <Route path="/overview/deposit/:id" element={<DepositPage />} />

        <Route path="/*" element={<Navigate to="/init/overview/vehiculo" />} />
      </Routes>
    </AppLayout>
  );
};
