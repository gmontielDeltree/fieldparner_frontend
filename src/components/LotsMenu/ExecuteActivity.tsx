import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/material'
import SuppliesForm from './forms/PlanForms/SuppliesForm'
import OtherDetailsForm from './forms/PlanForms/OtherDetailsForm'
import ServicesForm from './forms/PlanForms/ServicesForm'
import ConditionsForm from './forms/PlanForms/ConditionsForm'
import ObservationsForm from './forms/PlanForms/ObservationsForm'
import { getEmptyActivity, getEmptyExecution } from '../../interfaces/activity'
import { format, parse } from 'date-fns'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import GrassIcon from '@mui/icons-material/Grass'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import LandscapeIcon from '@mui/icons-material/Landscape'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import ErrorIcon from '@mui/icons-material/Error'
import { keyframes } from '@emotion/react'
import { useTheme } from '@mui/material/styles'
import { Ejecucion, Actividad } from '../../interfaces/activity'
import uuid4 from 'uuid4'
import { HarvestType, StockMovement, TypeMovement, WithdrawalOrder } from '../../types'
import {
  useAppSelector,
  useOrder,
  useStockMovement,
  useSupply,
} from '../../hooks'
import ActivityHeader from './components/ActivityHeader'
import PersonalForm from './forms/PlanForms/PersonalForm'
import { TipoStock } from '../../interfaces/stock'
import Swal from 'sweetalert2'
import { useTranslation } from "react-i18next";
import {
  Button as ReactstrapButton,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  Container,
  Progress,
} from 'reactstrap'
import {
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Check,
} from 'lucide-react'
import ValidationAlert from './ValidationAlert'
import { getShortDate } from '../../helpers/dates'

// Keep the raw activity types with the standard Spanish values
const ACTIVITY_TYPES = {
  preparation: "preparado",
  sowing: "siembra",
  harvesting: "cosecha",
  application: "aplicacion",
}

// Map from English input props to Spanish constants
const mapToSpanishType = (englishType: string): string => {
  switch (englishType) {
    case 'preparation': return ACTIVITY_TYPES.preparation;
    case 'sowing': return ACTIVITY_TYPES.sowing;
    case 'harvesting': return ACTIVITY_TYPES.harvesting;
    case 'application': return ACTIVITY_TYPES.application;
    default: return englishType;
  }
};

interface ExecuteActivityProps {
  activityType: string
  lot: any
  db: any
  fieldName: string
  backToActivites: () => void
  existingActivity: Actividad
}

