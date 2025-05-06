// DatosGenerales.tsx
import React, { ChangeEvent, SetStateAction } from "react";
import {
  Autocomplete,
  Button,
  FormControl,
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
import { TipoEntidad, Vehicle } from "../../types";
import { useAppSelector } from "../../hooks";
import { useBusinessHook, useFileUploadHook, usePatentHook, useVehicleTypeHook, useYearOptionsHook } from "./useDatosGenerales";
import {
  FolderOpen as FolderOpenIcon,
  Security as SecurityIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";


export interface DatosGeneralesProps {
  vehiculo: Vehicle;
  setVehiculo: React.Dispatch<React.SetStateAction<Vehicle>>;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleYearChange: ({ target }: SelectChangeEvent) => void;
  handleFormValueChange: (key: string, value: string) => void;
  setFilesUpload: React.Dispatch<SetStateAction<File[]>>;
  cancelFile: (indexToRemove: number) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const DatosGenerales: React.FC<DatosGeneralesProps> = ({
  vehiculo,
  handleInputChange,
  handleFormValueChange,
  handleYearChange,
  setFilesUpload,
  cancelFile,
  handleSelectChange,
  setVehiculo
}) => {

  const {
    vehicleType,
    patent,
    make,
    model,
    modelYear,
    owner,
    policyNumber,
    insurence,
    insurenceStartDate,
    insurenceDueDate,
    coverageType,
    location,
    chassisNumber,
    insurencePolicyFile
  } = vehiculo;


  const { handleFileUpload, handleRemoveFile } = useFileUploadHook({
    setFilesUpload,
    onFileChange: (dataFileName) => setVehiculo(prev => ({ ...prev, insurencePolicyFile: dataFileName })),
    cancelFile: (index = 0) => cancelFile(index), // Proporciona valor por defecto
    onFileRemove: () => setVehiculo(prev => ({ ...prev, insurencePolicyFile: { originalName: '', uniqueName: '' } })),
    fileTypePrefix: "insurance-policy",
    acceptedFileTypes: "application/pdf",
    returnBasicFile: false,
    initialFileName: vehiculo.insurencePolicyFile?.originalName
  });
  const { loadingBusiness, optionsPropietario, insuranceCompanies } = useBusinessHook();
  const { checkPatentAvailability } = usePatentHook();

  const { years } = useYearOptionsHook();
  const { vehiculoActivo } = useAppSelector((state) => state.vehiculo);

  const disabledFields = !!vehiculoActivo;
  const { t } = useTranslation();


  const {
    typeVehicles,
    handleOnBlurTipoVehiculo,
  } = useVehicleTypeHook(vehicleType);


  const handleOnBlurPatent = async () => {
    if (patent !== "" && !await checkPatentAvailability(patent)) {
      handleFormValueChange("patent", "");
    }
  };

  return (
    <>
      <Grid
        container
        spacing={2}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12} display="flex" alignItems="center">
          <FolderOpenIcon sx={{ mx: 1 }} />
          <Typography variant="h5">{t("general_data")}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="vehicleType"
            value={vehicleType}
            freeSolo
            options={typeVehicles}
            disabled={disabledFields}
            onBlur={() => handleOnBlurTipoVehiculo()}
            onChange={(_event: any, newValue: string | null) => {
              newValue && handleFormValueChange("vehicleType", newValue);
            }}
            inputValue={vehicleType}
            onInputChange={(_event, newInputValue) => {
              handleFormValueChange("vehicleType", newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label={t("vehicle_type")} required />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_brand")}
            required
            variant="outlined"
            disabled={disabledFields}
            type="text"
            name="make"
            value={make}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_model")}
            required
            disabled={disabledFields}
            variant="outlined"
            type="text"
            name="model"
            value={model}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="year-select-label">{t("_year")}</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              name="modelYear"
              value={modelYear}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 248 }//Tamaño para 5 opciones
                }
              }}
              label={t("_year")}
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label={t("_patent")}
            variant="outlined"
            type="text"
            name="patent"
            value={patent}
            onBlur={handleOnBlurPatent}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_chassis")}
            variant="outlined"
            type="text"
            name="chassisNumber"
            value={chassisNumber}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="owner"
            freeSolo
            loading={loadingBusiness}
            value={owner}
            onChange={(_event: any, newValue: string | null) => {
              newValue && handleFormValueChange("owner", newValue);
            }}
            inputValue={owner}
            onInputChange={(_event, newInputValue) => {
              handleFormValueChange("owner", newInputValue);
            }}
            options={["Propio", ...optionsPropietario]}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} name="owner" label={t("_owner")} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            label={t("id_location")}
            variant="outlined"
            type="text"
            name="location"
            placeholder={t("id_location")}
            value={location}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <SecurityIcon sx={{ mx: 1 }} />
          <Typography variant="h5">{t("_insurance")}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl key="insurence-select" fullWidth>
            <InputLabel id="insurence" >{t("insurance_company")}</InputLabel>
            <Select
              labelId="insurence"
              name="insurence"
              value={insurence}
              label={t("insurance_company")}
              onChange={handleSelectChange}
            >
              {insuranceCompanies?.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA).map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.razonSocial}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label={t("coverage_type")}
            variant="outlined"
            type="text"
            name="coverageType"
            value={coverageType}
            fullWidth
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label={t("policy_number")}
            variant="outlined"
            type="text"
            name="policyNumber"
            value={policyNumber}
            fullWidth
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            type="date"
            label={t("insurance_start_date")}
            name="insurenceStartDate"
            value={insurenceStartDate}
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
            type="date"
            label={t("insurance_expiry_date")}
            name="insurenceDueDate"
            value={insurenceDueDate}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={6} sx={{ display: "flex", alignItems: "center", justifyContent: "start" }} >
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Poliza
            <Input
              type="file"
              hidden
              onChange={handleFileUpload} />
          </Button>
          {insurencePolicyFile ? (
            <>
              <label
                title={insurencePolicyFile.originalName}
                style={{
                  margin: "10px",
                  width: "240px",
                  display: "inline-block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                {insurencePolicyFile.originalName}
              </label>
              <IconButton onClick={() => handleRemoveFile(0)} color="error">
                <CancelIcon fontSize="medium" />
              </IconButton>
            </>
          ) :
            <Typography variant="body1" sx={{ ml: 1, display: "inline-block" }}>
              Ningún archivo seleccionado
            </Typography>
          }
        </Grid>
      </Grid>
    </>
  );
};
