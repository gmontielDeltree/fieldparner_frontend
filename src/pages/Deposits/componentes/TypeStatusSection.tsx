import React from "react";
import { EnumStatusContract } from "../../../types";
import {
  Grid,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  FormControl,
  Autocomplete,
  TextField,
} from "@mui/material";
import { FormSection } from "../../../components";
import { useTranslation } from "react-i18next";
import {TypeStatusSectionProps} from "./types";



export const TypeStatusSection: React.FC<TypeStatusSectionProps> = ({
  formulario,
  setFormulario,
}) => {
  const { t } = useTranslation();

  const statusOptions = Object.values(EnumStatusContract).map((x) => {
    switch (x) {
      case EnumStatusContract.Activo:
        return t("status_active");
      case EnumStatusContract.Inactivo:
        return t("status_inactive");
      default:
        return x as string;
    }
  });

  const getStatusEnumFromTranslation = (translatedStatus: string): EnumStatusContract => {
    if (translatedStatus === t("status_active")) return EnumStatusContract.Activo;
    if (translatedStatus === t("status_inactive")) return EnumStatusContract.Inactivo;
    return EnumStatusContract.Inactivo;
  };

  const onChangeStatus = (_event: React.SyntheticEvent, value: string | null) => {
    if (value !== null) {
      const statusEnum = getStatusEnumFromTranslation(value);
      setFormulario((prev) => ({ ...prev, status: statusEnum }));
    }
  };

  const handleChangeIsNegative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setFormulario((prev) => ({
      ...prev,
      isNegative: name.toLowerCase() === "yes",
    }));
  };

  return (
    <FormSection title={t("type_and_status")}>
      <Grid container spacing={2} alignItems="center">
        {/* Virtual/Physical Checkboxes */}
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={!formulario.isVirtual}
                  onChange={() =>
                    setFormulario((prev) => ({ ...prev, isVirtual: false }))
                  }
                />
              }
              label={t("physical_masculine")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formulario.isVirtual}
                  onChange={() =>
                    setFormulario((prev) => ({ ...prev, isVirtual: true }))
                  }
                />
              }
              label={t("_virtual")}
            />
          </Box>
        </Grid>

        {/* Status Dropdown */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Autocomplete
              value={formulario.status}
              onChange={onChangeStatus}
              options={statusOptions}
              renderInput={(params) => <TextField {...params} label={t("status")} />}
            />
          </FormControl>
        </Grid>

        {/* Storage Type Checkboxes */}
        <Grid item xs={4}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={formulario.deposit}
                  onChange={() =>
                    setFormulario((prev) => ({
                      ...prev,
                      deposit: true,
                      siloBag: false,
                      silo: false,
                      hopper: false,
                    }))
                  }
                />
              }
              label={t("_warehouse")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formulario.siloBag}
                  onChange={() =>
                    setFormulario((prev) => ({
                      ...prev,
                      deposit: false,
                      siloBag: true,
                      silo: false,
                      hopper: false,
                    }))
                  }
                />
              }
              label={t("_silobag")}
            />
            {formulario.siloBag && (
              <TextField
                sx={{ width: "72%" }}
                variant="outlined"
                size="small"
                label="ID Silobolsa"
                name="siloBagId"
                value={formulario.siloBagId}
                onChange={(e) =>
                  setFormulario((prev) => ({ ...prev, siloBagId: e.target.value }))
                }
              />
            )}
          </Box>
        </Grid>

        {/* Negative Stock Checkboxes */}
        <Grid item xs={4}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography sx={{ mr: 2 }}>{t("admits_negative_stock")}</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formulario.isNegative}
                  onChange={handleChangeIsNegative}
                  name="yes"
                />
              }
              label={t("_yes")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!formulario.isNegative}
                  onChange={handleChangeIsNegative}
                  name="not"
                />
              }
              label={t("_no")}
            />
          </Box>
        </Grid>

        {/* Silo/Hopper Checkboxes */}
        <Grid item xs={4}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={formulario.silo}
                  onChange={() =>
                    setFormulario((prev) => ({
                      ...prev,
                      deposit: false,
                      silo: true,
                      hopper: false,
                    }))
                  }
                />
              }
              label="Silo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formulario.hopper}
                  onChange={() =>
                    setFormulario((prev) => ({
                      ...prev,
                      deposit: false,
                      siloBag: false,
                      silo: false,
                      hopper: true,
                    }))
                  }
                />
              }
              label={t("_hopper")}
            />
          </Box>
        </Grid>
      </Grid>
    </FormSection>
  );
};