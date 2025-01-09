import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { Crop, Supply,  TypeSupplies } from "../../types";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudUpload as CloudUploadIcon,
  Cancel as CancelIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import uuid4 from "uuid4";
import { IsSeed } from "../../utils/helper";

export interface LaborsFormProps {
  formValues: Supply;
  formErrors: Record<string, boolean>;
  crops: Crop[];
  setFormValues: React.Dispatch<React.SetStateAction<Supply>>;
  setFileUpload: React.Dispatch<React.SetStateAction<File | null>>;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}


export const LaborsForm: React.FC<LaborsFormProps> = ({
  formValues,
  formErrors,
  crops,
  handleSelectChange,
  handleInputChange,
  setFileUpload,
  setFormValues,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const { type, name, description, barCode, stockByLot, brand, senasaId, documentFile } = formValues;


  // const handleChangeLabors = (
  //   { target }: ChangeEvent<HTMLInputElement>,
  //   checked: boolean
  // ) => {
  //   const { name: newLabor } = target;
  //   if (checked)
  //     setFormValues((prevState) => ({
  //       ...prevState,
  //       labors: [...prevState.labors, newLabor],
  //     }));
  //   else {
  //     let laborsFiltered = formValues.labors.filter(
  //       (labor) => labor !== newLabor
  //     );
  //     setFormValues((prevState) => ({ ...prevState, labors: laborsFiltered }));
  //   }
  // };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      let fileNameOriginal = file.name;
      let extensionPos = fileNameOriginal.lastIndexOf(".");
      let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

      const newFileName = `supply_${uuid4()}${fileType}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      setFileUpload(renamedFile);
      setFormValues(prevState => ({ ...prevState, documentFile: newFileName }));
    }
  };

  const cancelFile = () => {
    setFileUpload(null);
    setFormValues(prevState => ({ ...prevState, documentFile: "" }));
  }

  const isSeedType = React.useMemo(() => IsSeed(type), [type]);

  const getDescription = (crop: Crop): string => {
    switch (currentLanguage) {
      case 'en':
        return crop.descriptionEN;
      case 'es':
        return crop.descriptionES;
      case 'pt':
        return crop.descriptionPT;
      default:
        return crop.descriptionEN;
    }
  };


  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormControl
          error={formErrors.type}
          fullWidth>
          <InputLabel id="tipo-insumo">{t("_type")}</InputLabel>
          <Select
            labelId="tipo-insumo"
            name="type"
            value={type}
            label={t("_type")}
            onChange={handleSelectChange}
          >
            {TypeSupplies().map((supply) => (
              <MenuItem key={supply} value={supply}>
                {supply}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formErrors.type ? t("this_field_is_mandatory") : ""}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl
          key="crop-select"
          disabled={!isSeedType}
          fullWidth
          error={formErrors.cropId}>
          <InputLabel id="crop">{t("_crop_of")}</InputLabel>
          <Select
            labelId="crop"
            name="cropId"
            MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
            value={formValues.cropId}
            label={t("_crop_of")}
            onChange={handleSelectChange}
          >
            {crops?.map((crop) => (
              <MenuItem key={crop._id} value={crop._id}>
                {getDescription(crop)}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formErrors.cropId ? t("this_field_is_mandatory") : ""}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_supply")}
          name="name"
          error={formErrors.name}
          helperText={formErrors.name ? t("this_field_is_mandatory") : ""}
          value={name}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_description")}
          name="description"
          value={description}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
          multiline
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_brand")}
          name="brand"
          value={brand}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_senasa")}
          name="senasaId"
          value={senasaId}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_barcode")}
          name="barCode"
          value={barCode}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormGroup row sx={{ alignItems: "center" }}>
          <label htmlFor="">{t("apply_stock_by_lots")}</label>
          <FormControlLabel
            key="yes"
            control={
              <Checkbox
                name="yes"
                checked={stockByLot}
                onChange={() => setFormValues(prevState => ({ ...prevState, stockByLot: true }))}
              />
            }
            label={t("_yes")}
            labelPlacement="start"
          />
          <FormControlLabel
            key="not"
            control={
              <Checkbox
                name="not"
                checked={!stockByLot}
                onChange={() => setFormValues(prevState => ({ ...prevState, stockByLot: false }))}
              />
            }
            label={t("_no")}
            labelPlacement="start"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12} >
        {documentFile ? (
          <Typography variant="body1" style={{ margin: 10 }}>
            {documentFile}
            <IconButton onClick={() => cancelFile()} color="error" sx={{ p: 0, pl: 1 }}>
              <CancelIcon fontSize="medium" />
            </IconButton>
          </Typography>
        ) :
          <Typography variant="body1" style={{ margin: 10, marginLeft: 80 }}>
            <UploadFileIcon fontSize="large" />
          </Typography>
        }
        <Button
          component="label"
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Documento Tecnico
          <Input
            type="file"
            hidden
            onChange={handleFileUpload} />
        </Button>
      </Grid>
      {/* <Grid item xs={12} sm={12} sx={{ my: 3 }}>
        {type.toLowerCase() === TipoInsumo.CULTIVO.toLowerCase() && (
          <>
            <Typography variant="h5" sx={{ pl: 2, mb: 2 }}>
              {t("tasks_applied")}
            </Typography>
            <FormGroup row sx={{ justifyContent: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="Preparado"
                    checked={labors.includes("Preparado")}
                    onChange={handleChangeLabors}
                  />
                }
                label={t("_prepared")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Siembra"
                    checked={labors.includes("Siembra")}
                    onChange={handleChangeLabors}
                  />
                }
                label={t("_planting")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Aplicacion"
                    checked={labors.includes("Aplicacion")}
                    onChange={handleChangeLabors}
                  />
                }
                label={t("_application")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Arrancado"
                    checked={labors.includes("Arrancado")}
                    onChange={handleChangeLabors}
                  />
                }
                label={t("_harvested")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Cosecha"
                    checked={labors.includes("Cosecha")}
                    onChange={handleChangeLabors}
                  />
                }
                label={t("_harvest")}
              />
            </FormGroup>
          </>
        )}
      </Grid> */}
    </Grid>
  );
};
