import { format } from 'date-fns'
import {
  SowingType,
  PreparedType,
  HarvestType,
  ApplicationType,
  WithdrawalOrderType,
} from '../../../types'

// Define the standard Spanish activity types
const ACTIVITY_TYPES = {
  preparation: "preparado",
  sowing: "siembra",
  harvesting: "cosecha",
  application: "aplicacion",
}

export const reserveSupplyStock = async (
  dosis,
  user,
  selectedCampaign,
  createWithdrawalOrder,
) => {
  const newWithdrawalOrder = {
    accountId: user.accountId,
    type: WithdrawalOrderType.Labor,
    creationDate: new Date().toISOString(),
    order: 0,
    reason: 'Reserva de stock',
    campaign: selectedCampaign,
    field: dosis.insumo.campo,
    state: 'pending',
  }

  const newDepositSupplyOrder = {
    order: 0,
    accountId: user.accountId,
    deposit: dosis.deposito,
    location: dosis.ubicacion,
    supply: dosis.insumo,
    nroLot: dosis.nro_lote,
    withdrawalAmount: dosis.total,
    originalAmount: dosis.total,
  }

  const success = await createWithdrawalOrder(newWithdrawalOrder, [
    newDepositSupplyOrder,
  ])
  if (success) {
    dosis.orden_de_retiro = newWithdrawalOrder
    return newWithdrawalOrder
  } else {
    throw new Error(`Error reserving stock for supply ${dosis.insumo.name}`)
  }
}

export const saveActivity = async (
  actividad,
  isEditing,
  db,
  user,
  selectedCampaign,
  createWithdrawalOrder,
  backToActivites,
) => {
  // Map any raw English or translated Portuguese activity types to the standard Spanish values
  const normalizeActivityType = (tipo) => {
    // Convert English types to Spanish
    if (tipo === 'preparation' || tipo === 'preparação') {
      return ACTIVITY_TYPES.preparation; // "preparado"
    } else if (tipo === 'sowing' || tipo === 'semeadura') {
      return ACTIVITY_TYPES.sowing; // "siembra"
    } else if (tipo === 'harvesting' || tipo === 'colheita') {
      return ACTIVITY_TYPES.harvesting; // "cosecha"
    } else if (tipo === 'application' || tipo === 'aplicação') {
      return ACTIVITY_TYPES.application; // "aplicacion"
    }

    // If it's already one of our Spanish values, return it
    if (Object.values(ACTIVITY_TYPES).includes(tipo)) {
      return tipo;
    }

    // Default fallback
    return tipo;
  };

  // Normalize the activity type to ensure Spanish values
  actividad.tipo = normalizeActivityType(actividad.tipo);

  // Check if we need to add campaign info
  const validActivityTypes = [
    ACTIVITY_TYPES.sowing,      // "siembra"
    ACTIVITY_TYPES.preparation, // "preparado"
    ACTIVITY_TYPES.harvesting,  // "cosecha"
    ACTIVITY_TYPES.application  // "aplicacion"
  ];

  if (validActivityTypes.includes(actividad.tipo)) {
    actividad.campaña = selectedCampaign;
  }

  if (!isEditing) {
    try {
      const fechaEjecucion = actividad.detalles.fecha_ejecucion_tentativa
      const parsedDate = new Date(fechaEjecucion)
      const formattedDate = format(parsedDate, 'yyyy-MM-dd')
      actividad._id = 'actividad:' + formattedDate + ':' + actividad.uuid
    } catch (error) {
      console.error('Error generating new ID for activity:', error)
      return
    }
  }

  try {
    const doc = await db.get(actividad._id)
    actividad._rev = doc._rev
    await db.put(actividad)
    console.log('Actividad guardada', 'success')
    backToActivites()
  } catch (error) {
    if (error.name === 'not_found') {
      console.log('Actividad not found. Creating a new one.')
      delete actividad._rev
      try {
        await db.put(actividad)
        console.log('New actividad created', 'success')

        if (actividad.detalles.dosis) {
          for (const dosis of actividad.detalles.dosis) {
            try {
              await reserveSupplyStock(
                dosis,
                user,
                selectedCampaign,
                createWithdrawalOrder,
              )
            } catch (error) {
              console.error(
                `Error reserving stock for supply ${dosis.insumo.name}:`,
                error,
              )
              return
            }
          }
        }

        backToActivites()
      } catch (err) {
        console.error('Error creating new actividad:', err)
      }
    } else if (error.name === 'conflict') {
      console.error('Conflict detected. Trying to save again.')
    } else {
      console.error('Error saving actividad:', error)
    }
  }
}