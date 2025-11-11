import React, { useEffect, useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { ContractorRepository } from "../../../classes/ContractorRepository";
import { Business } from "../../../interfaces/socialEntity";
import { CuitTextInput } from "../../Basic/CuitTextInput";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { uiOpenModal } from '../../../redux/ui';
import { DisplayModals } from '../../../types';
import { useAutocompleteAddOption } from '../../AutocompleteAddOption';
import { ViewComponentModal } from '../../';
import { Box, Typography } from '@mui/material';
import { BusinessPage } from '../../../pages/Business/BusinessPage';



interface FilmOptionType {
  inputValue?: string;
  nombreCompleto?: string;
  razonSocial?: string;
}

const filter = createFilterOptions<FilmOptionType>();

interface ContractorOptionType extends Business {
  inputValue?: string;
}

interface AutocompleteContratistaProps {
  value?: ContractorOptionType | null;
  onChange?: (value: ContractorOptionType | null) => void;
  width?: number;
}

export const AutocompleteContratista: React.FC<AutocompleteContratistaProps> = ({ value, onChange, width = 300 }) => {
  const [_value, setValue] = useState<ContractorOptionType | null>(value || null);
  const [open, toggleOpen] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [contractorRepo] = useState(() => ContractorRepository.getInstance(user?.accountId));
  const [contractors, setContractors] = useState<Business[]>([]);
  const previousIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log("🚀 AutocompleteContratista - Ejecutando getByCategory");
    contractorRepo.getByCategory("8456b733-d530-4c7d-8907-66f117938769").then((contractorsFromDB) => {
      console.log("✅ AutocompleteContratista - Contractors recibidos:", contractorsFromDB);
      console.log("✅ AutocompleteContratista - Cantidad de contractors:", contractorsFromDB.length);
      setContractors(contractorsFromDB);
      previousIdsRef.current = new Set(contractorsFromDB.map(c => c._id).filter(Boolean));
    }).catch((error) => {
      console.error("❌ AutocompleteContratista - Error al obtener contractors:", error);
    });

    // 🔥 PATRÓN OBSERVER: Escuchar cambios automáticos del repository
    const observerCallback = (updatedBusinesses: Business[]) => {
      console.log("📢 AutocompleteContratista - Observer triggered with:", updatedBusinesses.length, "businesses");
      // Filtrar solo contratistas
      contractorRepo.getByCategory("8456b733-d530-4c7d-8907-66f117938769").then((filteredBusinesses) => {
        console.log("🔄 AutocompleteContratista - Updating from observer:", filteredBusinesses);
        setContractors(filteredBusinesses);
        previousIdsRef.current = new Set(filteredBusinesses.map(c => c._id).filter(Boolean));
      });
    };
    
    contractorRepo.attachObserver(observerCallback);
    
    // Cleanup: desconectar observer cuando el componente se desmonte
    return () => {
      contractorRepo.detachObserver(observerCallback);
    };
  }, []);

  const handleClose = () => {
    setDialogValue({
      razonSocial: "",
      cuit: ""
    });
    toggleOpen(false);
  };

  const [dialogValue, setDialogValue] = useState({
    razonSocial: "",
    cuit: ""
  });

  const [enabledAdd, setEnabledAdd] = useState(false)

  // Función personalizada para renderizar opciones normales de contratistas
  const renderNormalOption = (props: any, option: any) => (
    <Box
      {...props}
      key={option?._id || option?.id}
      sx={{
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <Typography variant="subtitle1">
        {option?.nombreCompleto || option?.razonSocial}
      </Typography>
    </Box>
  );

  // Hook reutilizable para la opción agregar
  const { enhancedOptions, renderOption } = useAutocompleteAddOption(
    contractors,
    {
      onClick: () => dispatch(uiOpenModal(DisplayModals.ContratistaForm))
    },
    renderNormalOption
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Save new contractor
    const newBusiness: Partial<Business> = {
      nombreCompleto: dialogValue.razonSocial,
      razonSocial: dialogValue.razonSocial,
      cuit: dialogValue.cuit,
      accountId: "",
      telefono: "",
      email: "",
      tipoEntidad: "fisica",
      documento: "",
      contactoPrincipal: "",
      contactoSecundario: "",
      sitioWeb: "",
      domicilio: "",
      localidad: "",
      cp: "",
      zipCode: "",
      provincia: "",
      pais: "",
      esEmpleado: false,
      legajo: "",
      matricula: "",
      categorias: ["8456b733-d530-4c7d-8907-66f117938769"],
      logoBusiness: { originalName: "", uniqueName: "" },
      taxSituation: ""
    };
    
    contractorRepo
      .add(newBusiness as Business)
      .then((doc) => {
        console.log("✅ AutocompleteContratista - Nuevo contratista creado:", doc);
        setValue(doc);
        // El observer se encargará de actualizar la lista automáticamente
      });

    handleClose();
  };

  // Sync internal state when parent value changes
  useEffect(() => {
    setValue(value || null);
  }, [value]);

  // Solo notificar al padre cuando _value realmente cambie (no en el render inicial)
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    if (onChange) {
      onChange(_value);
    }
  }, [_value]); // Remover onChange de las dependencias para evitar re-renders



  return (
    <React.Fragment>
      <Autocomplete
        value={_value}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            // timeout to avoid instant validation of the dialog's form.
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({
                razonSocial: newValue,
                cuit: ""
              });
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              razonSocial: newValue.inputValue,
              cuit: ""
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (params.inputValue !== "") {
            filtered.push({
              inputValue: params.inputValue,
              nombreCompleto: `${t("add")} "${params.inputValue}"`,
              razonSocial: `${t("add")} "${params.inputValue}"`
            });
          }

          return filtered;
        }}
        id="free-solo-dialog-demo"
        options={enhancedOptions}
        getOptionLabel={(option) => {
          // e.g. value selected with enter, right from the input

          if (typeof option === "string") {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          // Si es la opción agregar, no mostrar nada en el campo de texto
          if (option.isAddOption) {
            return '';
          }

          return option?.nombreCompleto === ""
            ? option.razonSocial
            : option.nombreCompleto || "";
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={renderOption}
        sx={{ width: width }}
        freeSolo
        renderInput={(params) => (
          <TextField {...params} label={t("contractor")} />
        )}
      />
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {t("quickAdd")} 
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t(
                "editDetailsLaterInContractorsMenu"
              )}
            </DialogContentText>
            <CuitTextInput value={dialogValue.cuit}
              onValidCheck={(valid: boolean) => {
                setEnabledAdd(valid)
              }}
              onOnlineValidation={(e: string) => {
                console.log("Setting Validation", e)
                setDialogValue({
                  ...dialogValue,
                  razonSocial: e
                })
              }}
              onChange={(event) => {
                console.log("CUIT", event.target.value)
                setDialogValue({
                  ...dialogValue,
                  cuit: event.target.value
                })
              }
              } />

            <TextField
              sx={{ minWidth: "75%" }}
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.razonSocial}
              onChange={(event) =>
                setDialogValue({
                  ...dialogValue,
                  razonSocial: event.target.value
                })
              }
              label={t("businessName")}
              type="text"
              variant="standard"
            />

          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t("cancel")}</Button>
            <Button type="submit" disabled={!enabledAdd}>{t("add")}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ViewComponentModal para agregar nuevo contratista - mostrando BusinessPage completo */}
      <ViewComponentModal
        title={`${t("_quick_add")}`}
        disableBackdropClick={false}
        disableEscapeKeyDown={false}
        modalType={DisplayModals.ContratistaForm}
      >
        <BusinessPage isQuickAdd={true} />
      </ViewComponentModal>
    </React.Fragment>
  );
};