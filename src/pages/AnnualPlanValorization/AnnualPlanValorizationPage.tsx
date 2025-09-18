import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Container,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert as MuiAlert,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Progress,
  Alert,
  Spinner,
} from 'reactstrap';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { TemplateLayout, Loading } from "../../components";
import { useAnnualPlanValorization } from "../../hooks/useAnnualPlanValorization";
import { useCampaign, useField, useCrops, useAppSelector } from "../../hooks";
import { useCountry } from "../../hooks/useCountry";
import { usePlanActividad, useListaDeCiclos } from "../../hooks/usePlanifications";
import { useLabores } from "../../hooks/useLabores";
import { 
  IAnnualPlan, 
  IInsumosxAnnualPlan, 
  IServicxAnnualPlan,
  IAnnualPlanValorization 
} from "../../interfaces/annualPlanValorization";
import { 
  IActividadPlanificacion,
  IInsumosPlanificacion,
  ILaboresPlanificacion 
} from "../../interfaces/planification";
import { Campaign, Field, Lot } from "../../types";
import { dbContext } from "../../services";

interface FormData {
  // Sección 1
  campanaId: string;
  zafra: string;
  campoId: string;
  loteId: string;
  has: number;
  rindeHistorico: number; // Quintales/Ha
  cotizFutCer: number; // Moneda local por tonelada
  monedaAlterId: string;
  cotizMonAlt: number;
  operacMonAlt: 'multiplicar' | 'dividir';
  
  // Sección 2 (calculados)
  gastosMonLocal: number;
  gastosMonAlt: number;
  rendimientoMonLocal: number;
  rendimientoMonAlt: number;
  tendenciaMonLocal: number;
  tendenciaMonAlt: number;
}

