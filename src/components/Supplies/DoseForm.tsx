import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  SelectChangeEvent,
  TextField
} from "@mui/material";
import { Supply } from "@types";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";


export interface DoseFormProps {
  formValues: Supply;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleFormValueChange: (key: string, value: string) => void;
  handleCheckboxChange: (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

export const DoseForm: React.FC<DoseFormProps> = ({
  formValues,
  handleInputChange,
  handleCheckboxChange
}) => {
  const {
    type,
    name,
    minimumDose,
    maximumDose,
    recommendedDose,
    activePrincipal,
    mermaVolatile,
    generico,
    formulationDenomination,
    toxicityClass
  } = formValues;

  const { t } = useTranslation();

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="start">
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_type")}
          name="type"
          value={type}
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
            style: {
              backgroundColor: "#f5f5f5",
              fontWeight: 600
            }
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_supply")}
          name="name"
          value={name}
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
            style: {
              backgroundColor: "#f5f5f5",
              fontWeight: 600
            }
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          variant="outlined"
          type="text"
          label={t("active_principle")}
          name="activePrincipal"
          onChange={handleInputChange}
          value={activePrincipal}
          InputProps={{
            startAdornment: <InputAdornment position="start" />
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("volatile_shrinkage")}
          name="mermaVolatile"
          value={mermaVolatile}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("min_dose")}
          name="minimumDose"
          value={minimumDose}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("max_dose")}
          name="maximumDose"
          value={maximumDose}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("recommended_dose")}
          name="recommendedDose"
          value={recommendedDose}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControlLabel
          key="supply-generic"
          control={
            <Checkbox
              name="generico"
              checked={generico}
              onChange={handleCheckboxChange}
            />
          }
          label={"Generico"}
          labelPlacement="start"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_formulationDenomination")}
          name="formulationDenomination"
          value={formulationDenomination}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_toxicityClass")}
          name="toxicityClass"
          value={toxicityClass}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />
          }}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};
