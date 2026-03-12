import React, { useEffect, useMemo } from "react";
import { TipoEntidad } from "../../../types";
import { Grid, TextField, Autocomplete } from "@mui/material";
import { FormSection } from "../../../components";
import { useTranslation } from "react-i18next";
import { useBusiness } from "../../../hooks";
import { BasicInfoSectionProps} from "./types";


export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formulario,
  setFormulario,
}) => {
  const { t } = useTranslation();
  const { businesses, isLoading: loadingBusiness, getBusinesses } = useBusiness();


  const optionsPropietario = useMemo(() => {
    return businesses
      .filter((business) => business.tipoEntidad === TipoEntidad.JURIDICA)
      .map((business) => business.razonSocial || "");
  }, [businesses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };
  
  useEffect(() => {
    getBusinesses();

  }, []);

  return (
    <FormSection title={t("basic_information")}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_description")}
            name="description"
            value={formulario.description}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="owner"
            freeSolo
            loading={loadingBusiness}
            value={formulario.owner}
            onChange={(_event, newValue: string | null) =>
              newValue && setFormulario(prev => ({ ...prev, owner: newValue }))
            }
            inputValue={formulario.owner}
            onInputChange={(_event, newInputValue) =>
              setFormulario(prev => ({ ...prev, owner: newInputValue }))
            }
            options={optionsPropietario}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label={t("_owner")} name="owner" />
            )}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};