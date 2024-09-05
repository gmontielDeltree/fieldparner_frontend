import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  // Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Supply, TipoInsumo, TypeSupplies } from "../../types";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudUpload as CloudUploadIcon,
  Cancel as CancelIcon,
  // AttachFile as AttachFileIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import uuid4 from "uuid4";
// import { uploadFile } from "../../helpers/fileUpload";

export interface LaborsFormProps {
  formValues: Supply;
  supplyError: boolean;
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
  supplyError,
  handleSelectChange,
  handleInputChange,
  setFileUpload,
  setFormValues,
}) => {
  const { type, name, description, barCode, stockByLot, labors, brand, senasaId, documentFile } = formValues;


  const handleChangeLabors = (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const { name: newLabor } = target;
    if (checked)
      setFormValues((prevState) => ({
        ...prevState,
        labors: [...prevState.labors, newLabor],
      }));
    else {
      let laborsFiltered = formValues.labors.filter(
        (labor) => labor !== newLabor
      );
      setFormValues((prevState) => ({ ...prevState, labors: laborsFiltered }));
    }
  };



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

  const { t } = useTranslation();

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
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
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label={t("_supply")}
          name="name"
          error={supplyError}
          helperText={supplyError ? t("this_field_is_mandatory") : ""}
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
      <Grid item xs={12} sm={12} sx={{ my: 3 }}>
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
      </Grid>
    </Grid>
  );
};
