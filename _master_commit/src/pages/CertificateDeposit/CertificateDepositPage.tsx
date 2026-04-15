import { Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography, Box, Chip } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Loading } from '../../components'
import { useAppDispatch, useBusiness, useCampaign, useCertificateDeposit, useCompany } from '../../hooks';
import { CertificateDeposit, CertificatePDFResponse, TransportDocumentByCertificateDeposit } from '../../interfaces/certificate-deposit';
import { GrainsForm, HeaderForm, RatesForm } from '../../components/CertificateDeposit';
import { ReviewForm } from '../../components/CertificateDeposit/ReviewForm';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../../helpers/fileUpload';
import { TipoEntidad } from '../../types';
import { Business } from '../../interfaces/socialEntity';
import { Company } from '../../interfaces/company';
import { uiFinishLoading, uiStartLoading } from '../../redux/ui';
import { getShortDate } from '../../helpers/dates';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';

// Estado inicial con la nueva estructura
const initialFormData: CertificateDeposit = {
  accountId: '',
  licenceId: '',
  archivoCertificado: '',
  createdDate: getShortDate(),

  certificacionElectronicaGranos: {
    fechaEmision: '',
    tipoCertificado: '',
    granoYTipo: '',
    campana: 0,
    coe: '',
  },

  depositario: {
    razonSocial: '',
    domicilio: '',
    localidad: '',
    provincia: '',
    cuit: '',
    iva: '',
  },

  depositante: {
    razonSocial: '',
    domicilio: '',
    localidad: '',
    provincia: '',
    cuit: '',
    iva: '',
    ingresosBrutosNro: 0,
  },

  plantaNro: '',

  tarifasCada100Kgrs: {
    almacenaje: 0,
    acarreo: 0,
    gastosGenerales: 0,
    zarandeo: 0,
    secado: {
      dePorcentaje: 0,
      aPorcentaje: 0,
      montoSecado: 0,
    },
    porCptoExceso: 0,
    otros: 0,
    observaciones: '',
  },

  peso: {
    pesoBruto: 0,
    mermas: {
      volatil: 0,
      secado: 0,
      zarandeo: 0,
    },
    pesoNeto: 0,
  },

  servicios: {
    formaDePago: '',
    gastosGenerales: 0,
    alicuotaIva: '',
    importeIva: 0,
    zarandeo: 0,
    cptosNoGravados: 0,
    secado: 0,
    percepcionesIva: 0,
    otros: 0,
    otrasPercepciones: 0,
    total: 0,
  },

  datosAdicionales: '',
  cultivoId: '',
  campaniaId: '',
  numeroAnalisis: '',
  grado: '',
  contProteico: '',
  factor: '',
};