const ExecuteActivity: React.FC<ExecuteActivityProps> = ({
  activityType,
  lot,
  db,
  fieldName,
  backToActivites,
  existingActivity,
}) => {
  const { t } = useTranslation();

  console.log('ACTIVITY TYPE: ', activityType)
  if (!lot) return null
  const [formData, setFormData] = useState(
    existingActivity || getEmptyExecution(),
  )
  const { addNewStockMovement, getStock } = useStockMovement()
  const { getOrderDetailByNumber, confirmAutomaticWithdrawalOrder } = useOrder();
  const { getSupplies } = useSupply()
  const [activeStep, setActiveStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [showValidationNotification, setShowValidationNotification] = useState(false)
  const [missingFieldsList, setMissingFieldsList] = useState([])

  // First, ensure we map from English props to Spanish constants
  const spanishActivityType = mapToSpanishType(activityType);

  // Only translate for display purposes
  const activityTypeTranslations: { [key: string]: string } = {
    "preparado": t('preparation'),
    "siembra": t('sowing'),
    "cosecha": t('harvesting'),
    "aplicacion": t('application'),
  }

  // Define activity icons with consistent styling to match PlanActivity
  const activityIcons = {
    sowing: <LocalFloristIcon sx={{ fontSize: 50, color: "white" }} />,
    application: <GrassIcon sx={{ fontSize: 50, color: "white" }} />,
    harvesting: <AgricultureIcon sx={{ fontSize: 50, color: "white" }} />,
    preparation: <LandscapeIcon sx={{ fontSize: 50, color: "white" }} />
  }

  // Get the displayed translated type for UI only
  const translatedActivityType = activityTypeTranslations[spanishActivityType];

  // Store the Spanish type for database
  const rawActivityType = spanishActivityType;

  const [maxStepReached, setMaxStepReached] = useState(0)
  const theme = useTheme()
  const { user } = useAppSelector((state) => state.auth)
  const isEditing = existingActivity && Object.keys(existingActivity).length > 0

  const floating = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `

  const titleBg = isEditing
    ? `linear-gradient(60deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`
    : `linear-gradient(45deg, #a0a0a0, #626262)`

  const steps =
    activityType === 'sowing' || spanishActivityType === 'siembra'
      ? [
        t('general'),
        t('supplies'),
        t('otherData'),
        t('services'),
        t('conditions'),
        t('observations'),
      ]
      : [
        t('general'),
        t('supplies'),
        t('services'),
        t('conditions'),
        t('observations'),
      ]

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      actividad_uuid: existingActivity.uuid,
      ts_generacion: 0,
      tipo: rawActivityType, // Use Spanish activity type for database
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas,
      },
    }))
  }, [])

  useEffect(() => {
    if (existingActivity) {
      console.log('🔄 CARGANDO ACTIVIDAD EXISTENTE:', existingActivity)
      console.log('📋 DOSIS EN ACTIVIDAD EXISTENTE:', existingActivity.detalles?.dosis)
      if (existingActivity.detalles?.dosis) {
        existingActivity.detalles.dosis.forEach((dosis, index) => {
          console.log(`📦 DOSIS ${index + 1}:`, dosis)
          console.log(`   ⚡ Orden de retiro:`, dosis.orden_de_retiro)
        })
      }
      setFormData(existingActivity)
    } else {
      console.log('📝 CREANDO ACTIVIDAD VACÍA')
      setFormData(getEmptyActivity())
    }
  }, [existingActivity])

  useEffect(() => {
    getSupplies()
  }, [])

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      uuid: uuid4(),
      actividad_uuid: existingActivity.uuid,
      ts_generacion: 0,
      tipo: rawActivityType, // Use Spanish activity type for database
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas,
      },
    }))
  }, [lot, rawActivityType, existingActivity])

  // Fixed handleStepClick function - copied from PlanActivity
  const handleStepClick = (index) => {
    if (index <= maxStepReached) {
      const currentStepValidation = getStepValidationStatus(activeStep)

      if (!currentStepValidation.isValid) {
        const missingFields = getMissingFieldsMessages(activeStep)
        setMissingFieldsList(missingFields)
        setShowValidationNotification(true)
        return
      }

      // Direct state updates instead of using the function from hook
      setActiveStep(index);
      setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, index));
    }
  }

  const getStepValidationStatus = (stepIndex) => {
    const missingFields = countMissingFields(formData, stepIndex)
    return {
      isValid: missingFields === 0,
      missingCount: missingFields,
    }
  }

  const getStepStatus = (stepIndex) => {
    if (stepIndex === activeStep) return 'current'
    if (stepIndex < activeStep) {
      const { isValid } = getStepValidationStatus(stepIndex)
      return isValid ? 'complete' : 'invalid'
    }
    if (stepIndex <= maxStepReached) return 'available'
    return 'upcoming'
  }

  const getStepStyle = (status) => {
    switch (status) {
      case 'complete':
        return {
          background: getActivityColor(),
          color: 'white',
          border: 'none',
        }
      case 'current':
        return {
          background: 'white',
          color: getActivityColor(),
          border: `2px solid ${getActivityColor()}`,
        }
      case 'invalid':
        return {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        }
      case 'upcoming':
        return {
          background: '#f3f4f6',
          color: '#6b7280',
          border: 'none',
        }
      default:
        return {
          background: '#e5e7eb',
          color: '#6b7280',
          border: 'none',
        }
    }
  }

  const countMissingFields = (formData: any, step: number) => {
    let missingFields = 0
    if (activityType !== 'sowing' && spanishActivityType !== 'siembra' && step > 1) {
      step = step + 1
    }
    switch (step) {
      case 0: // PersonalForm
        if (!formData.detalles.fecha_ejecucion_tentativa) {
          missingFields++
        }
        if (!formData.contratista) {
          missingFields++
        }
        if (!formData.detalles || !formData.detalles.hectareas) {
          missingFields++
        }
        break
      case 1: // SuppliesForm (Insumos)
        // T2-75: En cosecha, no es obligatorio agregar insumos
        if (formData.tipo !== 'cosecha' && spanishActivityType !== 'cosecha') {
          if (
            !formData.detalles ||
            !formData.detalles.dosis ||
            formData.detalles.dosis.length === 0
          ) {
            missingFields++
          }
        }
        break
      case 2: // OtherDetailsForm
        const details = formData.detalles || {}
        if (!details.densidad_objetivo) {
          missingFields++
        }
        if (!details.peso_1000) {
          missingFields++
        }
        if (!details.profundidad) {
          missingFields++
        }
        if (!details.tipo_siembra) {
          missingFields++
        }
        if (!details.distancia) {
          missingFields++
        }
        break
      case 3: // ServicesForm (Labores)
        // Los servicios no son obligatorios en ninguna actividad
        // Comentado para evitar validación obligatoria
        // if (
        //   !formData.detalles ||
        //   !formData.detalles.servicios ||
        //   formData.detalles.servicios.length === 0
        // ) {
        //   missingFields++
        // }
        break
      case 4: // ConditionsForm
        const condiciones = formData.condiciones || {}
        if (condiciones.humedad_max === undefined) {
          missingFields++
        }
        if (condiciones.humedad_min === undefined) {
          missingFields++
        }
        if (condiciones.temperatura_max === undefined) {
          missingFields++
        }
        if (condiciones.temperatura_min === undefined) {
          missingFields++
        }
        if (condiciones.velocidad_max === undefined) {
          missingFields++
        }
        if (condiciones.velocidad_min === undefined) {
          missingFields++
        }
        break
      default:
        break
    }

    return missingFields
  }

  const getStepContent = (step: number) => {
    if (activityType !== 'sowing' && spanishActivityType !== 'siembra' && step > 1) {
      step = step + 1
    }
    switch (step) {
      case 0:
        console.log('ExecuteActivity - Rendering PersonalForm with:', {
          mode: 'execute',
          activityType,
          spanishActivityType,
          rawActivityType,
          'formData.tipo': formData.tipo,
          formData
        });
        return (
          <PersonalForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
            showActivityType={activityType === 'application' || spanishActivityType === 'aplicacion'}
            mode="execute"
          />
        )
      case 1:
        return (
          <SuppliesForm
            lot={lot}
            db={db}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 2:
        return (
          <OtherDetailsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 3:
        return (
          <ServicesForm
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 4:
        return (
          <ConditionsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 5:
        return (
          <ObservationsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        )
      default:
        return <div>{t('unknownStep')}</div>
    }
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep + 1
      setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, nextStep))
      return nextStep
    })
  }

  const handleBack = () => {
    if (activeStep === 0) {
      backToActivites()
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }
  }

  const handleStep = (step: number) => () => {
    setActiveStep(step)
    setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, step))
  }

  const updateActivityStateToCompleted = (activityId: string) => {
    return db
      .get(activityId)
      .then((activityDoc: any) => {
        activityDoc.estado = 'completada'
        return db.put(activityDoc)
      })
      .then(() => {
        console.log('Activity state updated to completed successfully')
      })
      .catch((error: any) => {
        console.error('Error updating activity state to completed:', error)
      })
  }

  const processHarvestStockMovements = async (executionDetails: any) => {
    // T2-76: Grabar cultivo en stock al ejecutar cosecha
    const cultivo = executionDetails.detalles?.cultivo
    const deposito = executionDetails.detalles?.deposito
    const rindeObtenido = executionDetails.detalles?.rinde_obtenido
    const hectareas = executionDetails.detalles?.hectareas || 0

    if (!cultivo) {
      console.error('Crop information is missing for harvest', executionDetails)
      return
    }

    if (!deposito) {
      console.error('Deposit information is missing for harvest', executionDetails)
      return
    }

    if (!rindeObtenido || rindeObtenido <= 0) {
      console.error('Yield obtained is missing or invalid for harvest', executionDetails)
      return
    }

    // Calcular la cantidad total cosechada (rendimiento * hectáreas)
    const cantidadTotal = Number(rindeObtenido) * Number(hectareas)

    const harvestMovement: StockMovement = {
      movement: t('harvestEntry'),
      accountId: user?.accountId || '',
      supplyId: cultivo._id || cultivo.id,
      userId: user?.id || '',
      depositId: deposito._id || deposito.id,
      location: deposito.location || '',
      nroLot: '',
      creationDate: new Date().toISOString(),
      dueDate: '',
      typeMovement: TypeMovement.Labores,
      isIncome: true,
      isCrop: true, // T2-76: Marcar como cultivo, no insumo
      detail: t('harvestEntry') + ' - ' + (cultivo.descriptionES || cultivo.name || ''),
      operationDate: new Date().toISOString(),
      amount: cantidadTotal,
      voucher: '',
      currency: 'ARS',
      totalValue: 0,
      hours: '0',
      campaignId: executionDetails.campaña?.campaignId || '',
    }

    try {
      // Usar la función createCropStockMovement de staging si existe, sino usar addNewStockMovement
      await createCropStockMovement(harvestMovement, cultivo, deposito)
      console.log(t('Harvest stock movement created successfully for crop'), cultivo.name || cultivo.descriptionES)
    } catch (error) {
      console.error(
        t('movementError', { supplyName: cultivo.name || cultivo.descriptionES }),
        error,
      )
      throw error
    }
  }

  const createCropStockMovement = async (movement: StockMovement, cropInfo: any, depositoInfo: any) => {
    // Crear movimiento de stock manualmente para cultivos
    try {
      // 1. Crear registro en stockMovements
      const movementResult = await db.stockMovements.post(movement);
      console.log('✅ Movimiento de stock creado:', movementResult);

      // 2. Buscar stock existente de cultivo
      const existingStockQuery = {
        selector: {
          accountId: user?.accountId || '',
          id: cropInfo._id,
          depositId: depositoInfo._id,
          tipo: TipoStock.CULTIVO,
          campaignId: movement.campaignId
        }
      };

      let existingStock = null;
      try {
        const stockResults = await db.stock.find(existingStockQuery);
        existingStock = stockResults.docs.length > 0 ? stockResults.docs[0] : null;
      } catch (error) {
        console.log('No se encontró stock existente, se creará nuevo registro');
      }

      // 3. Crear o actualizar stock de cultivo
      if (existingStock) {
        // Actualizar stock existente
        existingStock.currentStock += movement.amount;
        existingStock.lastUpdate = new Date().toISOString();
        await db.stock.put(existingStock);
        console.log('✅ Stock de cultivo actualizado:', existingStock);
      } else {
        // Crear nuevo registro de stock
        const newStock = {
          accountId: user?.accountId || '',
          id: cropInfo._id,
          nroLot: movement.nroLot || '',
          depositId: depositoInfo._id,
          location: movement.location || depositoInfo.location || '',
          currentStock: movement.amount,
          campaignId: movement.campaignId,
          fieldId: "",
          fieldLot: "",
          tipo: TipoStock.CULTIVO,
          lastUpdate: new Date().toISOString(),
          reservedStock: 0
        };

        const stockResult = await db.stock.post(newStock);
        console.log('✅ Nuevo stock de cultivo creado:', stockResult);
      }

      return true;
    } catch (error) {
      console.error('❌ Error creando movimiento de stock para cultivo:', error);
      throw error;
    }
  };
  //TODO: revisar si es necesario dejar este metodo , ya q se hace todo en initConfirmWithdrawal
  const removeReservedStock = async (dosis: any) => {
    console.log(t('removingStock'))

    if (!dosis.orden_de_retiro) {
      console.error(t('noWithdrawalOrder'))
      return
    }

    // Check if database context is available
    if (!db || !db.withdrawalOrders || !db.depositSupplyOrder) {
      console.error('Database context not available:', { db, withdrawalOrders: db?.withdrawalOrders, depositSupplyOrder: db?.depositSupplyOrder });
      return;
    }

    try {
      // Get the complete withdrawal order from database
      console.log('Searching for withdrawal order with query:', {
        accountId: user.accountId,
        order: dosis.orden_de_retiro.order
      });

      const withdrawalOrderResponse = await db.withdrawalOrders.find({
        selector: {
          "$and": [
            { "accountId": user.accountId },
            { "order": dosis.orden_de_retiro.order }
          ]
        }
      });

      console.log('Withdrawal order response:', withdrawalOrderResponse);

      if (!withdrawalOrderResponse || !withdrawalOrderResponse.docs) {
        console.error('Invalid withdrawal order response structure:', withdrawalOrderResponse);
        return;
      }

      if (!withdrawalOrderResponse.docs.length) {
        console.error('Withdrawal order not found in database');
        return;
      }

      const withdrawalOrder = withdrawalOrderResponse.docs[0];

      // Get the corresponding deposit supply order
      console.log('Searching for deposit supply order with query:', {
        accountId: user.accountId,
        order: withdrawalOrder.order,
        supplyId: (dosis.insumo || dosis.selectedOption)?._id
      });

      const depositSupplyResponse = await db.depositSupplyOrder.find({
        selector: {
          "$and": [
            { "accountId": user.accountId },
            { "order": withdrawalOrder.order },
            { "supplyId": (dosis.insumo || dosis.selectedOption)?._id }
          ]
        }
      });

      console.log('Deposit supply order response:', depositSupplyResponse);

      if (!depositSupplyResponse || !depositSupplyResponse.docs) {
        console.error('Invalid deposit supply order response structure:', depositSupplyResponse);
        return;
      }

      if (!depositSupplyResponse.docs.length) {
        console.error('Deposit supply order not found');
        return;
      }

      const depositSupplyOrder = depositSupplyResponse.docs[0];

      const listWithdrawals = [
        {
          accountId: withdrawalOrder.accountId,
          amount: Number(dosis.total),
          originalAmount: Number(dosis.total),
          deposit: dosis.deposito,
          location: dosis.ubicacion,
          nroLot: dosis.nro_lote,
          order: withdrawalOrder.order,
          supply: dosis.insumo || dosis.selectedOption,
          withdrawalAmount: depositSupplyOrder.withdrawalAmount || 0,
          _id: depositSupplyOrder._id,
          depositId: dosis.deposito._id,
          supplyId: (dosis.insumo || dosis.selectedOption)?._id,
        },
      ]

      const withdrawalDate = new Date().toISOString()
      await confirmAutomaticWithdrawalOrder(withdrawalOrder, listWithdrawals, withdrawalDate)
      console.log(t('stockRemoved', { supplyName: (dosis.insumo || dosis.selectedOption)?.name }))
    } catch (error) {
      console.error(
        t('stockRemoveError', { supplyName: (dosis.insumo || dosis.selectedOption)?.name }),
        error,
      )
    }
  }

  const initConfirmWithdrawal = async (confirmOrder: WithdrawalOrder) => {
    //Buscamos la orden de retiro y sus insumos a retirar:
    const orderDetails = await getOrderDetailByNumber(confirmOrder.order);
    console.log("Detalles de la orden de retiro: ", orderDetails);
    if (!orderDetails || !orderDetails.withdrawalOrder || !orderDetails.suppliesOfTheOrder) {
      console.error("No se encontraron detalles para la orden de retiro.");
      return;
    }
    await confirmAutomaticWithdrawalOrder(orderDetails.withdrawalOrder, orderDetails.suppliesOfTheOrder, getShortDate());
  };

  const handleSave = async () => {
    // Prevent multiple clicks
    if (isSaving) {
      console.log("Save already in progress, ignoring additional click");
      return;
    }

    // Set saving state immediately
    setIsSaving(true);

    let executionDetails = { ...formData };
    executionDetails.detalles.fecha_ejecucion = new Date().toISOString();
    executionDetails.estado = 'completada';

    // Ensure we're using the Spanish activity type, not the translated one
    executionDetails.tipo = rawActivityType;

    console.log(t('executionDetails'), executionDetails);

    // Lista para almacenar insumos sin stock
    const suppliesWithoutStock: string[] = [];

    // Validar stocks antes de proceder
    if (executionDetails.detalles.dosis) {
      for (const dosis of executionDetails.detalles.dosis) {
        const supplyInfo = dosis.insumo || dosis.selectedOption;

        if (!supplyInfo) {
          console.error(t('missingSupply'), dosis);
          continue;
        }

        try {
          // Verificar si existe stock
          const responseStockSupply = await getStock({
            id: supplyInfo._id,
            campaignId: executionDetails.campaña?.campaignId || '',
            tipo: TipoStock.INSUMO,
            depositId: dosis.deposito._id,
            nroLot: dosis.nro_lote,
            location: dosis.ubicacion
          });

          if (!responseStockSupply || responseStockSupply.length === 0) {
            suppliesWithoutStock.push(supplyInfo.name);
          }
        } catch (error) {
          console.error(t('stockCheckError', { supplyName: supplyInfo.name }), error);
          suppliesWithoutStock.push(supplyInfo.name);
        }
      }
    }

    // Si hay insumos sin stock, mostrar confirmación al usuario
    if (suppliesWithoutStock.length > 0) {
      const suppliesListHtml: string = suppliesWithoutStock.map((name: string) => `
        <div style="padding: 8px; margin-bottom: 5px; border-left: 3px solid #ff9800; background-color: #fff">
          <span style="color: #333; font-weight: 500">${name}</span>
        </div>
      `).join('');

      const confirmContinue = await Swal.fire({
        title: `<span style="font-weight: 600">${t('insufficientStock')}</span>`,
        html: `
          <div class="swal-content">
            <p style="margin-bottom: 15px; color: #4a4a4a">${t('noStockFound')}</p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 10px; margin-bottom: 15px; text-align: left; max-height: 150px; overflow-y: auto">
              ${suppliesListHtml}
            </div>
            <p style="color: #4a4a4a">${t('continueQuestion')}</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `<i class="fas fa-check"></i> ${t('continue')}`,
        cancelButtonText: `<i class="fas fa-times"></i> ${t('cancel')}`,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#f44336',
        buttonsStyling: true,
        customClass: {
          popup: 'swal-modern',
          title: 'swal-title',
          confirmButton: 'swal-confirm-button',
          cancelButton: 'swal-cancel-button'
        },
        background: '#fff',
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: false
      });

      if (!confirmContinue.isConfirmed) {
        setIsSaving(false);
        return; // El usuario canceló la operación
      }
    }

    // Generate new stock movement (out) for each of the supplies used in the execution
    if (executionDetails.detalles.dosis) {
      for (const dosis of executionDetails.detalles.dosis) {
        console.log(t('dose'), dosis);

        // Fix: Check if dosis.insumo exists, if not, use dosis.selectedOption instead
        const supplyInfo = dosis.insumo || dosis.selectedOption;

        // Add additional validation to prevent errors
        if (!supplyInfo) {
          console.error(t('missingSupply'), dosis);
          continue; // Skip this dose and continue with the next one
        }

        // T2-70: Usar cantidad total en lugar de cantidadxHa para descuento de stock
        // T2-71: Grabar depósito al descontar stock

        // Debug: Log para verificar valores disponibles
        console.log('🔍 DEBUG DESCUENTO STOCK:')
        console.log('  dosis.total:', dosis.total)
        console.log('  dosis.dosificacion:', dosis.dosificacion)
        console.log('  dosis.dosis:', dosis.dosis)
        console.log('  dosis.orden_de_retiro:', dosis.orden_de_retiro)
        console.log('  dosis completo:', dosis)

        // Verificar si existe stock actual antes de intentar crear el movimiento
        const stockQuery = {
          id: supplyInfo._id,
          campaignId: executionDetails.campaña?.campaignId || '',
          tipo: TipoStock.INSUMO,
          depositId: dosis.deposito._id,
          nroLot: dosis.nro_lote,
          location: dosis.ubicacion
        };
        console.log('  🔍 Consultando stock con query:', stockQuery);

        try {
          const stockResponse = await getStock(stockQuery);
          console.log('  📦 Stock encontrado:', stockResponse);
        } catch (error) {
          console.log('  ❌ Error consultando stock:', error);
        }

        // Usar cantidad total, priorizando 'total' que es el campo correcto
        const stockAmount = Number(dosis.total || dosis.dosificacion || dosis.dosis)
        console.log('  📊 Cantidad a descontar del stock:', stockAmount)

        const newMovement: StockMovement = {
          movement: t('executionExit'),
          accountId: user?.accountId || '',
          supplyId: supplyInfo._id,
          userId: user?.id || '',
          depositId: dosis.deposito?._id || '', // T2-71: Grabar depósito
          location: dosis.ubicacion || '', // T2-71: Grabar ubicación
          nroLot: dosis.nro_lote || '', // T2-71: Grabar nro lote
          creationDate: new Date().toISOString(),
          dueDate: '',
          typeMovement: TypeMovement.Labores,
          isIncome: false,
          isCrop: false,
          detail: t('executionExit'),
          operationDate: new Date().toISOString(),
          amount: stockAmount, // T2-70: Usar cantidad total
          voucher: '',
          currency: 'ARS',
          totalValue: 0,
          hours: '0',
          campaignId: executionDetails.campaña?.campaignId || '',
        };
        
        try {
          console.log(t('newMovement'), newMovement);

          if (dosis.orden_de_retiro) {
            console.log('Usando orden de retiro existente para:', supplyInfo.name);
            // await removeReservedStock(dosis);
            initConfirmWithdrawal(dosis.orden_de_retiro as WithdrawalOrder);
          } else {
            // Si no hay orden de retiro, usar el flujo normal de stock movement
            console.log('No hay orden de retiro, usando flujo normal de stock para:', supplyInfo.name);
            await addNewStockMovement(newMovement, supplyInfo as any, dosis.deposito);
          }
        } catch (error) {
          console.error(
            t('movementError', { supplyName: supplyInfo.name }),
            error
          );

          // Mostrar mensaje pero continuar con el siguiente insumo
          Swal.fire({
            title: t('movementErrorTitle'),
            text: t('movementProblem', { supplyName: supplyInfo.name }),
            icon: 'warning',
            confirmButtonText: t('continue')
          });
        }
      }
    }

    if (executionDetails.tipo === HarvestType) {
      try {
        await processHarvestStockMovements(executionDetails);
      } catch (error) {
        console.error(
          t('harvestError'),
          error,
        );

        // Mostrar mensaje pero continuar
        Swal.fire({
          title: t('harvestErrorTitle'),
          text: t('harvestProblem'),
          icon: 'warning',
          confirmButtonText: t('continue')
        });
      }
    }

    try {
      const formattedDate = format(
        new Date(executionDetails.detalles.fecha_ejecucion_tentativa),
        'yyyy-MM-dd',
      );
      executionDetails._id =
        'ejecucion:' + formattedDate + ':' + executionDetails.uuid;
    } catch (error) {
      console.error(t('idError'), error);
      setIsSaving(false);
      return;
    }

    db.get(executionDetails._id)
      .then(() => {
        return updateActivityStateToCompleted(executionDetails.uuid);
      })
      .then((doc: any) => {
        executionDetails._rev = doc._rev;
        return db.put(executionDetails);
      })
      .catch((error: any) => {
        if (error.name === 'conflict') {
          console.error(t('conflictError'), error);
          setIsSaving(false);

          Swal.fire({
            title: t('conflictDetected'),
            text: t('executionExists'),
            icon: 'error',
            confirmButtonText: t('understood')
          });
        } else if (error.name === 'not_found') {
          delete executionDetails._rev;
          db.put(executionDetails)
            .then(() => {
              console.log(t('documentCreated'), 'success');

              Swal.fire({
                title: t('activityExecuted'),
                text: t('executionSaved'),
                icon: 'success',
                confirmButtonText: t('accept')
              }).then(() => {
                setIsSaving(false);
                backToActivites();
              });
            })
            .catch((err: any) => {
              console.error(t('docCreateError'), err);
              setIsSaving(false);

              Swal.fire({
                title: t('error'),
                text: t('saveFailed'),
                icon: 'error',
                confirmButtonText: t('understood')
              });
            });
        } else {
          console.error(t('saveError'), error);
          setIsSaving(false);

          Swal.fire({
            title: t('error'),
            text: t('executionSaveError'),
            icon: 'error',
            confirmButtonText: t('understood')
          });
        }
      });
  };

  // Use our helper function to get color based on activity type
  const getActivityColor = () => {
    switch (activityType) {
      case 'sowing':
        return '#10b981';
      case 'application':
        return '#3b82f6';
      case 'harvesting':
        return '#f59e0b';
      case 'preparation':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getProgressColor = () => {
    switch (activityType) {
      case 'sowing':
        return 'success'
      case 'application':
        return 'info'
      case 'harvesting':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getMissingFieldsMessages = (step) => {
    const fields = []
    const formDetails = formData.detalles || {}
    const currentStepName = steps[step]

    switch (currentStepName) {
      case t('general'):
        if (!formDetails.fecha_ejecucion_tentativa) fields.push(t('executionDate'))
        if (!formData.contratista) fields.push(t('contractor'))
        if (!formDetails.hectareas) fields.push(t('hectares'))
        break

      case t('supplies'):
        // T2-75: En cosecha, no es obligatorio agregar insumos
        if (formData.tipo !== 'cosecha' && spanishActivityType !== 'cosecha') {
          if (!formDetails.dosis || formDetails.dosis.length === 0) {
            fields.push(t('atLeastOneSupply'))
          }
        }
        break

      case t('services'):
        // Los servicios no son obligatorios en ninguna actividad
        // Comentado para evitar validación obligatoria
        // if (!formDetails.servicios || formDetails.servicios.length === 0) {
        //   fields.push(t('atLeastOneService'))
        // }
        break

      case t('conditions'):
        const condiciones = formData.condiciones || {}
        if (condiciones.humedad_max === undefined) fields.push(t('maxHumidity'))
        if (condiciones.humedad_min === undefined) fields.push(t('minHumidity'))
        if (condiciones.temperatura_max === undefined) fields.push(t('maxTemperature'))
        if (condiciones.temperatura_min === undefined) fields.push(t('minTemperature'))
        if (condiciones.velocidad_max === undefined) fields.push(t('maxSpeed'))
        if (condiciones.velocidad_min === undefined) fields.push(t('minSpeed'))
        break
    }

    return fields
  }

  return (
    <Container className="py-6">
      <Card className="shadow-lg">
        {/* Header */}
        <CardHeader
          className="p-0"
          style={{
            borderTopLeftRadius: '0.5rem',
            borderTopRightRadius: '0.5rem',
          }}
        >
          <ActivityHeader
            activityType={activityType}
            fieldName={fieldName}
            lot={lot}
            formData={formData}
            activityIcons={activityIcons}
            mode="execute"
            isEditing={isEditing}
            getActivityColor={getActivityColor}
          />
        </CardHeader>

        {/* Stepper */}
        <div className="px-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              const { isValid, missingCount } = getStepValidationStatus(index)
              const tooltipText =
                !isValid && index < activeStep
                  ? t('missingRequiredFields', { count: missingCount, stepName: step })
                  : ''

              return (
                <div
                  key={step}
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
                    title={tooltipText}
                  >
                    {status === 'complete' ? (
                      <Check size={20} />
                    ) : status === 'invalid' ? (
                      <AlertCircle size={20} />
                    ) : (
                      <span style={{ fontWeight: '600' }}>{index + 1}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <small
                      className={status === 'invalid' ? 'text-danger' : 'text-muted'}
                      style={{
                        fontWeight: status === 'current' ? '600' : '400',
                      }}
                    >
                      {step}
                    </small>
                  </div>

                  {index < steps.length - 1 && (
                    <Progress
                      value={index < activeStep ? 100 : 0}
                      color={status === 'invalid' ? 'danger' : getProgressColor()}
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
              )
            })}
          </div>
        </div>

        {/* Content */}
        <CardBody className="p-4">
          {getStepContent(activeStep)}
        </CardBody>

        {/* Actions */}
        <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
          <ReactstrapButton
            color="light"
            onClick={handleBack}
            className="d-flex align-items-center gap-2"
            disabled={isSaving}
          >
            <ChevronLeft size={16} />
            {activeStep === 0 ? t('cancel') : t('back')}
          </ReactstrapButton>

          <div className="d-flex gap-2">
            {activeStep < steps.length - 1 ? (
              <ReactstrapButton
                color="primary"
                onClick={() => {
                  const currentStepValidation = getStepValidationStatus(activeStep)
                  if (!currentStepValidation.isValid) {
                    const missingFields = getMissingFieldsMessages(activeStep)
                    setMissingFieldsList(missingFields)
                    setShowValidationNotification(true)
                    return
                  }
                  handleNext()
                }}
                className="d-flex align-items-center gap-2"
                disabled={isSaving}
              >
                {t('next')}
                <ChevronRight size={16} />
              </ReactstrapButton>
            ) : (
              <ReactstrapButton
                color={getProgressColor()}
                onClick={handleSave}
                disabled={isSaving}
                id="save-activity-button"
              >
                {isSaving ? (
                  <span className="d-flex align-items-center">
                    <Spinner size="sm" className="me-2" />
                    {t('saving')}
                  </span>
                ) : (
                  <span>{t('executeActivity')}</span>
                )}
              </ReactstrapButton>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Validation Alert */}
      {showValidationNotification && (
        <ValidationAlert
          isOpen={showValidationNotification}
          onClose={() => setShowValidationNotification(false)}
          currentStep={steps[activeStep]}
          requiredFields={missingFieldsList}
        />
      )}
    </Container>
  )
}

export default ExecuteActivity