import { FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { Crops, Supply } from "@types";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { IsSeed } from "../../utils/helper";


//TODO: validar que descripcion de cultivo mostramos de acuerdo a la traduccion.
export interface DoseFormProps {
  formValues: Supply;
  crops: Crops[];
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleGenercoChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const DoseForm: React.FC<DoseFormProps> = ({
  formValues,
  crops,
  handleSelectChange,
  handleInputChange,
  handleGenercoChange,
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

  const isSeedType = React.useMemo(() => IsSeed(type), [type]);

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
              backgroundColor: '#f5f5f5',
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
              backgroundColor: '#f5f5f5',
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
            startAdornment: <InputAdornment position="start" />,
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
            startAdornment: <InputAdornment position="start" />,
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
            startAdornment: <InputAdornment position="start" />,
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
            startAdornment: <InputAdornment position="start" />,
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
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      {
        isSeedType && (
          <Grid item xs={12} sm={4}>
            <FormControl key="crop-select" fullWidth>
              <InputLabel id="crop">{t("_crop")}</InputLabel>
              <Select
                labelId="crop"
                name="cropId"
                value={formValues.cropId}
                label={t("_crop")}
                onChange={handleSelectChange}
              >
                {crops?.map((crop) => (
                  <MenuItem key={crop._id} value={crop._id}>
                    {crop.descriptionES}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )
      }
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label="Genérico"
          name="generico"
          value={generico}
          onChange={handleGenercoChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_formulationDenomination")}
          name="formulationDenomination"
          value={formulationDenomination}
          onChange={handleGenercoChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label={t("toxicityClass")}
          name="toxicityClass"
          value={toxicityClass}
          onChange={handleGenercoChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};
