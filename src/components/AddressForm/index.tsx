import React, { ChangeEvent, SetStateAction,  useState } from "react";
import { Grid, TextField, InputAdornment, Button, Card, CardMedia, Box, Paper, IconButton } from "@mui/material";
import { getLocalityAndStateByZipCode } from "../../services";
import { Phone as PhoneIcon } from "@mui/icons-material";
import { Loading } from "../../components";
import { useTranslation } from "react-i18next";
import { CloudUpload as CloudUploadIcon, DoDisturb as DoDisturbIcon, Cancel as CancelIcon } from "@mui/icons-material";
import uuid4 from "uuid4";
import { urlImg } from "../../config";
import { Business } from "../../interfaces/socialEntity";
import Swal from "sweetalert2";

export interface AddressFormProps {
  values: Business;
  //countries: Country[];
  //countryError: boolean;
  loading: boolean;
  onChangeZipCode: () => Promise<void>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleFormValueChange: (key: string, value: string) => void;
  setFile: React.Dispatch<SetStateAction<File | null>>;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  values,
  handleInputChange,
  setFile,
  handleFormValueChange,
}) => {
  const { domicilio, localidad, cp, provincia, pais, logoBusiness, telefono } = values;
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [urlFile, setUrlFile] = useState('');
  const { t } = useTranslation();

  const fetchBrazilZipCode = async (zipCode: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch Brazil zip code data:", error);
      return null;
    }
  };

  // const onBlurZipCode = async () => {
  //   if (cp !== "") {
  //     setLoadingZipCode(true);
  //     try {
  //       console.log ("Ejecutando", pais)
  //       if (pais === "ARG") {
  //         const localityAndStates = await getLocalityAndStateByZipCode("ARG", cp);
  
  //         if (localityAndStates?.length) {
  //           const firstLocality = localityAndStates[0].locality;
  //           const firstProvince = localityAndStates[0].state;
  
  //           setLocalities(localityAndStates.map((x) => x.locality));
  
  //           handleInputChange({
  //             target: {
  //               name: "localidad",
  //               value: firstLocality,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  
  //           handleInputChange({
  //             target: {
  //               name: "provincia",
  //               value: firstProvince,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  //         }
  //       } else if (pais === "BR") {
  //         const brazilData = await fetchBrazilZipCode(cp);
  //         if (brazilData) {
  
  //           handleInputChange({
  //             target: {
  //               name: "localidad",
  //               value: brazilData.localidade || brazilData.logradouro,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  
  //           handleInputChange({
  //             target: {
  //               name: "provincia",
  //               value: brazilData.uf,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  
  //           handleInputChange({
  //             target: {
  //               name: "domicilio",
  //               value: `${brazilData.logradouro}, ${brazilData.bairro}`,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  
  //         }
  //       }
  //       setLoadingZipCode(false);
  //     } catch (error) {
  //       console.log(error)
  //           Swal.fire({
  //               title: 'Error',
  //               text: '$error$',
  //               icon: 'error',
  //           });
  //       setLoadingZipCode(false);
  //     }
  //   }
  // };
  

  // const onBlurZipCode = async () => {
  //   if (cp !== "") {
  //     setLoadingZipCode(true);
  //     try {
        
  //       if (pais === "ARG" || pais === "AR") {
         
  //         const localityAndStates = await getLocalityAndStateByZipCode("ARG",cp);
  
  //         if (localityAndStates?.length) {
  //           const firstLocality = localityAndStates[0].locality;
  //           const firstProvince = localityAndStates[0].state;
  
  //           setLocalities(localityAndStates.map((x) => x.locality));
  
  //           handleInputChange({
  //             target: {
  //               name: "localidad",
  //               value: firstLocality,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  //           console.log("Ejecutando2", pais);
  
  //           handleInputChange({
  //             target: {
  //               name: "provincia",
  //               value: firstProvince,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  //         } else {
  //           throw new Error("El código postal no coincide con ningún registro en Argentina.");
  //         }
  //       } else if (pais === "BR") {
  //         const brazilData = await fetchBrazilZipCode(cp);
          
  //         if (brazilData) {
  //           handleInputChange({
  //             target: {
  //               name: "localidad",
  //               value: brazilData.localidade || brazilData.logradouro,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  
  //           handleInputChange({
  //             target: {
  //               name: "provincia",
  //               value: brazilData.uf,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  
  //           handleInputChange({
  //             target: {
  //               name: "domicilio",
  //               value: `${brazilData.logradouro}, ${brazilData.bairro}`,
  //             },
  //           } as React.ChangeEvent<HTMLInputElement>);
  //         } else {
  //           throw new Error("El código postal no coincide con ningún registro en Brasil.");
  //         }
  //       } else {
  //         throw new Error("El país seleccionado no es válido o no está soportado.");
  //       }
  
  //       setLoadingZipCode(false);
  //     } catch (error) {
  //       console.error(error);
  
  //       Swal.fire({
  //         title: "Error",
  //         text:  "Revisa que el Codigo postal sea correspondiente al pais.",
  //         icon: "error",
  //       });
  
  //       setLoadingZipCode(false);
  //     }
  //   }
  // };

  const onBlurZipCode = async () => {
    if (cp !== "") {
      setLoadingZipCode(true);
      try {
        console.log("Ejecutando1", pais);
  
        if (pais === "ARG" || pais === "AR") {
          console.log("Ejecutando2", pais);
          const localityAndStates = await getLocalityAndStateByZipCode("ARG", cp);
  
          if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality;
            const firstProvince = localityAndStates[0].state;
  
            setLocalities(localityAndStates.map((x) => x.locality));
  
            handleInputChange({
              target: {
                name: "localidad",
                value: firstLocality,
              },
            } as React.ChangeEvent<HTMLInputElement>);
  
            handleInputChange({
              target: {
                name: "provincia",
                value: firstProvince,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
            throw new Error("El código postal no coincide con ningún registro en Argentina.");
          }
        } else if (pais === "BR") {
          const brazilData = await fetchBrazilZipCode(cp);
  
          if (brazilData) {
            handleInputChange({
              target: {
                name: "localidad",
                value: brazilData.localidade || brazilData.logradouro,
              },
            } as React.ChangeEvent<HTMLInputElement>);
  
            handleInputChange({
              target: {
                name: "provincia",
                value: brazilData.uf,
              },
            } as React.ChangeEvent<HTMLInputElement>);
  
            handleInputChange({
              target: {
                name: "domicilio",
                value: `${brazilData.logradouro}, ${brazilData.bairro}`,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
            throw new Error("El código postal no coincide con ningún registro en Brasil.");
          }
        } else if (pais === "PY" || pais === "PRY") {
          console.log("Ejecutando3", pais);
          const localityAndStates = await getLocalityAndStateByZipCode("PRY", cp);
  
          if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality;
            const firstProvince = localityAndStates[0].state;
  
            setLocalities(localityAndStates.map((x) => x.locality));
  
            handleInputChange({
              target: {
                name: "localidad",
                value: firstLocality,
              },
            } as React.ChangeEvent<HTMLInputElement>);
  
            handleInputChange({
              target: {
                name: "provincia",
                value: firstProvince,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
            throw new Error("El código postal no coincide con ningún registro en Paraguay.");
          }
        } else {
          throw new Error("El país seleccionado no es válido o no está soportado.");
        }
  
        setLoadingZipCode(false);
      } catch (error) {
        console.error(error);
  
        Swal.fire({
          title: "Error",
          text: "Revisa que el Código Postal sea correspondiente al país.",
          icon: "error",
        });
  
        setLoadingZipCode(false);
      }
    }
  };
  
  

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      let fileNameOriginal = file.name;
      let extensionPos = fileNameOriginal.lastIndexOf(".");
      let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

      const newFileName = `business-logo-${uuid4()}${fileType}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      const fileURL = URL.createObjectURL(renamedFile);

      setUrlFile(fileURL);
      setFile(renamedFile);
      handleFormValueChange("logoBusiness", newFileName);
    }
  };

  const handleCancelFile = () => {
    setUrlFile("");
    setFile(null);
    handleFormValueChange("logoBusiness", "");
  }



  return (
    <>
      <Loading key="loading-business" loading={loadingZipCode} />
      <Grid
        container
        margin="auto"
        maxWidth="700px"
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs={12} sm={6}>
        <TextField
          label={t("_phone")}
          variant="outlined"
          // disabled={disabledFields}
          type="text"
          name="telefono"
          value={telefono}
          onChange={handleInputChange}
          InputProps={{
            // startAdornment: <InputAdornment position="start" />,
            endAdornment: (
              <InputAdornment position="end">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            type="text"
            label={t("postal_code")}
            name="cp"
            value={cp}
            onBlur={onBlurZipCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_state")}
            variant="outlined"
            type="text"
            name="provincia"
            value={provincia}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_locality")}
            variant="outlined"
            type="text"
            name="localidad"
            value={localidad}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            label={t("_address")}
            variant="outlined"
            type="text"
            name="domicilio"
            value={domicilio}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={12} sx={{
          marginTop: "10px",
          display: "flex",
          flexDirection: "column-reverse",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {
            !(urlFile || logoBusiness) ? (
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                {t("_logo")}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload} />
              </Button>
            ) : (
              <IconButton onClick={handleCancelFile} color="error" sx={{ p: 0, pl: 1 }}>
                <CancelIcon fontSize="large" />
              </IconButton>
            )
          }
          <Box display="inline-block" component={Paper} sx={{ mb: 1 }}>
            {
              (urlFile || logoBusiness) ? (
                <Card sx={{ maxWidth: "220px", height: "120px" }}>
                  <CardMedia
                    component="img"
                    sx={{ objectFit: "contain" }}
                    image={urlFile || `${urlImg}/${logoBusiness}`}
                    alt="Logo"
                  />
                </Card>
              ) : (
                <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DoDisturbIcon fontSize="large" color="disabled" />
                </Box>
              )
            }
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
