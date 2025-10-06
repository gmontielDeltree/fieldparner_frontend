import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, useDeposit } from "../../hooks";
import { Deposit, EnumStatusContract } from "../../types";
import { removeDepositActive } from "../../redux/deposit";
import { useTranslation } from "react-i18next";
import { TemplateLayout } from "../../components";
import { Paper, Box, Typography } from "@mui/material";
import { Warehouse as WarehouseIcon } from "@mui/icons-material";
import { getBoundaries } from "../../utils/geolocation";

import {
  BasicInfoSection,
  TypeStatusSection,
  AddressSection,
  GeolocationSection,
  LocationsSection,
  ActionButtons,
} from "./componentes";
import Swal from "sweetalert2";

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { depositActive } = useAppSelector((state) => state.deposit);

  const { createDeposit, updateDeposit } = useDeposit();

  const initialForm: Deposit = {
    description: "",
    zipCode: "",
    address: "",
    geolocation: { lng: -35, lat: -34 },
    locality: "",
    country: "",
    owner: "",
    province: "",
    accountId: "",
    locations: [t("_general")],
    isNegative: false,
    isVirtual: false,
    siloBag: false,
    hopper: false,
    silo: false,
    deposit: false,
    siloBagId: "",
    status: EnumStatusContract.Inactivo,
  };

  const [formulario, setFormulario] = useState<Deposit>(initialForm);

  useEffect(() => {
    if (depositActive) setFormulario(depositActive);
    else setFormulario(initialForm);

    return () => {
      dispatch(removeDepositActive());
    };
  }, [depositActive, dispatch]);

  const validateForm = () => {
    let isValid = true;

    if (formulario.description.trim() === "") {
      Swal.fire({ title: t("validation_error"), text: t("missing_description"), icon: "error" });
      isValid = false;
    }
    if (formulario.zipCode.trim() === "") {
      Swal.fire({ title: t("validation_error"), text: t("missing_zip_code"), icon: "error" });
      isValid = false;
    }
    if (formulario.country.trim() === "") {
      Swal.fire({ title: t("validation_error"), text: t("missing_country"), icon: "error" });
      isValid = false;
    }

    // Validación de geolocalización
    const boundaries = getBoundaries(formulario.country);
    if (formulario.geolocation.lat < boundaries.minLat || formulario.geolocation.lat > boundaries.maxLat) {
      Swal.fire({ title: t("validation_error"), text: t("latitude_out_of_bounds"), icon: "error" });
      isValid = false;
    }
    if (formulario.geolocation.lng < boundaries.minLng || formulario.geolocation.lng > boundaries.maxLng) {
      Swal.fire({ title: t("validation_error"), text: t("longitude_out_of_bounds"), icon: "error" });
      isValid = false;
    }

    return isValid;
  };

  const handleUpdateDeposit = async () => {
    if (validateForm()) {
      try {
        if (formulario._id) {
          await updateDeposit(formulario);
        } else {
          await createDeposit(formulario);
        }

        dispatch(removeDepositActive());
        setFormulario(initialForm);
        navigate("/init/overview/deposit");

        Swal.fire({
          title: t("success"),
          text: formulario._id
            ? t("deposit_updated_successfully")
            : t("deposit_created_successfully"),
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar/crear el depósito:", error);
        Swal.fire({
          title: t("error"),
          text: t("operation_failed"),
          icon: "error",
        });
      }
    }
  };

  const handleAddDeposit = async () => {
    if (validateForm()) {
      try {
        await createDeposit(formulario);
        setFormulario(initialForm);
        navigate("/init/overview/deposit");

        Swal.fire({
          title: t("success"),
          text: t("deposit_created_successfully"),
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al crear el depósito:", error);
        Swal.fire({
          title: t("error"),
          text: t("deposit_creation_failed"),
          icon: "error",
        });
      }
    }
  };

  const handleLocationChange = (newLocation) => {
    setFormulario(prev => ({
      ...prev,
      geolocation: newLocation
    }));
  };

  return (
    <TemplateLayout
      key="overview-deposit"
      viewMap={true}
      initialLocation={formulario.geolocation}
      onLocationChange={handleLocationChange}
      formWidth={60} /* Proporción del ancho para el formulario (60%) */
    >
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
        <Box textAlign="center" mb={3}>

        </Box>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          {depositActive
            ? `${t("icon_edit")} ${t("new_masculine")} ${t("_warehouse")}`
            : `${t("_add")} ${t("new_masculine")} ${t("_warehouse")}`}
        </Typography>

        <BasicInfoSection formulario={formulario} setFormulario={setFormulario} />
        <TypeStatusSection formulario={formulario} setFormulario={setFormulario} />
        <AddressSection formulario={formulario} setFormulario={setFormulario} />
        <GeolocationSection formulario={formulario} setFormulario={setFormulario} />
        <LocationsSection formulario={formulario} setFormulario={setFormulario} />

        <ActionButtons
          formulario={formulario}
          onCancel={() => navigate("/init/overview/deposit")}
          onSubmit={depositActive ? handleUpdateDeposit : handleAddDeposit}
          isEditMode={!!depositActive}
        />
      </Paper>
    </TemplateLayout>
  );
};