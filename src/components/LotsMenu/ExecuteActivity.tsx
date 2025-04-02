import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardHeader,
  Step,
  StepLabel,
  Stepper,
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
import { keyframes } from '@emotion/react'
import { useTheme } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import { Ejecucion, Actividad } from '../../interfaces/activity'
import uuid4 from 'uuid4'
import { HarvestType, StockMovement, TypeMovement } from '../../types'
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

// Keep the raw activity types with the standard Spanish values
const ACTIVITY_TYPES = {
  preparation: "preparado",
  sowing: "siembra",
  harvesting: "cosecha",
  application: "aplicacion",
}

// Map from English input props to Spanish constants
const mapToSpanishType = (englishType) => {
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
  const { addNewStockMovement } = useStockMovement()
  const { confirmWithdrawalOrder } = useOrder()
  const { getSupplies } = useSupply()
  const [activeStep, setActiveStep] = useState(0)

  // First, ensure we map from English props to Spanish constants
  const spanishActivityType = mapToSpanishType(activityType);

  // Only translate for display purposes
  const activityTypeTranslations = {
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
      setFormData(existingActivity)
    } else {
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

  const countMissingFields = (formData, step) => {
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
        if (
          !formData.detalles ||
          !formData.detalles.dosis ||
          formData.detalles.dosis.length === 0
        ) {
          missingFields++
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
        if (
          !formData.detalles ||
          !formData.detalles.dosis ||
          formData.detalles.costo_labor.length === 0
        ) {
          missingFields++
        }
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
            lot={lot}
            formData={formData}
            setFormData={setFormData}
            isExecution={true}
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

  const updateActivityStateToCompleted = (activityId) => {
    return db
      .get(activityId)
      .then((activityDoc) => {
        activityDoc.estado = 'completada'
        return db.put(activityDoc)
      })
      .then(() => {
        console.log('Activity state updated to completed successfully')
      })
      .catch((error) => {
        console.error('Error updating activity state to completed:', error)
      })
  }

  const processHarvestStockMovements = async (executionDetails) => {
    for (const dosis of executionDetails.detalles.dosis) {
      // Fix: Check if dosis.insumo exists, if not, use dosis.selectedOption instead
      const supplyInfo = dosis.insumo || dosis.selectedOption

      // Add additional validation to prevent errors
      if (!supplyInfo) {
        console.error('Supply information is missing for this dose', dosis)
        continue // Skip this dose and continue with the next one
      }

      const newMovement = {
        movement: t('harvestEntry'),
        accountId: user?.accountId,
        supplyId: supplyInfo._id, // Use the updated reference
        userId: user?.id,
        depositId: dosis.deposito._id,
        location: '',
        nroLot: '',
        creationDate: new Date().toISOString(),
        dueDate: '',
        typeMovement: TypeMovement.Labores,
        isIncome: true,
        detail: t('harvestEntry'),
        operationDate: new Date().toISOString(),
        amount: Number(dosis.rinde_obtenido),
        voucher: '',
        currency: 'ARS',
        totalValue: 0,
        hours: '0',
        campaignId: executionDetails.campaña.campaignId,
      }

      try {
        await addNewStockMovement(newMovement, supplyInfo, dosis.deposito)
      } catch (error) {
        console.error(
          t('movementError', { supplyName: supplyInfo.name }),
          error,
        )
        throw error
      }
    }
  }

  const removeReservedStock = async (dosis) => {
    console.log(t('removingStock'))

    if (!dosis.orden_de_retiro) {
      console.error(t('noWithdrawalOrder'))
      return
    }

    const withdrawalOrder = dosis.orden_de_retiro
    const listWithdrawals = [
      {
        accountId: withdrawalOrder.accountId,
        amount: Number(dosis.total),
        originalAmount: Number(dosis.total),
        deposit: dosis.deposito,
        location: dosis.ubicacion,
        nroLot: dosis.nro_lote,
        order: withdrawalOrder.order,
        supply: dosis.insumo || dosis.selectedOption, // Fixed here as well
        withdrawalAmount: Number(dosis.total),
        _id: withdrawalOrder._id,
      },
    ]

    try {
      const withdrawalDate = new Date().toISOString()
      await confirmWithdrawalOrder(listWithdrawals, withdrawalDate)
      console.log(t('stockRemoved', { supplyName: (dosis.insumo || dosis.selectedOption)?.name }))
    } catch (error) {
      console.error(
        t('stockRemoveError', { supplyName: (dosis.insumo || dosis.selectedOption)?.name }),
        error,
      )
    }
  }

  const handleSave = async () => {
    let executionDetails = { ...formData };
    executionDetails.detalles.fecha_ejecucion = new Date().toISOString();
    executionDetails.estado = 'completada';

    // Ensure we're using the Spanish activity type, not the translated one
    executionDetails.tipo = rawActivityType;

    console.log(t('executionDetails'), executionDetails);

    // Lista para almacenar insumos sin stock
    const suppliesWithoutStock = [];

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
            campaignId: executionDetails.campaña.campaignId,
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
      const confirmContinue = await Swal.fire({
        title: `<span style="font-weight: 600">${t('insufficientStock')}</span>`,
        html: `
          <div class="swal-content">
            <p style="margin-bottom: 15px; color: #4a4a4a">${t('noStockFound')}</p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 10px; margin-bottom: 15px; text-align: left; max-height: 150px; overflow-y: auto">
              ${suppliesWithoutStock.map(name => `
                <div style="padding: 8px; margin-bottom: 5px; border-left: 3px solid #ff9800; background-color: #fff">
                  <span style="color: #333; font-weight: 500">${name}</span>
                </div>
              `).join('')}
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
        showClass: {
          popup: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut animate__faster'
        },
        customClass: {
          popup: 'swal-modern',
          title: 'swal-title',
          content: 'swal-content',
          confirmButton: 'swal-confirm-button',
          cancelButton: 'swal-cancel-button'
        },
        background: '#fff',
        borderRadius: 10,
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: false
      });

      if (!confirmContinue.isConfirmed) {
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

        const newMovement = {
          movement: t('executionExit'),
          accountId: user?.accountId,
          supplyId: supplyInfo._id, // Use the updated reference
          userId: user?.id,
          depositId: dosis.deposito._id,
          location: '',
          nroLot: '',
          creationDate: new Date().toISOString(),
          dueDate: '',
          typeMovement: TypeMovement.Labores,
          isIncome: false,
          detail: t('executionExit'),
          operationDate: new Date().toISOString(),
          amount: Number(dosis.dosificacion || dosis.dosis), // Handle both property names
          voucher: '',
          currency: 'ARS',
          totalValue: 0,
          hours: '0',
          campaignId: executionDetails.campaña.campaignId,
        };

        try {
          console.log(t('newMovement'), newMovement);
          await addNewStockMovement(newMovement, supplyInfo, dosis.deposito);

          // Solo intentar remover stock reservado si existe una orden de retiro
          if (dosis.orden_de_retiro) {
            await removeReservedStock(dosis);
          } else {
            console.warn(t('noOrder', { supplyName: supplyInfo.name }));
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
      return;
    }

    db.get(executionDetails._id)
      .then(() => {
        return updateActivityStateToCompleted(executionDetails.actividad_uuid);
      })
      .then((doc) => {
        executionDetails._rev = doc._rev;
        return db.put(executionDetails);
      })
      .catch((error) => {
        if (error.name === 'conflict') {
          console.error(t('conflictError'), error);

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
                backToActivites();
              });
            })
            .catch((err) => {
              console.error(t('docCreateError'), err);

              Swal.fire({
                title: t('error'),
                text: t('saveFailed'),
                icon: 'error',
                confirmButtonText: t('understood')
              });
            });
        } else {
          console.error(t('saveError'), error);

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

  return (
    <div className="container py-4">
      {/* Render the ActivityHeader directly without Card/CardHeader wrapping */}
      <div className="shadow-lg mb-4 rounded">
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

        <Stepper
          activeStep={activeStep}
          sx={{ pt: 3, pb: 5, backgroundColor: '#f5f5f5', borderRadius: '4px' }}
        >
          {steps.map((label, index) => (
            <Step key={label} onClick={handleStep(index)}>
              <StepLabel
                sx={{
                  color: 'primary.main',
                  '& .MuiStepLabel-label': {
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                  },
                }}
              >
                {label}
                {index <= maxStepReached && (
                  <Badge
                    badgeContent={countMissingFields(formData, index)}
                    color="error"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: -9,
                      transform: 'scale(1) translate(50%, -50%)',
                    }}
                  />
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <div style={{ marginTop: '10px', padding: '0 16px 16px' }}>{getStepContent(activeStep)}</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            padding: '0 16px 16px',
          }}
        >
          <Button color="secondary" onClick={handleBack}>
            {activeStep === 0 ? t('cancel') : t('back')}
          </Button>
          {activeStep < steps.length - 1 && (
            <Button color="primary" onClick={handleNext}>
              {t('next')}
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button
              color="success"
              onClick={() => {
                handleSave()
              }}
            >
              {t('executeActivity')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExecuteActivity

function getStock(arg0: { id: string; campaignId: string; tipo: any; depositId: any; nroLot: any; location: any }) {
  throw new Error('Function not implemented.')
}