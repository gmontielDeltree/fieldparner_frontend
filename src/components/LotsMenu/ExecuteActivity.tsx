import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
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

const activityTypeTranslations = {
  preparation: 'Preparado',
  sowing: 'Siembra',
  harvesting: 'Cosecha',
  application: 'Aplicacion',
}

const activityIcons = {
  sowing: <LocalFloristIcon sx={{ fontSize: 50, color: 'green' }} />,
  application: <GrassIcon sx={{ fontSize: 50, color: 'green' }} />,
  harvesting: <AgricultureIcon sx={{ fontSize: 50, color: 'green' }} />,
}

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
  console.log('ACTIVITY TYPE: ', activityType)
  if (!lot) return null
  const [formData, setFormData] = useState(
    existingActivity || getEmptyExecution(),
  )
  const { addNewStockMovement } = useStockMovement()
  const { confirmWithdrawalOrder } = useOrder()
  const { getSupplies } = useSupply()
  const [activeStep, setActiveStep] = useState(0)
  const translatedActivityType = activityTypeTranslations[activityType]
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
    activityType === 'sowing'
      ? [
        'General',
        'Insumos',
        'Otros Datos',
        'Servicios',
        'Condiciones',
        'Observaciones',
      ]
      : ['General', 'Insumos', 'Servicios', 'Condiciones', 'Observaciones']

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      actividad_uuid: existingActivity.uuid,
      ts_generacion: 0,
      tipo: translatedActivityType.toLowerCase(),
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
      tipo: translatedActivityType.toLowerCase(),
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas,
      },
    }))
  }, [lot, translatedActivityType, existingActivity])

  const countMissingFields = (formData, step) => {
    let missingFields = 0
    if (activityType !== 'sowing' && step > 1) {
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
        // if (!details.formacion_inoculado) {
        //   missingFields++;
        // }
        // if (!details.marca_inoculado) {
        //   missingFields++;
        // }
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
    if (activityType !== 'sowing' && step > 1) {
      step = step + 1
    }
    switch (step) {
      case 0:
        return (
          <PersonalForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
            showActivityType={activityType === 'application'}
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
        return <div>Unknown Step</div>
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
        movement: 'Ingreso por cosecha',
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
        detail: 'Ingreso por cosecha',
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
          `Error al realizar movimiento de stock para el insumo ${supplyInfo.name}:`,
          error,
        )
        throw error
      }
    }
  }

  const removeReservedStock = async (dosis) => {
    console.log('Removing reserved stock')

    if (!dosis.orden_de_retiro) {
      console.error('Withdrawal order not found on dosis object')
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
      console.log(`Reserved stock removed for supply ${(dosis.insumo || dosis.selectedOption)?.name}`)
    } catch (error) {
      console.error(
        `Error removing reserved stock for supply ${(dosis.insumo || dosis.selectedOption)?.name}:`,
        error,
      )
    }
  }

  const handleSave = async () => {
    let executionDetails = { ...formData };
    executionDetails.detalles.fecha_ejecucion = new Date().toISOString();
    executionDetails.estado = 'completada';

    console.log('EXECUTION DETAILS: ', executionDetails);

    // Lista para almacenar insumos sin stock
    const suppliesWithoutStock = [];

    // Validar stocks antes de proceder
    if (executionDetails.detalles.dosis) {
      for (const dosis of executionDetails.detalles.dosis) {
        const supplyInfo = dosis.insumo || dosis.selectedOption;

        if (!supplyInfo) {
          console.error('Supply information is missing for this dose', dosis);
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
          console.error(`Error al verificar stock para ${supplyInfo.name}:`, error);
          suppliesWithoutStock.push(supplyInfo.name);
        }
      }
    }

    // Si hay insumos sin stock, mostrar confirmación al usuario
    if (suppliesWithoutStock.length > 0) {
      const confirmContinue = await Swal.fire({
        title: '<span style="font-weight: 600">Stock insuficiente</span>',
        html: `
          <div class="swal-content">
            <p style="margin-bottom: 15px; color: #4a4a4a">No se encontró stock para los siguientes insumos:</p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 10px; margin-bottom: 15px; text-align: left; max-height: 150px; overflow-y: auto">
              ${suppliesWithoutStock.map(name => `
                <div style="padding: 8px; margin-bottom: 5px; border-left: 3px solid #ff9800; background-color: #fff">
                  <span style="color: #333; font-weight: 500">${name}</span>
                </div>
              `).join('')}
            </div>
            <p style="color: #4a4a4a">¿Deseas continuar con la ejecución de todas formas?</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check"></i> Continuar',
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
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
        console.log('DOSIS: ', dosis);

        // Fix: Check if dosis.insumo exists, if not, use dosis.selectedOption instead
        const supplyInfo = dosis.insumo || dosis.selectedOption;

        // Add additional validation to prevent errors
        if (!supplyInfo) {
          console.error('Supply information is missing for this dose', dosis);
          continue; // Skip this dose and continue with the next one
        }

        const newMovement = {
          movement: 'Salida por ejecución',
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
          detail: 'Salida por ejecución',
          operationDate: new Date().toISOString(),
          amount: Number(dosis.dosificacion || dosis.dosis), // Handle both property names
          voucher: '',
          currency: 'ARS',
          totalValue: 0,
          hours: '0',
          campaignId: executionDetails.campaña.campaignId,
        };

        try {
          console.log('New stock movement (out) for supply:', newMovement);
          await addNewStockMovement(newMovement, supplyInfo, dosis.deposito);

          // Solo intentar remover stock reservado si existe una orden de retiro
          if (dosis.orden_de_retiro) {
            await removeReservedStock(dosis);
          } else {
            console.warn(`No hay orden de retiro para el insumo ${supplyInfo.name}`);
          }
        } catch (error) {
          console.error(
            `Error al realizar movimiento de stock para el insumo ${supplyInfo.name}:`,
            error
          );

          // Mostrar mensaje pero continuar con el siguiente insumo
          Swal.fire({
            title: 'Error en movimiento de stock',
            text: `Hubo un problema al registrar el movimiento para ${supplyInfo.name}. La actividad se guardará igualmente.`,
            icon: 'warning',
            confirmButtonText: 'Continuar'
          });
        }
      }
    }

    if (executionDetails.tipo === HarvestType) {
      try {
        await processHarvestStockMovements(executionDetails);
      } catch (error) {
        console.error(
          'Error procesando movimientos de stock para cosecha:',
          error,
        );

        // Mostrar mensaje pero continuar
        Swal.fire({
          title: 'Error en cosecha',
          text: 'Hubo un problema al procesar los movimientos de stock para la cosecha. La actividad se guardará igualmente.',
          icon: 'warning',
          confirmButtonText: 'Continuar'
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
      console.error('Error generating new ID for execution:', error);
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
          console.error('Conflict detected, saving execution details:', error);

          Swal.fire({
            title: 'Conflicto detectado',
            text: 'Ya existe una ejecución con el mismo ID. La actividad no se guardará.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        } else if (error.name === 'not_found') {
          delete executionDetails._rev;
          db.put(executionDetails)
            .then(() => {
              console.log('New document created', 'success');

              Swal.fire({
                title: 'Actividad ejecutada',
                text: 'La ejecución se ha guardado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
              }).then(() => {
                backToActivites();
              });
            })
            .catch((err) => {
              console.error('Error creating new document:', err);

              Swal.fire({
                title: 'Error',
                text: 'No se pudo guardar la ejecución de la actividad.',
                icon: 'error',
                confirmButtonText: 'Entendido'
              });
            });
        } else {
          console.error('Error saving execution details:', error);

          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al guardar la ejecución.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      });
  };

  const ActivityIcon = activityIcons['sowing']

  return (
    <div>
      <ActivityHeader
        isEditing={isEditing}
        translatedActivityType={translatedActivityType}
        ActivityIcon={ActivityIcon}
        titleBg={titleBg}
        formData={formData}
        activityType={activityType}
        mode="execute"
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
      <div style={{ marginTop: '10px' }}>{getStepContent(activeStep)}</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1rem',
        }}
      >
        <Button color="secondary" onClick={handleBack}>
          {activeStep === 0 ? 'Cancelar' : 'Volver'}
        </Button>
        {activeStep < steps.length - 1 && (
          <Button color="primary" onClick={handleNext}>
            Siguiente
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button
            color="success"
            onClick={() => {
              handleSave()
            }}
          >
            Ejecutar actividad
          </Button>
        )}
      </div>
    </div>
  )
}

export default ExecuteActivity

function getStock(arg0: { id: string; campaignId: string; tipo: any; depositId: any; nroLot: any; location: any }) {
  throw new Error('Function not implemented.')
}
