import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { uiCloseModal } from '../../../redux/ui';
import { useForm, useBusiness } from '../../../hooks';
import { removeBusinessActive } from '../../../redux/business';
import { useTranslation } from 'react-i18next';
import { Business } from '../../../types';
import { Loading } from '../../Loading';
import { CuitTextInput } from '../../Basic/CuitTextInput';

const initialState: Business = {
  accountId: "",
  tipoEntidad: "fisica",
  documento: "",
  nombreCompleto: "",
  cuit: "",
  taxSituation: "",
  razonSocial: "",
  email: "",
  contactoPrincipal: "",
  nameMainContact: "",
  contactoSecundario: "",
  nameSecundaryContact: "",
  esEmpleado: false,
  matricula: "",
  legajo: "",
  categorias: [],
  logoBusiness: { originalName: "", uniqueName: "" },
  address: "",
  zipCode: "",
  locality: "",
  province: "",
  country: "",
};

interface ContractorFormModalProps {
  onContractorCreated?: (contractor: Business) => void;
}

export const ContractorFormModal: React.FC<ContractorFormModalProps> = ({ 
  onContractorCreated 
}) => {
  const dispatch = useAppDispatch();
  const { businessActive } = useAppSelector((state) => state.business);
  const { t } = useTranslation();
  
  const {
    nombreCompleto,
    razonSocial,
    cuit,
    formulario,
    setFormulario,
    handleInputChange,
  } = useForm(initialState);

  const { isLoading, createBusiness, updateBusiness } = useBusiness();
  const [enabledAdd, setEnabledAdd] = useState(false);

  const handleCancel = () => {
    dispatch(uiCloseModal());
    dispatch(removeBusinessActive());
    setFormulario(initialState);
  };

  const handleAddContractor = async () => {
    try {
      console.log("Valores del formulario:", formulario);
      // Indicar que se está creando desde el modal de adición rápida
      const newContractor = await createBusiness(formulario, true);
      
      if (newContractor && onContractorCreated) {
        onContractorCreated(newContractor);
      }
      
      // Cerrar modal después de crear exitosamente
      dispatch(uiCloseModal());
      setFormulario(initialState);
    } catch (error) {
      console.error('Error creating contractor:', error);
    }
  };

  const handleUpdateContractor = async () => {
    if (!formulario._id) return;
    
    try {
      const updatedContractor = await updateBusiness(formulario);
      
      if (updatedContractor && onContractorCreated) {
        onContractorCreated(updatedContractor);
      }
      
      // Cerrar modal después de actualizar exitosamente
      dispatch(uiCloseModal());
      setFormulario(initialState);
    } catch (error) {
      console.error('Error updating contractor:', error);
    }
  };

  useEffect(() => {
    if (businessActive) {
      setFormulario(businessActive);
    } else {
      setFormulario(initialState);
    }
  }, [businessActive, setFormulario]);

  useEffect(() => {
    return () => {
      dispatch(removeBusinessActive());
    };
  }, [dispatch]);

  return (
    <>
      <Loading key="loading-new-contractor" loading={isLoading} />
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{ my: 3, mb: 5 }}
          >
            {businessActive ? t("update") : t("new_masculine")} {t("contractor")}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="razonSocial"
                name="razonSocial"
                label={t("businessName")}
                fullWidth
                autoComplete="organization"
                variant="standard"
                value={razonSocial}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                id="nombreCompleto"
                name="nombreCompleto"
                label={t("full_name")}
                fullWidth
                autoComplete="name"
                variant="standard"
                value={nombreCompleto}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CuitTextInput 
                value={cuit}
                onValidCheck={(valid: boolean) => {
                  setEnabledAdd(valid && (razonSocial?.length > 0 || nombreCompleto?.length > 0));
                }}
                onOnlineValidation={(e: string) => {
                  console.log("Setting Validation", e);
                  setFormulario({
                    ...formulario,
                    razonSocial: e
                  });
                }}
                onChange={handleInputChange}
                label={t("tax_id_cuit_cnpj")}
                variant="standard"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              onClick={handleCancel} 
              sx={{ mt: 3, ml: 1 }}
            >
              {t("id_cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={businessActive ? handleUpdateContractor : handleAddContractor}
              sx={{ mt: 3, ml: 1 }}
              disabled={!enabledAdd && !businessActive}
            >
              {businessActive ? t("id_update") : t("_add")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};