export const AnnualPlanValorizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditMode = !!id;

  const { user } = useAppSelector((state) => state.auth);
  const { campaigns, getCampaigns } = useCampaign();
  const { fields, getFields } = useField();
  const { crops, getCrops } = useCrops();
  const { country: countries } = useCountry();
  const { getLineasInsumos, getLineasServicios } = usePlanActividad();
  const ciclos = useListaDeCiclos();
  const { getLaborFromId } = useLabores();
  const {
    createAnnualPlanValorization,
    updateAnnualPlanValorization,
    getAnnualPlanValorizations
  } = useAnnualPlanValorization();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Step management for better UX
  const [activeStep, setActiveStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  
  // Mock data - esto vendría de la base de datos
  const [annualPlan, setAnnualPlan] = useState<any | null>(null);
  const [insumos, setInsumos] = useState<IInsumosxAnnualPlan[]>([]);
  const [servicios, setServicios] = useState<IServicxAnnualPlan[]>([]);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    campanaId: '',
    zafra: '',
    campoId: '',
    loteId: '',
    has: 0,
    rindeHistorico: 0,
    cotizFutCer: 0,
    monedaAlterId: '',
    cotizMonAlt: 0,
    operacMonAlt: 'multiplicar',
    gastosMonLocal: 0,
    gastosMonAlt: 0,
    rendimientoMonLocal: 0,
    rendimientoMonAlt: 0,
    tendenciaMonLocal: 0,
    tendenciaMonAlt: 0,
  });

  // Filtered lists
  const [availableZafras, setAvailableZafras] = useState<any[]>([]);
  const [availableCampos, setAvailableCampos] = useState<Field[]>([]);
  const [availableLotes, setAvailableLotes] = useState<Lot[]>([]);

  // Define steps for the valorization flow
  const steps = [
    { label: t('valorization_parameters'), key: 'parameters' },
    { label: t('value_loading'), key: 'values' },
    { label: t('trend'), key: 'trend' },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    getCampaigns();
    getFields();
    getCrops();
    ciclos.refreshCiclos();
  }, []);

  useEffect(() => {
    if (isEditMode && campaigns.length > 0 && fields.length > 0) {
      loadValorizationData();
    }
  }, [id, campaigns, fields]);

  // Inicializar campos disponibles cuando se cargan los fields
  useEffect(() => {
    if (fields.length > 0 && availableCampos.length === 0 && !formData.campanaId) {
      console.log('📌 Inicializando campos disponibles:', fields.length);
      setAvailableCampos(fields);
    }
  }, [fields]);

  // Recalcular totales cuando cambien insumos o servicios
  // COMENTADO: Este useEffect puede estar causando el problema del lote
  // useEffect(() => {
  //   if (insumos.length > 0 || servicios.length > 0) {
  //     recalcularTotales();
  //   }
  // }, [insumos, servicios, formData.has, formData.rindeHistorico, formData.cotizFutCer]);

  // Nota: Removido useEffect que causaba bucle infinito

  const loadValorizationData = async () => {
    setLoading(true);
    try {
      // TODO: Cargar datos de valorización existente
      // Por ahora, solo reseteamos el formulario
      if (campaigns.length > 0 && fields.length > 0) {
        setFormData({
          campanaId: campaigns[0]._id || '',
          zafra: 'Ciclo 1',
          campoId: fields[0]._id || '',
          loteId: fields[0].lotes?.[0]?.properties.nombre || '',
          has: fields[0].lotes?.[0]?.properties.hectareas || 0,
          rindeHistorico: 0,
          cotizFutCer: 0,
          monedaAlterId: '',
          cotizMonAlt: 0,
          operacMonAlt: 'dividir',
          gastosMonLocal: 0,
          gastosMonAlt: 0,
          rendimientoMonLocal: 0,
          rendimientoMonAlt: 0,
          tendenciaMonLocal: 0,
          tendenciaMonAlt: 0,
        });
      }

      // Simular insumos
      setInsumos([
        {
          _id: 'ins1',
          annualPlanId: 'plan1',
          labor: 'Siembra',
          item: 'Insumo 1',
          insumoId: 'ins1',
          cantidad: 50,
          cantidadHa: 50,
          valorUnidad: 0,
          valorTotal: 0,
          accountId: '',
          created: { userId: '', date: '' },
          modified: { userId: '', date: '' },
        },
        {
          _id: 'ins2',
          annualPlanId: 'plan1',
          labor: 'Aplicac',
          item: 'Insumo 2',
          insumoId: 'ins2',
          cantidad: 100,
          cantidadHa: 100,
          valorUnidad: 0,
          valorTotal: 0,
          accountId: '',
          created: { userId: '', date: '' },
          modified: { userId: '', date: '' },
        },
      ]);

      // Simular servicios
      setServicios([
        {
          _id: 'serv1',
          annualPlanId: 'plan1',
          labor: 'Cosecha',
          item: 'Servicio 1',
          servicioId: 'serv1',
          descripcion: 'Cosecha',
          cantidad: 1,
          cantidadHa: 1,
          valorUnidad: 0,
          valorTotal: 0,
          accountId: '',
          created: { userId: '', date: '' },
          modified: { userId: '', date: '' },
        },
      ]);
    } catch (error) {
      console.error("Error loading valorization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoteChange = (loteValue: string) => {
    console.log(`🔄 handleLoteChange: ${loteValue}`);
    console.log(`🔄 Current formData.loteId: ${formData.loteId}`);
    
    const selectedField = fields.find(f => f._id === formData.campoId);
    const selectedLot = selectedField?.lotes.find(l => l.properties.nombre === loteValue);
    
    if (selectedLot) {
      const newHectareas = selectedLot.properties.hectareas || 0;
      console.log('📍 Lote seleccionado:', {
        lote: selectedLot.properties.nombre,
        hectareas: newHectareas
      });
      
      // Actualizar directamente con todos los valores necesarios
      setFormData(prev => {
        const newFormData = {
          ...prev,
          loteId: loteValue,
          has: newHectareas
        };
        console.log('🔄 New formData after lote change:', {
          loteId: newFormData.loteId,
          has: newFormData.has
        });
        return newFormData;
      });

      // Actualizar insumos/servicios si existen
      if (insumos.length > 0 || servicios.length > 0) {
        const updatedInsumos = insumos.map(insumo => ({
          ...insumo,
          valorTotal: (insumo.valorUnidad || 0) * (insumo.cantidadHa || 0) * newHectareas
        }));
        const updatedServicios = servicios.map(servicio => ({
          ...servicio,
          valorTotal: (servicio.valorUnidad || 0) * newHectareas
        }));
        
        setInsumos(updatedInsumos);
        setServicios(updatedServicios);
        
        // Recalcular totales
        setTimeout(() => recalcularTotalesConDatos(updatedInsumos, updatedServicios), 0);
      }
    } else {
      // Si no encuentra el lote, solo actualizar el loteId
      console.log('⚠️ Lote no encontrado en la lista, actualizando solo loteId');
      setFormData(prev => {
        const newFormData = {
          ...prev,
          loteId: loteValue,
          has: 0
        };
        console.log('🔄 New formData (lote not found):', {
          loteId: newFormData.loteId,
          has: newFormData.has
        });
        return newFormData;
      });
    }
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    console.log(`🔄 handleFieldChange: ${field} = ${value}`);
    console.log(`🔄 Current formData.loteId: ${formData.loteId}`);
    
    // Crear objeto con los nuevos datos
    let updatedFormData = { ...formData, [field]: value };

    // Lógica específica por campo
    switch (field) {
      case 'campanaId':
        if (value !== formData.campanaId) {
          console.log('🎯 Nueva campaña seleccionada:', value);
          
          // Cargar zafras/ciclos de la campaña
          const campaignCycles = ciclos.ciclos?.filter(c => c.campanaId === value) || [];
          const uniqueZafras = new Map();
          
          campaignCycles.forEach(ciclo => {
            if (ciclo.cultivoId) {
              const crop = crops.find(c => c._id === ciclo.cultivoId);
              const zafraName = crop ? `Zafra ${crop.name}` : `Zafra ${ciclo.cultivoId}`;
              uniqueZafras.set(ciclo.cultivoId, { id: ciclo.cultivoId, name: zafraName });
            }
          });
          
          setAvailableZafras(Array.from(uniqueZafras.values()));
          setAvailableCampos(fields);
          setAvailableLotes([]);
          
          updatedFormData = {
            ...updatedFormData,
            zafra: '',
            campoId: '',
            loteId: '',
            has: 0
          };
          
          if (value) {
            loadPlanificationData(value as string, '', '', '');
          }
        }
        break;

      case 'campoId':
        if (value !== formData.campoId) {
          const selectedField = fields.find(f => f._id === value);
          if (selectedField && selectedField.lotes) {
            setAvailableLotes(selectedField.lotes);
            // Solo resetear el loteId si el campo realmente cambió
            updatedFormData = {
              ...updatedFormData,
              loteId: '', // Es correcto resetear aquí porque cambió el campo
              has: 0
            };
          }
        }
        break;
    }

    // Actualizar el estado una sola vez
    setFormData(updatedFormData);

    // Recalcular totales si es necesario
    if (['rindeHistorico', 'cotizFutCer', 'cotizMonAlt', 'operacMonAlt'].includes(field)) {
      setTimeout(() => recalcularTotales(), 0);
    }
  };

  const handleInsumoValorChange = (index: number, valor: number) => {
    console.log('🔧 handleInsumoValorChange called:', { index, valor, has: formData.has });
    const updatedInsumos = [...insumos];
    console.log('🔧 Current insumo before update:', updatedInsumos[index]);
    
    // Validate that valor is a valid positive number
    const validValue = isNaN(valor) || valor < 0 ? 0 : valor;
    updatedInsumos[index].valorUnidad = validValue;
    
    // Calcular valor total: valor unitario * cantidad por hectárea * hectáreas totales
    const cantidadPorHa = updatedInsumos[index].cantidadHa || 0;
    const hectareas = formData.has || 0;
    const valorTotal = valor * cantidadPorHa * hectareas;
    
    updatedInsumos[index].valorTotal = valorTotal;
    
    console.log('🔧 Cálculo detallado:', {
      valorUnidad: valor,
      cantidadPorHa: cantidadPorHa,
      hectareas: hectareas,
      valorTotal: valorTotal,
      formula: `${valor} * ${cantidadPorHa} * ${hectareas} = ${valorTotal}`
    });
    
    setInsumos(updatedInsumos);
    console.log('🔧 Calling recalcularTotales with updated insumos...');
    // Recalcular totales con los nuevos valores directamente
    recalcularTotalesConDatos(updatedInsumos, servicios);
  };

  const handleServicioValorChange = (index: number, valor: number) => {
    console.log('🔨 handleServicioValorChange called:', { index, valor, has: formData.has });
    const updatedServicios = [...servicios];
    
    // Validate that valor is a valid positive number
    const validValue = isNaN(valor) || valor < 0 ? 0 : valor;
    updatedServicios[index].valorUnidad = validValue;
    
    // Para servicios, el valor unitario es por hectárea
    const hectareas = formData.has || 0;
    const valorTotal = valor * hectareas;
    updatedServicios[index].valorTotal = valorTotal;
    
    console.log('🔨 Cálculo servicio:', {
      valorUnidad: valor,
      hectareas: hectareas,
      valorTotal: valorTotal,
      formula: `${valor} * ${hectareas} = ${valorTotal}`
    });
    
    setServicios(updatedServicios);
    // Recalcular totales con los nuevos valores directamente
    recalcularTotalesConDatos(insumos, updatedServicios);
  };

  const recalcularTotales = () => {
    recalcularTotalesConDatos(insumos, servicios);
  };

  const recalcularTotalesConDatos = (insumosData: IInsumosxAnnualPlan[], serviciosData: IServicxAnnualPlan[]) => {
    console.log('💰 recalcularTotalesConDatos called');
    console.log('💰 Current insumos for calculation:', insumosData.map(i => ({ item: i.item, valorTotal: i.valorTotal })));
    console.log('💰 Current servicios for calculation:', serviciosData.map(s => ({ item: s.item, valorTotal: s.valorTotal })));
    
    // Calcular gastos totales
    const gastosInsumos = insumosData.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosServicios = serviciosData.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosTotal = gastosInsumos + gastosServicios;
    
    console.log('💰 Calculated totals:', {
      gastosInsumos,
      gastosServicios,
      gastosTotal
    });

    // Usar setFormData con función callback para preservar el estado actual
    setFormData(currentFormData => {
      console.log('💰 Current formData in callback:', {
        loteId: currentFormData.loteId,
        has: currentFormData.has
      });
      
      // Calcular rendimiento (rinde histórico en kg/ha * hectáreas * cotización futura)
      const rindeKgHa = currentFormData.rindeHistorico * 100; // Convertir quintales a kg
      const rendimientoTotal = rindeKgHa * currentFormData.has * (currentFormData.cotizFutCer / 1000); // Cotización es por tonelada

      // Calcular tendencia
      const tendencia = rendimientoTotal - gastosTotal;

      // Calcular valores en moneda alternativa
      let gastosMonAlt = 0;
      let rendimientoMonAlt = 0;
      let tendenciaMonAlt = 0;

      if (currentFormData.cotizMonAlt > 0) {
        if (currentFormData.operacMonAlt === 'dividir') {
          gastosMonAlt = gastosTotal / currentFormData.cotizMonAlt;
          rendimientoMonAlt = rendimientoTotal / currentFormData.cotizMonAlt;
          tendenciaMonAlt = tendencia / currentFormData.cotizMonAlt;
        } else {
          gastosMonAlt = gastosTotal * currentFormData.cotizMonAlt;
          rendimientoMonAlt = rendimientoTotal * currentFormData.cotizMonAlt;
          tendenciaMonAlt = tendencia * currentFormData.cotizMonAlt;
        }
      }

      const newFormData = {
        ...currentFormData, // Usar el estado actual, no el capturado
        gastosMonLocal: gastosTotal,
        gastosMonAlt: gastosMonAlt,
        rendimientoMonLocal: rendimientoTotal,
        rendimientoMonAlt: rendimientoMonAlt,
        tendenciaMonLocal: tendencia,
        tendenciaMonAlt: tendenciaMonAlt,
      };
      
      console.log('💰 Updating formData with new values:', {
        loteId: newFormData.loteId,
        gastosMonLocal: gastosTotal,
        rendimientoMonLocal: rendimientoTotal,
        tendenciaMonLocal: tendencia
      });
      
      return newFormData;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validar campos requeridos
      if (!formData.campanaId || !formData.campoId || !formData.loteId) {
        alert(t("please_fill_required_fields"));
        setSaving(false);
        return;
      }

      // Obtener información adicional
      const selectedCampaign = campaigns.find(c => c._id === formData.campanaId);
      const selectedField = fields.find(f => f._id === formData.campoId);
      const selectedLot = selectedField?.lotes.find(l => l.properties.nombre === formData.loteId);
      const cultivoId = ciclos.ciclos?.find(c => 
        c.campanaId === formData.campanaId && 
        c.campoId === formData.campoId && 
        c.loteId === selectedLot?.properties.uuid
      )?.cultivoId || '';
      const selectedCrop = crops.find(c => c._id === cultivoId);

      // Calcular cosecha estimada en toneladas
      const rindeKgHa = formData.rindeHistorico * 100; // Convertir quintales a kg
      const cosechaEstimadaTn = (rindeKgHa * formData.has) / 1000; // Convertir a toneladas

      // Crear objeto de valorización
      const valorizationData: Omit<IAnnualPlanValorization, "_id" | "_rev"> = {
        annualPlanId: `plan_${formData.campanaId}_${formData.campoId}_${formData.loteId}`,
        campanaId: formData.campanaId,
        campanaName: selectedCampaign?.name || '',
        zafra: formData.zafra,
        campoId: formData.campoId,
        campoName: selectedField?.nombre || '',
        loteId: selectedLot?.properties.uuid || formData.loteId,
        loteName: selectedLot?.properties.nombre || formData.loteId,
        has: formData.has,
        cultivoId: cultivoId,
        cultivoName: (selectedCrop as any)?.name || '',
        cosechaEstimada: cosechaEstimadaTn,
        tendenciaMonLocal: formData.tendenciaMonLocal,
        status: 'abierto',
        accountId: user?.accountId || '',
        created: {
          userId: user?.id || '',
          date: new Date().toISOString()
        },
        modified: {
          userId: user?.id || '',
          date: new Date().toISOString()
        }
      };

      if (isEditMode) {
        await updateAnnualPlanValorization({
          ...valorizationData,
          _id: id!,
          _rev: annualPlan?._rev
        } as IAnnualPlanValorization);
      } else {
        await createAnnualPlanValorization(valorizationData);
      }

      // TODO: Guardar también los detalles de insumos y servicios en una colección separada
      
      navigate("/init/overview/annual-plan-valorization");
    } catch (error) {
      console.error("Error saving valorization:", error);
      alert(t("error_saving_valorization"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/init/overview/annual-plan-valorization");
  };

  const handleNext = () => {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      navigate("/init/overview/annual-plan-valorization");
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= maxStepReached) {
      setActiveStep(step);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex === activeStep) return 'current';
    if (stepIndex < activeStep) return 'complete';
    if (stepIndex <= maxStepReached) return 'available';
    return 'upcoming';
  };

  // Función removida - ya no necesitamos el botón refresh

  const handleExportToExcel = async () => {
    try {
      // Importar dinámicamente la función de exportación
      const { exportValorizationToExcel } = await import('../../helpers/excelExport');
      
      // Obtener información necesaria para la exportación
      const selectedCampaign = campaigns.find(c => c._id === formData.campanaId);
      const selectedField = fields.find(f => f._id === formData.campoId);
      const selectedLot = selectedField?.lotes.find(l => l.properties.nombre === formData.loteId);
      const cultivoId = ciclos.ciclos?.find(c => 
        c.campanaId === formData.campanaId && 
        c.campoId === formData.campoId && 
        c.loteId === selectedLot?.properties.uuid
      )?.cultivoId || '';
      const selectedCrop = crops.find(c => c._id === cultivoId);

      // Crear objeto de valorización para exportar
      const valorization: IAnnualPlanValorization = {
        _id: 'temp',
        annualPlanId: `plan_${formData.campanaId}_${formData.campoId}_${formData.loteId}`,
        campanaId: formData.campanaId,
        campanaName: selectedCampaign?.name || '',
        zafra: formData.zafra,
        campoId: formData.campoId,
        campoName: selectedField?.nombre || '',
        loteId: selectedLot?.properties.uuid || formData.loteId,
        loteName: selectedLot?.properties.nombre || formData.loteId,
        has: formData.has,
        cultivoId: cultivoId,
        cultivoName: (selectedCrop as any)?.name || '',
        cosechaEstimada: (formData.rindeHistorico * 100 * formData.has) / 1000,
        tendenciaMonLocal: formData.tendenciaMonLocal,
        status: 'abierto',
        accountId: user?.accountId || '',
        created: {
          userId: user?.id || '',
          date: new Date().toISOString()
        },
        modified: {
          userId: user?.id || '',
          date: new Date().toISOString()
        }
      };

      // Exportar a Excel
      exportValorizationToExcel({
        valorization,
        insumos,
        servicios,
        formData
      }, t);

    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert(t("error_exporting_to_excel"));
    }
  };

  const formatCurrency = (value: number, currency: string = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Calcular totales en tiempo real sin modificar estado
  const calcularTotalesEnTiempoReal = () => {
    const gastosInsumos = insumos.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosServicios = servicios.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosTotal = gastosInsumos + gastosServicios;

    // Calcular rendimiento
    const rindeKgHa = formData.rindeHistorico * 100;
    const rendimientoTotal = rindeKgHa * formData.has * (formData.cotizFutCer / 1000);

    // Calcular tendencia
    const tendencia = rendimientoTotal - gastosTotal;

    return {
      gastosTotal,
      rendimientoTotal,
      tendencia,
      gastosInsumos,
      gastosServicios
    };
  };

  const getCropName = () => {
    // TODO: Obtener el cultivo desde la planificación seleccionada
    return 'Soja';
  };

  const loadPlanificationData = async (campanaId: string, campoId: string, loteId: string, zafra: string) => {
    try {
      console.log('Loading planification data for campaign:', { campanaId, zafra });
      
      // Limpiar arrays al inicio
      setInsumos([]);
      setServicios([]);
      
      // Buscar TODOS los ciclos de la campaña (no solo del lote específico)
      const allCampaignCycles = ciclos.ciclos?.filter(c => 
        c.campanaId === campanaId
      ) || [];

      console.log('Found campaign cycles:', allCampaignCycles.length);
      console.log('Campaign cycles:', allCampaignCycles);

      if (allCampaignCycles.length === 0) {
        console.log('No cycles found for campaign');
        setInsumos([]);
        setServicios([]);
        return;
      }

      // Recopilar todas las actividades de todos los ciclos de la campaña
      const db = dbContext.fields as unknown as PouchDB.Database<IActividadPlanificacion>;
      let allActivitiesIds: string[] = [];
      
      for (const cycle of allCampaignCycles) {
        console.log('Cycle:', cycle._id, 'Activities:', cycle.actividadesIds);
        allActivitiesIds = [...allActivitiesIds, ...(cycle.actividadesIds || [])];
      }

      console.log('Total activities IDs in campaign:', allActivitiesIds.length);
      console.log('Activities IDs:', allActivitiesIds);

      // Eliminar duplicados
      const uniqueActivitiesIds = [...new Set(allActivitiesIds)];
      console.log('Unique activities IDs:', uniqueActivitiesIds.length, uniqueActivitiesIds);

      // Obtener todas las actividades - usar el db correcto
      const planDb = dbContext.fields as PouchDB.Database<IActividadPlanificacion>;
      const actividadesResult = await planDb.allDocs({
        keys: uniqueActivitiesIds,
        include_docs: true
      });

      console.log('Activities found:', actividadesResult.rows.length);
      console.log('Activities result:', actividadesResult);
      
      // Filtrar solo las actividades que tienen documento
      const validActivities = actividadesResult.rows.filter(row => row.doc && !row.error);
      console.log('Valid activities with documents:', validActivities.length);
      
      // Mostrar cada actividad encontrada
      actividadesResult.rows.forEach((row, index) => {
        if (row.doc) {
          const actividad = row.doc as IActividadPlanificacion;
          console.log(`Activity ${index + 1}:`, {
            id: actividad._id,
            tipo: actividad.tipo,
            insumosLineasIds: actividad.insumosLineasIds,
            laboresLineasIds: actividad.laboresLineasIds,
            campanaId: actividad.campanaId,
            campoId: actividad.campoId,
            loteId: actividad.loteId
          });
        } else {
          console.log(`Activity ${index + 1}: No doc found for`, row.key);
        }
      });

      // Recopilar todos los IDs de líneas de insumos y servicios
      let allInsumosIds: string[] = [];
      let allServiciosIds: string[] = [];

      console.log('Processing activities for insumos and servicios...');
      for (const row of validActivities) {
        if (row.doc) {
          const actividad = row.doc as IActividadPlanificacion;
          console.log(`Processing activity ${actividad._id}:`);
          console.log('  - insumosLineasIds:', actividad.insumosLineasIds);
          console.log('  - laboresLineasIds:', actividad.laboresLineasIds);
          
          if (actividad.insumosLineasIds && actividad.insumosLineasIds.length > 0) {
            allInsumosIds.push(...actividad.insumosLineasIds);
            console.log('  - Added', actividad.insumosLineasIds.length, 'insumo IDs');
          }
          
          if (actividad.laboresLineasIds && actividad.laboresLineasIds.length > 0) {
            allServiciosIds.push(...actividad.laboresLineasIds);
            console.log('  - Added', actividad.laboresLineasIds.length, 'servicio IDs');
          }
        } else {
          console.log('No doc found for activity:', row.key);
        }
      }

      console.log('Total Insumos IDs collected:', allInsumosIds.length, allInsumosIds);
      console.log('Total Servicios IDs collected:', allServiciosIds.length, allServiciosIds);

      // Cargar líneas de insumos
      console.log('Attempting to load insumos with IDs:', allInsumosIds);
      if (allInsumosIds.length > 0) {
        console.log('Calling getLineasInsumos with', allInsumosIds.length, 'IDs');
        const lineasInsumos = await getLineasInsumos(allInsumosIds);
        // Filtrar insumos válidos (que tengan doc)
        const validInsumos = lineasInsumos.filter(linea => linea && linea.insumoId);
        console.log('Loaded insumos lines:', validInsumos.length, 'items');
        console.log('Insumos details:', validInsumos);

        // Agrupar insumos por ID de insumo para consolidar cantidades
        const insumosGrouped = new Map<string, {
          insumoId: string;
          name: string;
          totalCantidad: number;
          labores: Set<string>;
        }>();

        // Primero, agrupar todos los insumos
        console.log('🔍 Processing insumos lines in detail...');
        await Promise.all(
          validInsumos.map(async (linea, index) => {
            console.log(`🔍 Insumo line ${index + 1}:`, linea);
            console.log(`🔍   - insumoId: ${linea.insumoId}`);
            console.log(`🔍   - dosis: ${linea.dosis}`);
            console.log(`🔍   - totalCantidad: ${linea.totalCantidad}`);
            
            if (!linea.insumoId) {
              console.log('🔍   - Skipping: no insumoId');
              return;
            }

            let insumoName = `Insumo`;
            try {
              const insumoDoc = await dbContext.supplies.get(linea.insumoId);
              insumoName = insumoDoc.name || insumoName;
              console.log(`🔍   - Insumo name: ${insumoName}`);
            } catch (error) {
              console.warn('Could not load supply name for:', linea.insumoId);
            }

            const labor = getActivityTypeForLine(linea, actividadesResult.rows);
            console.log(`🔍   - Labor: ${labor}`);
            
            // Usar la cantidad más apropiada
            const cantidad = linea.dosis || linea.totalCantidad || 0;
            console.log(`🔍   - Final cantidad to use: ${cantidad}`);
            
            if (insumosGrouped.has(linea.insumoId)) {
              const existing = insumosGrouped.get(linea.insumoId)!;
              existing.totalCantidad += cantidad;
              existing.labores.add(labor);
              console.log(`🔍   - Updated existing group, new total: ${existing.totalCantidad}`);
            } else {
              const newGroup = {
                insumoId: linea.insumoId,
                name: insumoName,
                totalCantidad: cantidad,
                labores: new Set([labor])
              };
              insumosGrouped.set(linea.insumoId, newGroup);
              console.log(`🔍   - Created new group:`, newGroup);
            }
          })
        );
        
        console.log('🔍 Final insumosGrouped map:', insumosGrouped);

        // Obtener el total de hectáreas de la campaña
        let totalHectareasCampaign = 0;
        console.log('🏞️ Calculating total hectares for campaign...');
        for (const cycle of allCampaignCycles) {
          const field = fields.find(f => f._id === cycle.campoId);
          const lot = field?.lotes?.find(l => l.properties.uuid === cycle.loteId);
          console.log(`🏞️ Cycle ${cycle._id}:`, {
            campoId: cycle.campoId,
            loteId: cycle.loteId,
            field: field?.nombre,
            lot: lot?.properties?.nombre,
            hectareas: lot?.properties?.hectareas
          });
          if (lot) {
            totalHectareasCampaign += lot.properties.hectareas || 0;
          }
        }
        
        console.log(`🏞️ Total hectareas in campaign: ${totalHectareasCampaign}`);

        // Convertir a array de IInsumosxAnnualPlan
        console.log('📋 Converting to final insumos array...');
        const insumosData: IInsumosxAnnualPlan[] = Array.from(insumosGrouped.values()).map((item, index) => {
          const cantidadPorHa = totalHectareasCampaign > 0 ? item.totalCantidad / totalHectareasCampaign : item.totalCantidad;
          
          console.log(`📋 Insumo ${index + 1} conversion:`, {
            name: item.name,
            totalCantidad: item.totalCantidad,
            totalHectareasCampaign: totalHectareasCampaign,
            cantidadPorHa: cantidadPorHa
          });
          
          return {
            _id: `valorization_insumo_${index}`,
            annualPlanId: 'temp_plan_id',
            labor: Array.from(item.labores).join(', '),
            item: item.name,
            insumoId: item.insumoId,
            cantidad: item.totalCantidad,
            cantidadHa: cantidadPorHa,
            valorUnidad: 0, // Esto se editará en la pantalla
            valorTotal: 0,
            accountId: '',
            created: { userId: '', date: '' },
            modified: { userId: '', date: '' },
          };
        });

        console.log('Final insumos data to set:', insumosData);
        setInsumos(insumosData);
      } else {
        console.log('No insumos IDs found, setting empty array');
        setInsumos([]);
      }

      // Cargar líneas de servicios
      console.log('Attempting to load servicios with IDs:', allServiciosIds);
      if (allServiciosIds.length > 0) {
        console.log('Calling getLineasServicios with', allServiciosIds.length, 'IDs');
        const lineasServicios = await getLineasServicios(allServiciosIds);
        // Filtrar servicios válidos (que tengan doc)
        const validServicios = lineasServicios.filter(linea => linea && linea.laborId);
        console.log('Loaded servicios lines:', validServicios.length, 'items');
        console.log('Servicios details:', validServicios);

        // Agrupar servicios por ID de labor
        const serviciosGrouped = new Map<string, {
          laborId: string;
          name: string;
          descripcion: string;
          totalHectareas: number;
          activityTypes: Set<string>;
        }>();

        // Agrupar todos los servicios
        console.log('Grouping servicios...');
        await Promise.all(
          validServicios.map(async (linea, index) => {
            console.log(`Processing servicio line ${index + 1}:`, linea);
            
            if (!linea.laborId) {
              console.log('  - Skipping: no laborId');
              return;
            }

            let laborName = 'Servicio';
            try {
              // Usar la función getLaborFromId del hook
              const labor = getLaborFromId(linea.laborId);
              laborName = labor?.name || `Servicio ${linea.laborId}`;
              console.log('  - Labor name:', laborName);
            } catch (error) {
              console.warn('Could not load labor name for:', linea.laborId, error);
            }

            const activityType = getActivityTypeForLine(linea, actividadesResult.rows);
            console.log('  - Activity type:', activityType);
            
            if (serviciosGrouped.has(linea.laborId)) {
              const existing = serviciosGrouped.get(linea.laborId)!;
              existing.totalHectareas += (linea.hectareas || 1);
              existing.activityTypes.add(activityType);
              if (linea.comentario) {
                existing.descripcion = linea.comentario;
              }
              console.log('  - Updated existing group:', existing);
            } else {
              const newGroup = {
                laborId: linea.laborId,
                name: laborName,
                descripcion: linea.comentario || 'Servicio',
                totalHectareas: linea.hectareas || 1,
                activityTypes: new Set([activityType])
              };
              serviciosGrouped.set(linea.laborId, newGroup);
              console.log('  - Created new group:', newGroup);
            }
          })
        );
        
        console.log('Servicios grouped map:', serviciosGrouped);

        // Convertir a array de IServicxAnnualPlan
        const serviciosData: IServicxAnnualPlan[] = Array.from(serviciosGrouped.values()).map((item, index) => ({
          _id: `valorization_servicio_${index}`,
          annualPlanId: 'temp_plan_id',
          labor: Array.from(item.activityTypes).join(', '),
          item: item.name,
          servicioId: item.laborId,
          descripcion: item.descripcion,
          cantidad: item.totalHectareas,
          cantidadHa: 1,
          valorUnidad: 0, // Esto se editará en la pantalla
          valorTotal: 0,
          accountId: '',
          created: { userId: '', date: '' },
          modified: { userId: '', date: '' },
        }));

        console.log('Final servicios data to set:', serviciosData);
        setServicios(serviciosData);
      } else {
        console.log('No servicios IDs found, setting empty array');
        setServicios([]);
      }

      console.log('=== RESUMEN DE CARGA DE DATOS ===');
      console.log(`Campaña ID: ${campanaId}`);
      console.log(`Ciclos encontrados: ${allCampaignCycles?.length || 0}`);
      console.log(`Actividades procesadas: ${actividadesResult?.rows?.length || 0}`);
      console.log(`Total IDs de insumos: ${allInsumosIds?.length || 0}`);
      console.log(`Total IDs de servicios: ${allServiciosIds?.length || 0}`);
      
      if (allServiciosIds?.length === 0) {
        console.log('⚠️  No se encontraron servicios porque las actividades de esta campaña no tienen laboresLineasIds definidos');
        console.log('💡  Esto puede ser normal si las actividades solo usan insumos o si son actividades internas');
        console.log('🔍  Iniciando investigación de actividades con servicios en toda la base de datos...');
        
        // Investigar si existen actividades con servicios en toda la base de datos
        try {
          const allActivitiesResult = await dbContext.fields.allDocs({
            startkey: 'planactividad:',
            endkey: 'planactividad:\ufff0',
            include_docs: true,
            limit: 100 // Limitar para evitar sobrecarga
          });
          
          console.log('🔍  Total de actividades planificadas encontradas:', allActivitiesResult.rows.length);
          
          let activitiesWithServices = 0;
          let activitiesWithInsumos = 0;
          let totalActivities = 0;
          const sampleActivitiesWithServices = [];
          
          for (const row of allActivitiesResult.rows) {
            if (row.doc) {
              totalActivities++;
              const activity = row.doc as any;
              
              if (activity.laboresLineasIds && activity.laboresLineasIds.length > 0) {
                activitiesWithServices++;
                if (sampleActivitiesWithServices.length < 3) {
                  sampleActivitiesWithServices.push({
                    id: activity._id,
                    tipo: activity.tipo,
                    campanaId: activity.campanaId,
                    laboresCount: activity.laboresLineasIds.length,
                    insumosCount: activity.insumosLineasIds?.length || 0
                  });
                }
              }
              
              if (activity.insumosLineasIds && activity.insumosLineasIds.length > 0) {
                activitiesWithInsumos++;
              }
            }
          }
          
          console.log('📊  ESTADÍSTICAS DE ACTIVIDADES PLANIFICADAS:');
          console.log(`     • Total de actividades: ${totalActivities}`);
          console.log(`     • Con insumos: ${activitiesWithInsumos} (${totalActivities > 0 ? ((activitiesWithInsumos/totalActivities)*100).toFixed(1) : 0}%)`);
          console.log(`     • Con servicios: ${activitiesWithServices} (${totalActivities > 0 ? ((activitiesWithServices/totalActivities)*100).toFixed(1) : 0}%)`);
          
          if (sampleActivitiesWithServices.length > 0) {
            console.log('🎯  EJEMPLOS DE ACTIVIDADES CON SERVICIOS:');
            sampleActivitiesWithServices.forEach((sample, index) => {
              console.log(`       ${index + 1}. ${sample.id} (${sample.tipo}) - ${sample.laboresCount} servicios, ${sample.insumosCount} insumos`);
            });
            
            // Si encontramos actividades con servicios, intentar cargar una como ejemplo
            const exampleActivity = sampleActivitiesWithServices[0];
            console.log('🧪  Intentando cargar servicios de actividad ejemplo:', exampleActivity.id);
            
            try {
              const exampleDoc = await dbContext.fields.get(exampleActivity.id) as any;
              const exampleLaboresResult = await dbContext.fields.allDocs({
                keys: exampleDoc.laboresLineasIds,
                include_docs: true
              });
              
              console.log('🔍  Servicios de ejemplo encontrados:', exampleLaboresResult.rows.length);
              
              const serviciosEjemplo: IServicxAnnualPlan[] = [];
              for (const laborRow of exampleLaboresResult.rows) {
                if (laborRow.doc) {
                  const lineaLabor = laborRow.doc as any;
                  const labor = getLaborFromId(lineaLabor.laborId);
                  
                  serviciosEjemplo.push({
                    _id: `example_servicio_${Date.now()}_${Math.random()}`,
                    annualPlanId: 'temp_plan_id',
                    labor: lineaLabor.laborNombre || labor?.name || 'Servicio',
                    item: lineaLabor.laborNombre || labor?.name || 'Servicio',
                    servicioId: lineaLabor.laborId,
                    descripcion: lineaLabor.comentario || 'Servicio de la actividad planificada',
                    cantidad: 1,
                    cantidadHa: 1, // Por hectárea
                    valorUnidad: lineaLabor.costoPorHectarea || 0,
                    valorTotal: 0,
                    accountId: '',
                    created: { userId: '', date: '' },
                    modified: { userId: '', date: '' },
                  });
                }
              }
              
              if (serviciosEjemplo.length > 0) {
                console.log('✅  Cargando servicios de ejemplo basados en actividades reales:', serviciosEjemplo);
                setServicios(serviciosEjemplo);
              } else {
                console.log('❌  No se pudieron cargar servicios de ejemplo');
                setServicios([]);
              }
            } catch (exampleError) {
              console.error('❌  Error cargando servicios de ejemplo:', exampleError);
              setServicios([]);
            }
          } else {
            console.log('❌  NO SE ENCONTRARON ACTIVIDADES CON SERVICIOS EN LA BASE DE DATOS');
            console.log('💡  RECOMENDACIÓN: Crear nuevas actividades planificadas con servicios usando el editor de planificación');
            setServicios([]);
          }
        } catch (investigationError) {
          console.error('❌  Error durante la investigación de actividades:', investigationError);
          setServicios([]);
        }
      }

    } catch (error) {
      console.error('Error loading planification data:', error);
      setInsumos([]);
      setServicios([]);
    }
  };

  const getActivityTypeForLine = (linea: any, activities: any[]): string => {
    // Buscar a qué actividad pertenece esta línea para obtener el tipo
    for (const row of activities) {
      if (row.doc) {
        const actividad = row.doc as IActividadPlanificacion;
        if (actividad.insumosLineasIds?.includes(linea._id) || 
            actividad.laboresLineasIds?.includes(linea._id)) {
          return getActivityTypeName(actividad.tipo);
        }
      }
    }
    return 'Actividad';
  };

  const getActivityTypeName = (tipo: string): string => {
    const tipos: { [key: string]: string } = {
      'siembra': 'Siembra',
      'cosecha': 'Cosecha',
      'aplicacion': 'Aplicac',
      'preparado': 'Preparado',
      'otro': 'Otro'
    };
    return tipos[tipo] || 'Actividad';
  };

  const getStepStyle = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          background: '#22c55e',
          color: 'white',
          border: 'none',
        };
      case 'current':
        return {
          background: 'white',
          color: '#22c55e',
          border: '2px solid #22c55e',
        };
      case 'upcoming':
        return {
          background: '#f3f4f6',
          color: '#6b7280',
          border: 'none',
        };
      default:
        return {
          background: '#e5e7eb',
          color: '#6b7280',
          border: 'none',
        };
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Parameters step
        return renderParametersStep();
      case 1: // Values step
        return renderValuesStep();
      case 2: // Trend step
        return renderTrendStep();
      default:
        return null;
    }
  };

  const renderParametersStep = () => (
    <>
      <Typography variant="h6" gutterBottom>
        {t("valorization_parameters")}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("campaign")}</InputLabel>
            <Select
              value={formData.campanaId}
              onChange={(e) => handleFieldChange('campanaId', e.target.value)}
              label={t("campaign")}
            >
              {campaigns.map((campaign) => (
                <MenuItem key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("harvest")}</InputLabel>
            <Select
              value={formData.zafra}
              onChange={(e) => handleFieldChange('zafra', e.target.value)}
              label={t("harvest")}
              disabled={!formData.campanaId || availableZafras.length === 0}
            >
              {availableZafras.length === 0 ? (
                <MenuItem value="" disabled>
                  {t("no_harvests_available")}
                </MenuItem>
              ) : (
                availableZafras.map((zafra) => (
                  <MenuItem key={zafra.id} value={zafra.name}>
                    {zafra.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("field")}</InputLabel>
            <Select
              value={formData.campoId}
              onChange={(e) => handleFieldChange('campoId', e.target.value)}
              label={t("field")}
              disabled={!formData.campanaId || !formData.zafra}
            >
              {availableCampos.map((campo) => (
                <MenuItem key={campo._id} value={campo._id}>
                  {campo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("lot")}</InputLabel>
            <Select
              value={formData.loteId}
              onChange={(e) => handleLoteChange(e.target.value as string)}
              label={t("lot")}
              disabled={!formData.campoId}
            >
              {availableLotes.length === 0 ? (
                <MenuItem value="" disabled>
                  {t("no_lots_available")}
                </MenuItem>
              ) : (
                availableLotes.map((lote) => (
                  <MenuItem key={lote.properties.uuid || lote.properties.nombre} value={lote.properties.nombre}>
                    {lote.properties.nombre}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label={t("hectares")}
            value={formData.has}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label={t("crop")}
            value={getCropName()}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            required
            type="number"
            label={t("historical_yield_qq_ha")}
            value={formData.rindeHistorico}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, rindeHistorico: value === '' ? 0 : parseFloat(value) || 0 }));
              }
            }}
            onBlur={() => setTimeout(() => recalcularTotales(), 0)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            required
            type="number"
            label={t("future_cereal_quote")}
            value={formData.cotizFutCer}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, cotizFutCer: value === '' ? 0 : parseFloat(value) || 0 }));
              }
            }}
            onBlur={() => setTimeout(() => recalcularTotales(), 0)}
            helperText={t("local_currency_per_ton")}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            size="small"
            options={countries}
            getOptionLabel={(option) => option.currency || ''}
            value={countries.find((c: any) => c.currency === formData.monedaAlterId) || null}
            onChange={(e, value) => handleFieldChange('monedaAlterId', value?.currency || '')}
            renderInput={(params) => (
              <TextField {...params} label={t("alternative_currency")} />
            )}
          />
        </Grid>
      </Grid>
    </>
  );

  const renderValuesStep = () => (
    <>
      <Typography variant="h6" gutterBottom>
        {t("value_loading")}
      </Typography>

      {/* Insumos */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{
            bgcolor: 'primary.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: '50%',
            fontWeight: 'bold'
          }}>
            A
          </Box>
          {t("supplies")}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("labor")}</TableCell>
                <TableCell>{t("item")}</TableCell>
                <TableCell align="right">{t("quantity_ha")}</TableCell>
                <TableCell align="right">{t("unit_value")}</TableCell>
                <TableCell align="right">{t("total_value")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insumos.map((insumo, index) => (
                <TableRow key={insumo._id}>
                  <TableCell>{insumo.labor}</TableCell>
                  <TableCell>{insumo.item}</TableCell>
                  <TableCell align="right">{formatNumber(insumo.cantidadHa || 0, 2)} Kg/Ha</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={insumo.valorUnidad || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleInsumoValorChange(index, parseFloat(value) || 0);
                        }
                      }}
                      sx={{ width: 120 }}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 4 }}>$</span>
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(insumo.valorTotal || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Servicios */}
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{
            bgcolor: 'primary.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: '50%',
            fontWeight: 'bold'
          }}>
            B
          </Box>
          {t("services")}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("labor")}</TableCell>
                <TableCell>{t("item")}</TableCell>
                <TableCell align="right">{t("quantity_ha")}</TableCell>
                <TableCell align="right">{t("unit_value")}</TableCell>
                <TableCell align="right">{t("total_value")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicios.map((servicio, index) => (
                <TableRow key={servicio._id}>
                  <TableCell>{servicio.labor}</TableCell>
                  <TableCell>{servicio.item}</TableCell>
                  <TableCell align="right">$/Ha</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={servicio.valorUnidad || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleServicioValorChange(index, parseFloat(value) || 0);
                        }
                      }}
                      sx={{ width: 120 }}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 4 }}>$</span>
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(servicio.valorTotal || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {formData.has > 0 && (
        <MuiAlert severity="info" sx={{ mt: 3 }}>
          <Typography variant="caption" display="block">
            <strong>{t("hectares_selected")}: {formatNumber(formData.has, 2)} ha</strong>
          </Typography>
        </MuiAlert>
      )}
    </>
  );

  const renderTrendStep = () => {
    const totales = calcularTotalesEnTiempoReal();
    return (
      <>
        <Typography variant="h6" gutterBottom>
          {t("trend")} ($)
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("expenses")}
              </Typography>
              <Typography variant="h5">
                ARS {formatNumber(totales.gastosTotal)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {t("supplies")}: {formatCurrency(totales.gastosInsumos)} | {t("services")}: {formatCurrency(totales.gastosServicios)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("yield")}
              </Typography>
              <Typography variant="h5">
                ARS {formatNumber(totales.rendimientoTotal)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {formData.rindeHistorico} qq/ha × {formData.has} ha × ${formData.cotizFutCer}/tn
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: totales.tendencia >= 0 ? 'success.main' : 'error.main',
                borderRadius: 1,
                bgcolor: totales.tendencia >= 0 ? 'success.light' : 'error.light',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("trend")}
              </Typography>
              <Typography variant="h4" color={totales.tendencia >= 0 ? 'success.dark' : 'error.dark'}>
                ARS {formatNumber(totales.tendencia)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {totales.tendencia >= 0 ? '✅ ' + t('profitable') : '❌ ' + t('not_profitable')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  if (loading) {
    return <Loading loading />;
  }

  return (
    <TemplateLayout viewMap={false}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Card className="shadow-lg">
          {/* Header */}
          <CardHeader
            className="p-0"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderTopLeftRadius: '0.5rem',
              borderTopRightRadius: '0.5rem',
            }}
          >
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <TrendingUp size={35} color="white" />
                  </div>
                  <div className="text-white">
                    <h4 className="mb-0 fw-bold">{t("annual_plan_valorization")}</h4>
                    <small className="opacity-75">
                      {isEditMode ? t('edit_mode') : t('create_mode')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Stepper */}
          <div className="px-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div
                    key={step.key}
                    className="text-center position-relative"
                    style={{ flex: 1 }}
                  >
                    <div
                      onClick={() => handleStepClick(index)}
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        cursor: index <= maxStepReached ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        ...getStepStyle(status),
                      }}
                    >
                      {status === 'complete' ? (
                        <Check size={20} />
                      ) : (
                        <span style={{ fontWeight: '600' }}>{index + 1}</span>
                      )}
                    </div>

                    <div className="mt-2">
                      <small
                        className="text-muted"
                        style={{
                          fontWeight: status === 'current' ? '600' : '400',
                        }}
                      >
                        {step.label}
                      </small>
                    </div>

                    {index < steps.length - 1 && (
                      <Progress
                        value={index < activeStep ? 100 : 0}
                        color="success"
                        style={{
                          position: 'absolute',
                          top: '20px',
                          left: '50%',
                          width: '100%',
                          height: '2px',
                          zIndex: -1,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <CardBody className="p-4">
            {renderStepContent()}
          </CardBody>

          {/* Actions */}
          <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
            <Button
              color="light"
              onClick={handleBack}
              className="d-flex align-items-center gap-2"
            >
              <ChevronLeft size={16} />
              {activeStep === 0 ? t('back') : t('previous')}
            </Button>

            <div className="d-flex gap-2">
              {activeStep < steps.length - 1 && (
                <Button
                  color="success"
                  onClick={handleNext}
                  className="d-flex align-items-center gap-2"
                >
                  {t('next')}
                  <ChevronRight size={16} />
                </Button>
              )}

              {activeStep === steps.length - 1 && (
                <>
                  {isEditMode && (
                    <Button
                      color="outline-success"
                      onClick={handleExportToExcel}
                      className="d-flex align-items-center gap-2"
                    >
                      <Package size={16} />
                      {t('export_to_excel')}
                    </Button>
                  )}
                  <Button
                    color="success"
                    onClick={handleSave}
                    disabled={saving}
                    className="d-flex align-items-center gap-2"
                  >
                    {saving ? (
                      <Spinner size="sm" />
                    ) : (
                      <Check size={16} />
                    )}
                    {t('save')}
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </Container>
    </TemplateLayout>
  );
};

const handleBackOld
 = () => {
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("field")}</InputLabel>
                  <Select
                    value={formData.campoId}
                    onChange={(e) => handleFieldChange('campoId', e.target.value)}
                    label={t("field")}
                    disabled={!formData.campanaId || !formData.zafra}
                  >
                    {availableCampos.map((campo) => (
                      <MenuItem key={campo._id} value={campo._id}>
                        {campo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("lot")}</InputLabel>
                  <Select
                    value={formData.loteId}
                    onChange={(e) => {
                      console.log('🎯 Select onChange triggered with value:', e.target.value);
                      console.log('🎯 Current formData.loteId before change:', formData.loteId);
                      console.log('🎯 Available lotes for matching:', availableLotes.map(l => l.properties.nombre));
                      handleLoteChange(e.target.value as string);
                    }}
                    label={t("lot")}
                    disabled={!formData.campoId}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                    sx={{ 
                      '& .MuiSelect-select': { 
                        color: formData.loteId ? 'inherit' : 'transparent' 
                      } 
                    }}
                  >
                    {availableLotes.length === 0 ? (
                      <MenuItem value="" disabled>
                        {t("no_lots_available")}
                      </MenuItem>
                    ) : (
                      availableLotes.map((lote, index) => {
                        console.log(`🔍 Rendering MenuItem ${index}:`, {
                          key: lote.properties.uuid || lote.properties.nombre,
                          value: lote.properties.nombre,
                          matches_current: lote.properties.nombre === formData.loteId
                        });
                        return (
                          <MenuItem 
                            key={lote.properties.uuid || lote.properties.nombre} 
                            value={lote.properties.nombre}
                          >
                            {lote.properties.nombre}
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("hectares")}
                  value={formData.has}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("crop")}
                  value={getCropName()}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  type="number"
                  label={t("historical_yield_qq_ha")}
                  value={formData.rindeHistorico}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and decimals, no negative values for yield
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFormData(prev => ({ ...prev, rindeHistorico: value === '' ? 0 : parseFloat(value) || 0 }));
                    }
                  }}
                  onBlur={(e) => {
                    // Ensure clean number on blur and recalculate
                    const value = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, rindeHistorico: value }));
                    setTimeout(() => recalcularTotales(), 0);
                  }}
                  onKeyPress={(e) => {
                    // Allow control keys
                    if (e.key.length > 1) return;
                    // Only allow numbers and decimal point
                    if (!/[0-9.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  inputProps={{
                    inputMode: 'decimal',
                    pattern: '[0-9]*'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  type="number"
                  label={t("future_cereal_quote")}
                  value={formData.cotizFutCer}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and decimals, no negative values for prices
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFormData(prev => ({ ...prev, cotizFutCer: value === '' ? 0 : parseFloat(value) || 0 }));
                    }
                  }}
                  onBlur={(e) => {
                    // Ensure clean number on blur and recalculate
                    const value = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, cotizFutCer: value }));
                    setTimeout(() => recalcularTotales(), 0);
                  }}
                  onKeyPress={(e) => {
                    // Allow control keys
                    if (e.key.length > 1) return;
                    // Only allow numbers and decimal point
                    if (!/[0-9.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  inputProps={{
                    inputMode: 'decimal',
                    pattern: '[0-9]*'
                  }}
                  helperText={t("local_currency_per_ton")}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  size="small"
                  options={countries}
                  getOptionLabel={(option) => option.currency || ''}
                                     value={countries.find((c: any) => c.currency === formData.monedaAlterId) || null}
                  onChange={(e, value) => handleFieldChange('monedaAlterId', value?.currency || '')}
                  renderInput={(params) => (
                    <TextField {...params} label={t("alternative_currency")} />
                  )}
                />
              </Grid>
            </Grid>

            {formData.monedaAlterId && (
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={t("alternative_currency_quote")}
                    value={formData.cotizMonAlt}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, cotizMonAlt: value === '' ? 0 : parseFloat(value) || 0 }));
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setFormData(prev => ({ ...prev, cotizMonAlt: value }));
                      setTimeout(() => recalcularTotales(), 0);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={formData.operacMonAlt}
                      onChange={(e) => handleFieldChange('operacMonAlt', e.target.value)}
                    >
                      <FormControlLabel value="multiplicar" control={<Radio />} label={t("multiply")} />
                      <FormControlLabel value="dividir" control={<Radio />} label={t("divide")} />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Sección 2: Tendencia */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("section")} 2: {t("trend")} ($)
            </Typography>
            <Grid container spacing={3}>
              {(() => {
                const totales = calcularTotalesEnTiempoReal();
                return (
                  <>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t("expenses")}
                        </Typography>
                        <Typography variant="h5">
                          ARS {formatNumber(totales.gastosTotal)}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Insumos: {formatCurrency(totales.gastosInsumos)} | Servicios: {formatCurrency(totales.gastosServicios)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t("yield")}
                        </Typography>
                        <Typography variant="h5">
                          ARS {formatNumber(totales.rendimientoTotal)}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formData.rindeHistorico} qq/ha × {formData.has} ha × ${formData.cotizFutCer}/tn
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          border: '2px solid',
                          borderColor: totales.tendencia >= 0 ? 'success.main' : 'error.main',
                          borderRadius: 1,
                          bgcolor: totales.tendencia >= 0 ? 'success.light' : 'error.light',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          {t("trend")}
                        </Typography>
                        <Typography variant="h4" color={totales.tendencia >= 0 ? 'success.dark' : 'error.dark'}>
                          ARS {formatNumber(totales.tendencia)}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {totales.tendencia >= 0 ? '✅ Rentable' : '❌ No rentable'}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                );
              })()}
            </Grid>
          </CardContent>
        </Card>

        {/* Sección 3: Carga de valores */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("section")} 3: {t("value_loading")}
            </Typography>

            {/* Parte A: Insumos */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: '50%',
                  fontWeight: 'bold'
                }}>
                  A
                </Box>
                {t("supplies")}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("labor")}</TableCell>
                      <TableCell>{t("item")}</TableCell>
                      <TableCell align="right">{t("quantity_ha")}</TableCell>
                      <TableCell align="right">{t("unit_value")}</TableCell>
                      <TableCell align="right">{t("total_value")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {insumos.map((insumo, index) => (
                      <TableRow key={insumo._id}>
                        <TableCell>{insumo.labor}</TableCell>
                        <TableCell>{insumo.item}</TableCell>
                        <TableCell align="right">{formatNumber(insumo.cantidadHa || 0, 2)} Kg/Ha</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={insumo.valorUnidad || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow numbers and decimals, no negative values
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleInsumoValorChange(index, parseFloat(value) || 0);
                              }
                            }}
                            onKeyPress={(e) => {
                              // Allow control keys
                              if (e.key.length > 1) return;
                              // Only allow numbers and decimal point
                              if (!/[0-9.]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            sx={{ width: 120 }}
                            InputProps={{
                              startAdornment: <span style={{ marginRight: 4 }}>$</span>
                            }}
                            inputProps={{
                              inputMode: 'decimal',
                              pattern: '[0-9]*'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(insumo.valorTotal || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Parte B: Servicios */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: '50%',
                  fontWeight: 'bold'
                }}>
                  B
                </Box>
                {t("services")}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("labor")}</TableCell>
                      <TableCell>{t("item")}</TableCell>
                      <TableCell align="right">{t("quantity_ha")}</TableCell>
                      <TableCell align="right">{t("unit_value")}</TableCell>
                      <TableCell align="right">{t("total_value")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {servicios.map((servicio, index) => (
                      <TableRow key={servicio._id}>
                        <TableCell>{servicio.labor}</TableCell>
                        <TableCell>{servicio.item}</TableCell>
                        <TableCell align="right">$/Ha</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={servicio.valorUnidad || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow numbers and decimals, no negative values
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleServicioValorChange(index, parseFloat(value) || 0);
                              }
                            }}
                            onKeyPress={(e) => {
                              // Allow control keys
                              if (e.key.length > 1) return;
                              // Only allow numbers and decimal point
                              if (!/[0-9.]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            sx={{ width: 120 }}
                            InputProps={{
                              startAdornment: <span style={{ marginRight: 4 }}>$</span>
                            }}
                            inputProps={{
                              inputMode: 'decimal',
                              pattern: '[0-9]*'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(servicio.valorTotal || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                {t("complete_all_fields_message")}
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                {t("note")}: {t("values_shown_are_averages_per_hectare_for_campaign")}
              </Typography>
              {formData.has > 0 && (
                <Typography variant="caption" display="block" mt={0.5}>
                  <strong>Hectáreas del lote seleccionado: {formatNumber(formData.has, 2)} ha</strong>
                </Typography>
              )}
              {formData.has === 0 && (
                <Typography variant="caption" display="block" mt={0.5} color="error">
                  <strong>⚠️ Seleccione un lote para definir las hectáreas</strong>
                </Typography>
              )}
            </Alert>
            
            {servicios.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>⚠️ {t("no_services_found")}:</strong>{" "}
                  {t("no_services_in_campaign_activities")}{" "}
                  {t("create_planning_activities_with_services")}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            onClick={handleCancel}
          >
            {t("cancel")}
          </Button>
          {isEditMode && (
            <Button
              variant="outlined"
              color="success"
              onClick={handleExportToExcel}
              startIcon={<FileDownloadIcon />}
            >
              {t("export_to_excel")}
            </Button>
          )}
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
          >
            {t("save")}
          </Button>
        </Box>
      </Container>
    </TemplateLayout>
  );
};

const handleBack = () => {
  window.history.back();
}; 