export const CertificateDepositPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CertificateDeposit>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);

  const { campaigns, getCampaigns } = useCampaign();
  const { businesses: socialEntities, getBusinesses } = useBusiness();
  const { companies, getCompanies } = useCompany();
  // const { crops, getCrops } = useCrops();
  const [selectedDepositary, setSelectedDepositary] = useState<Business | null>(null);
  const [selectedDepositors, setSelectedDepositors] = useState<Company | null>(null);
  const [listTransportByCertificate, setListTransportByCertificate] = useState<TransportDocumentByCertificateDeposit[]>([]);
  // const [pdfProcessedData, setPdfProcessedData] = useState<CertificatePDFResponse | null>(null);
  const { addCertificateDeposit } = useCertificateDeposit();

  // Configuración: si el certificado es válido únicamente en Argentina
  const isDocumentValidOnlyInArgentina = true;

  // Función para convertir fecha de dd/mm/yyyy a yyyy-mm-dd
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  // Función para actualizar campos del formulario
  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Limpiar error del campo
    if (errors[path]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  };

  // Función para mapear datos del PDF al formulario
  const mapPdfDataToForm = (data: CertificatePDFResponse) => {
    const updatedFormData: CertificateDeposit = {
      ...formData,
      certificacionElectronicaGranos: {
        fechaEmision: convertDateFormat(data.certificacion_electronica_granos.fecha_emision),
        tipoCertificado: data.certificacion_electronica_granos.tipo_certificado || '',
        granoYTipo: data.certificacion_electronica_granos.grano_y_tipo || '',
        campana: data.certificacion_electronica_granos.campana || 0,
        coe: data.certificacion_electronica_granos.coe || '',
      },
      depositario: {
        razonSocial: data.depositario.razon_social || '',
        domicilio: data.depositario.domicilio || '',
        localidad: data.depositario.localidad || '',
        provincia: data.depositario.provincia || '',
        cuit: data.depositario.cuit || '',
        iva: data.depositario.iva || '',
      },
      depositante: {
        razonSocial: data.depositante.razon_social || '',
        domicilio: data.depositante.domicilio || '',
        localidad: data.depositante.localidad || '',
        provincia: data.depositante.provincia || '',
        cuit: data.depositante.cuit || '',
        iva: data.depositante.iva || '',
        ingresosBrutosNro: data.depositante.ingresos_brutos_nro || 0,
      },
      plantaNro: data.planta_nro || '',
      tarifasCada100Kgrs: {
        almacenaje: data.tarifas_cada_100_kgrs.almacenaje || 0,
        acarreo: data.tarifas_cada_100_kgrs.acarreo || 0,
        gastosGenerales: data.tarifas_cada_100_kgrs.gastos_generales || 0,
        zarandeo: data.tarifas_cada_100_kgrs.zarandeo || 0,
        secado: {
          dePorcentaje: data.tarifas_cada_100_kgrs.secado.de_porcentaje || 0,
          aPorcentaje: data.tarifas_cada_100_kgrs.secado.a_porcentaje || 0,
          montoSecado: data.tarifas_cada_100_kgrs.secado.monto_secado || 0,
        },
        porCptoExceso: data.tarifas_cada_100_kgrs.por_cpto_exceso || 0,
        otros: data.tarifas_cada_100_kgrs.otros || 0,
        observaciones: data.tarifas_cada_100_kgrs.observaciones || '',
      },
      peso: {
        pesoBruto: data.peso.peso_bruto || 0,
        mermas: {
          volatil: data.peso.mermas.volatil || 0,
          secado: data.peso.mermas.secado || 0,
          zarandeo: data.peso.mermas.zarandeo || 0,
        },
        pesoNeto: data.peso.peso_neto || 0,
      },
      servicios: {
        formaDePago: data.servicios.forma_de_pago || '',
        gastosGenerales: data.servicios.gastos_generales || 0,
        alicuotaIva: data.servicios.alicuota_iva || '',
        importeIva: data.servicios.importe_iva || 0,
        zarandeo: data.servicios.zarandeo || 0,
        cptosNoGravados: data.servicios.cptos_no_gravados || 0,
        secado: data.servicios.secado || 0,
        percepcionesIva: data.servicios.percepciones_iva || 0,
        otros: data.servicios.otros || 0,
        otrasPercepciones: data.servicios.otras_percepciones || 0,
        total: data.servicios.total || 0,
      },
      datosAdicionales: data.datos_adicionales || '',
    };

    setFormData(updatedFormData);

    // Mapear granos a TransportDocumentByCertificateDeposit
    const mappedGranos: TransportDocumentByCertificateDeposit[] = data.granos.map(grano => ({
      numeroCertificado: data.certificacion_electronica_granos.coe || '',
      numeroCartaPorte: grano.ctg_carta_porte || '',
      fechaCartaPorte: convertDateFormat(grano.fecha_ctg),
      kgNeto: grano.kgs_conf_def || 0,
      kgMermaZarandeo: grano.zarandeo.merma_kgs || 0,
      tarifaZarandeo: grano.zarandeo.tarifa || 0,
      importeZarandeo: grano.zarandeo.importe || 0,
      humedadSecado: grano.secado.humedad_porcentaje || 0,
      kgMermaSecado: grano.secado.merma_kgs || 0,
      tarifaSecado: grano.secado.tarifa || 0,
      importeSecado: grano.secado.importe || 0,
    }));

    setListTransportByCertificate(mappedGranos);

    // Buscar y seleccionar depositario/depositante
    const foundDepositary = socialEntities.find(x => x.cuit === data.depositario.cuit);
    if (foundDepositary) setSelectedDepositary(foundDepositary);

    const foundDepositor = companies.find(x => x.trybutaryCode === data.depositante.cuit);
    if (foundDepositor) setSelectedDepositors(foundDepositor);
  };

  if (isDocumentValidOnlyInArgentina && formData.accountId && formData.accountId !== "AR") {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          {t("certificate_deposit_not_valid_for_your_country")}
        </Typography>
      </Container>
    );
  }

  // Steps con el nuevo step de revisión
  const steps = useMemo(() => [
    t("certificateDeposit_header"),
    t("certificateDeposit_grains"),
    t("certificateDeposit_rates"),
    "Revisión"
  ], [t]);

  // Indicador de completitud por step
  const getStepStatus = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return !!(formData.certificacionElectronicaGranos.coe && formData.depositario.cuit && formData.depositante.cuit);
      case 1:
        return listTransportByCertificate.length > 0;
      case 2:
        return formData.servicios.total > 0;
      case 3:
        return false;
      default:
        return false;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <HeaderForm
            formData={formData}
            campaigns={campaigns}
            // crops={crops}
            providers={socialEntities.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA)}
            companies={companies}
            errors={errors}
            updateFormData={updateFormData}
            changeDepositary={(item) => setSelectedDepositary(item)}
            changeDepositors={(item) => setSelectedDepositors(item)}
            deleteFile={() => setDocumentFile(null)}
            fileUpload={(file) => setDocumentFile(file)}
            onPdfProcessed={(data) => {
              mapPdfDataToForm(data);
            }}
            onProcessingChange={setIsProcessingPDF}
          />
        );
      case 1:
        return (
          <GrainsForm
            formData={formData}
            depositary={selectedDepositary}
            depositors={selectedDepositors}
            listTransportByCertificate={listTransportByCertificate}
            updateFormData={updateFormData}
            updateListTransport={(list) => setListTransportByCertificate(list)}
          />
        );
      case 2:
        return (
          <RatesForm
            formData={formData}
            depositary={selectedDepositary}
            depositors={selectedDepositors}
            listTransportDocument={listTransportByCertificate}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <ReviewForm
            formData={formData}
            depositary={selectedDepositary}
            depositors={selectedDepositors}
            listTransportDocument={listTransportByCertificate}
          />
        );
      default:
        return "Unknown step";
    }
  };

  const handleUploadDocumentFile = async () => {
    if (documentFile) {
      await uploadFile(documentFile);
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const onClickCancel = () => {
    setFormData(initialFormData);
    setListTransportByCertificate([]);
    navigate("/init/overview/certificate-deposits");
  };

  const onClickAddCertificateDeposit = async () => {
    console.log('formData', formData);
    console.log('listTransportByCertificate', listTransportByCertificate);
    try {
      dispatch(uiStartLoading());
      await addCertificateDeposit(formData, listTransportByCertificate);
      await handleUploadDocumentFile();
      dispatch(uiFinishLoading());
      setFormData(initialFormData);
      setListTransportByCertificate([]);
      navigate("/init/overview/certificate-deposits");
    } catch (error) {
      console.log('error', error);
      dispatch(uiFinishLoading());
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleNext();
  };

  useEffect(() => {
    getCampaigns();
    getBusinesses();
    getCompanies();
    // getCrops();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ ml: 0, borderRadius: "10px" }}>
      <Loading loading={isProcessingPDF} />
      <Paper
        variant="outlined"
        sx={{
          my: { xs: 3, md: 6 },
          p: { xs: 2, md: 3 },
          borderRadius: "10px",
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography component="h2" variant="h4" align="left" sx={{ letterSpacing: "2px" }}>
            {t("certificateDeposit_title")}
          </Typography>
          {formData.certificacionElectronicaGranos.coe && (
            <Chip
              label={`COE: ${formData.certificacionElectronicaGranos.coe}`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="h5" align='left' sx={{ mb: 3 }}>
          {steps[activeStep]}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3, mb: 4 }}>
          {steps.map((itemStep, index) => (
            <Step key={itemStep}>
              <StepLabel
                StepIconComponent={() => (
                  index < activeStep || getStepStatus(index) ? (
                    <CheckCircleIcon color="success" />
                  ) : index === activeStep ? (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                      }}
                    >
                      {index + 1}
                    </Box>
                  ) : (
                    <RadioButtonUncheckedIcon color="disabled" />
                  )
                )}
              >
                {itemStep}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={onSubmit}>
          {getStepContent(activeStep)}

          <Grid
            container
            alignItems="center"
            justifyContent="space-around"
            sx={{ mt: 5 }}
          >
            <Grid item xs={12} sm={6} key="grid-back" display="flex" justifyContent="center">
              <Button
                variant='contained'
                color="inherit"
                onClick={activeStep !== 0 ? handleBack : onClickCancel}
              >
                {activeStep !== 0 ? t("id_back") : t("id_cancel")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} key="grid-next" display="flex" justifyContent="center">
              {activeStep !== steps.length - 1 ? (
                <Button
                  type='submit'
                  variant="contained"
                  color="primary"
                >
                  {t("id_next")}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={onClickAddCertificateDeposit}
                >
                  {t("_add")}
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};
