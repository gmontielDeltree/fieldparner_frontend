// activityService.ts
import { format } from 'date-fns'
import {
  SowingType,
  PreparedType,
  HarvestType,
  ApplicationType,
  WithdrawalOrderType,
} from '../../../types'

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
  if (
    [SowingType, PreparedType, HarvestType, ApplicationType].includes(
      actividad.tipo,
    )
  ) {
    actividad.campaña = selectedCampaign
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
