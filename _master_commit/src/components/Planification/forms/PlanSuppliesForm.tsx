import React, { useEffect, useState } from "react";
import {
  FormControl,
  Grid,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { useSupply, useCrops } from "../../../hooks";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import uuid4 from "uuid4";
import { NumberFieldWithUnits } from "../../LotsMenu/components/NumberField";
import { AutocompleteSupplies } from "../../LotsMenu/components/AutocompleteSupplies";

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
});

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7",
});

const SupplyItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderLeft: "4px solid #3b82f6",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f8fafc",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
}));

interface PlanSuppliesFormProps {
  formData: any;
  setFormData: (data: any) => void;
  cultivoId?: string;
}

function PlanSuppliesForm({
  formData,
  setFormData,
  cultivoId: cultivoIdProp,
}: PlanSuppliesFormProps) {
  const { t } = useTranslation();
  const { getSupplies, isLoading } = useSupply();
  const { getCrops, crops } = useCrops();

  const [selectedSupply, setSelectedSupply] = useState<any>(null);
  const [dosificacion, setDosificacion] = useState("");
  const [total, setTotal] = useState("");
  const [formKey, setFormKey] = useState(0);

  // Función para normalizar IDs y compararlos de forma flexible
  const normalizeId = (id?: string) => {
    if (!id) return "";
    const parts = String(id).split(":");
    return parts[parts.length - 1].trim().toLowerCase();
  };

  // Get cultivoId from formData or prop
  const getCultivoId = () => {
    if (cultivoIdProp) return cultivoIdProp;
    const cultivo = formData?.detalles?.cultivo || (formData as any)?.cultivo;
    return cultivo?._id || cultivo?.id || null;
  };

  // Get cultivo object from formData
  const getCultivoObject = () => {
    return formData?.detalles?.cultivo || (formData as any)?.cultivo || null;
  };

  // Función mejorada para verificar compatibilidad
  const isSupplyCompatibleWithCrop = (supply: any): boolean => {
    if (!supply?.cropId) return true;

    const cultivoId = getCultivoId();
    const cultivo = getCultivoObject();
    if (!cultivoId) return true;

    // Comparación 1: IDs normalizados
    const normalizedSupplyCropId = normalizeId(supply.cropId);
    const normalizedCultivoId = normalizeId(cultivoId);

    if (normalizedSupplyCropId === normalizedCultivoId) {
      return true;
    }

    // Comparación 2: Buscar por nombre del cultivo
    const supplyCrop = crops.find((c: any) =>
      normalizeId(c._id) === normalizedSupplyCropId ||
      c._id === supply.cropId
    );

    if (supplyCrop && cultivo) {
      const supplyCropName = (supplyCrop.descriptionES || supplyCrop.descriptionEN || "").toLowerCase().trim();
      const activityCropName = (cultivo.descriptionES || cultivo.descriptionEN || (cultivo as any).name || "").toLowerCase().trim();

      if (supplyCropName && activityCropName && supplyCropName === activityCropName) {
        return true;
      }
    }

    console.log("🔍 PlanSuppliesForm - Comparación de compatibilidad fallida:", {
      supplyCropId: supply.cropId,
      cultivoId,
      normalizedSupplyCropId,
      normalizedCultivoId,
    });

    return false;
  };

  // Get hectares from formData
  const getHectareas = () => {
    return formData?.detalles?.hectareas || formData?.area || 0;
  };

  // Validate supply compatibility with crop
  const validateSupplyCompatibility = (supply: any): boolean => {
    if (!supply || !supply.cropId) {
      return true;
    }

    const cultivoId = getCultivoId();

    // Si no hay cultivo definido pero el insumo requiere uno
    if (!cultivoId && supply.cropId) {
      Swal.fire({
        icon: "warning",
        title: t("incompatibleSupply"),
        text: t("supplyNotCompatibleWithCrop") + " (" + t("noCropDefinedInCycle") + ")",
        customClass: {
          container: "swal-above-mui-dialog",
        },
      });
      return false;
    }

    // Usar la función de compatibilidad mejorada
    if (!isSupplyCompatibleWithCrop(supply)) {
      Swal.fire({
        icon: "error",
        title: t("incompatibleSupply"),
        text: t("supplyNotCompatibleWithCrop"),
        customClass: {
          container: "swal-above-mui-dialog",
        },
      });
      return false;
    }

    return true;
  };

  const handleSelectChange = (supply: any) => {
    if (supply && !validateSupplyCompatibility(supply)) {
      setSelectedSupply(null);
      return;
    }
    setSelectedSupply(supply);
  };

  const handleDosificacionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDosificacion(value);

    const numValue = parseFloat(value);
    const hectareas = getHectareas();
    if (value !== "" && !isNaN(numValue) && hectareas && !value.endsWith(".") && !value.endsWith(",")) {
      const calculatedTotal = (numValue * hectareas).toFixed(2);
      setTotal(calculatedTotal);
    } else if (value === "") {
      setTotal("");
    }
  };

  const handleTotalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTotal(value);

    const numValue = parseFloat(value);
    const hectareas = getHectareas();
    if (value !== "" && !isNaN(numValue) && hectareas && !value.endsWith(".") && !value.endsWith(",")) {
      setDosificacion((numValue / hectareas).toFixed(2));
    } else if (value === "") {
      setDosificacion("");
    }
  };

  const handleAddRow = () => {
    if (!selectedSupply) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("selectSupplyPlease"),
      });
      return;
    }

    if (!validateSupplyCompatibility(selectedSupply)) {
      return;
    }

    const newRow = {
      insumo: selectedSupply,
      dosificacion: dosificacion,
      dosis: dosificacion,
      total: total,
      uuid: uuid4(),
    };

    const currentDosis = formData?.detalles?.dosis || [];
    const newDosis = [...currentDosis, newRow];

    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        dosis: newDosis,
      },
    });

    // Clear form
    setSelectedSupply(null);
    setDosificacion("");
    setTotal("");
    setFormKey((prev) => prev + 1);
  };

  const handleDeleteRow = (uuid: string) => {
    const currentDosis = formData?.detalles?.dosis || [];
    const newDosis = currentDosis.filter((row: any) => row.uuid !== uuid);

    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        dosis: newDosis,
      },
    });
  };

  useEffect(() => {
    getSupplies();
    getCrops();
  }, []);

  if (isLoading) return <div>{t("loading")}</div>;

  const rows = formData?.detalles?.dosis || [];

  return (
    <CustomPaper elevation={3}>
      <Title>{t("supplies")}</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Row 1: Supply selector and description */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={6}>
              <AutocompleteSupplies
                key={`supply-${formKey}-${selectedSupply?._id || "empty"}`}
                value={selectedSupply}
                onChange={handleSelectChange}
                activityType={formData?.tipo}
              />
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ width: "100%", padding: "17px", minHeight: "56px" }}>
                {selectedSupply?.description && (
                  <Typography variant="body2" gutterBottom>
                    {selectedSupply?.description} {selectedSupply?.type}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Row 2: Quantity per hectare and total */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={5}>
              <NumberFieldWithUnits
                fullWidth
                label={t("quantity") + " x " + t("hectares")}
                value={dosificacion}
                onChange={handleDosificacionChange}
                unit={selectedSupply?.unitMeasurement || "unit"}
                allowNegative={false}
                allowDecimals={true}
              />
            </Grid>
            <Grid item xs={5}>
              <NumberFieldWithUnits
                fullWidth
                label={t("totalQuantity")}
                value={total}
                onChange={handleTotalChange}
                unit={selectedSupply?.unitMeasurement || "unit"}
                allowNegative={false}
                allowDecimals={true}
              />
            </Grid>
            <Grid item xs={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconButton
                onClick={handleAddRow}
                color="primary"
                aria-label={t("add")}
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </FormControl>

      {/* Supplies list */}
      {rows.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {t("addedSupplies")} ({rows.length})
          </Typography>
          {rows.map((row: any, index: number) => (
            <SupplyItem key={row.uuid || index} elevation={1}>
              <div style={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {row.insumo?.name || t("unknownSupply")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.dosificacion} {row.insumo?.unitMeasurement || "unit"}/ha •{" "}
                  {t("total")}: {row.total} {row.insumo?.unitMeasurement || "unit"}
                </Typography>
              </div>
              <IconButton
                onClick={() => handleDeleteRow(row.uuid)}
                color="error"
                size="small"
                aria-label={t("delete")}
              >
                <DeleteIcon />
              </IconButton>
            </SupplyItem>
          ))}
        </div>
      )}

      {rows.length === 0 && (
        <Paper
          sx={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            marginTop: "20px",
            border: "2px dashed #e2e8f0",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t("noSuppliesAdded")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("selectSupplyAndClickAdd")}
          </Typography>
        </Paper>
      )}
    </CustomPaper>
  );
}

export default PlanSuppliesForm;
