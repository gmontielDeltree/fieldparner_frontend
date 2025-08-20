import { format } from 'date-fns'
import {
  SowingType,
  PreparedType,
  HarvestType,
  ApplicationType,
  WithdrawalOrderType,
  WithdrawalOrder,
  OrderStatus,
} from '../../../types'

// Define the standard Spanish activity types
const ACTIVITY_TYPES = {
  preparation: "preparado",
  sowing: "siembra",
  harvesting: "cosecha",
  application: "aplicacion",
}

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

export const reserveSupplyStock = async (
  contratista,
  dosis,
  user,
  selectedCampaign,
  createWithdrawalOrder,
) => {
  // Check for required data
  if (!dosis.insumo) {
    console.error('Supply object is missing in dosis:', dosis);
    throw new Error('Supply information is missing');
  }

  // Log for debugging
  console.log('Creating withdrawal order with:', {
    supply: dosis.insumo.name,
    deposit: dosis.deposito,
    location: dosis.ubicacion
  });

  // Get the field information
  const field = dosis.insumo.campo;

  console.log('reserveSupplyStock: selectedCampaign data:', selectedCampaign);
  
  const newWithdrawalOrder: WithdrawalOrder = {
    accountId: user.accountId,
    type: WithdrawalOrderType.Automatica,
    creationDate: new Date().toISOString(),
    order: 0,
    reason: 'Reserva de stock',
    campaignId: selectedCampaign?.campaignId,
    field: field, // Use field from insumo
    state: OrderStatus.Pending,
    withdrawId: contratista._id,
  }
  
  console.log('reserveSupplyStock: newWithdrawalOrder data:', newWithdrawalOrder);

  const newDepositSupplyOrder = {
    order: 0,
    accountId: user.accountId,
    deposit: dosis.deposito,
    depositId: dosis.deposito._id,
    supplyId: dosis.insumo._id,
    location: dosis.ubicacion,
    supply: dosis.insumo,
    nroLot: dosis.nro_lote,
    withdrawalAmount: dosis.total,
    originalAmount: dosis.total,
  }

  try {
    const createdOrder = await createWithdrawalOrder(newWithdrawalOrder, [
      newDepositSupplyOrder,
    ])
    if (createdOrder) {
      dosis.orden_de_retiro = createdOrder
      return createdOrder
    } else {
      throw new Error(`Error reserving stock for supply ${dosis.insumo.name || 'unknown'}`)
    }
  } catch (error) {
    console.error('Error in createWithdrawalOrder:', error);
    throw error;
  }
}

// Helper function to standardize supply data
const standardizeSupplyData = (dosis) => {
  // If we have selectedOption but not insumo, transfer the data
  if (dosis.selectedOption && !dosis.insumo) {
    dosis.insumo = dosis.selectedOption;
    delete dosis.selectedOption; // Remove the old property
  }
  return dosis;
};

export const saveActivity = async (
  actividad,
  isEditing,
  db,
  user,
  selectedCampaign,
  createWithdrawalOrder,
  backToActivites,
) => {
  console.log("saveActivity: Starting to save activity");
  
  // Normalize activity type
  actividad.tipo = normalizeActivityType(actividad.tipo);
  console.log("saveActivity: Activity type normalized:", actividad.tipo);

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

  // Standardize all supplies in the activity
  if (actividad.detalles && actividad.detalles.dosis && actividad.detalles.dosis.length > 0) {
    console.log("saveActivity: Standardizing supply data structure");
    actividad.detalles.dosis = actividad.detalles.dosis.map(standardizeSupplyData);
  }

  if (!isEditing) {
    try {
      console.log("saveActivity: Generating new ID for activity");
      const fechaEjecucion = actividad.detalles.fecha_ejecucion_tentativa
      const parsedDate = new Date(fechaEjecucion)
      const formattedDate = format(parsedDate, 'yyyy-MM-dd')
      actividad._id = 'actividad:' + formattedDate + ':' + actividad.uuid
      console.log("saveActivity: New ID generated:", actividad._id);
    } catch (error) {
      console.error('Error generating new ID for activity:', error)
      return
    }
  }

  try {
    console.log("saveActivity: Checking if activity exists:", actividad._id);
    const doc = await db.get(actividad._id)
    console.log("saveActivity: Activity exists, updating");
    actividad._rev = doc._rev
    console.log("saveActivity: Updating activity in database");
    await db.put(actividad)
    console.log('Actividad guardada', 'success')
    backToActivites()
  } catch (error) {
    if (error.name === 'not_found') {
      console.log('saveActivity: Activity not found. Creating a new one.')
      delete actividad._rev
      try {
        console.log("saveActivity: Creating new activity in database");
        await db.put(actividad)
        console.log('New actividad created', 'success')

        // Check if there are supplies to process
        if (actividad.detalles && actividad.detalles.dosis && actividad.detalles.dosis.length > 0) {
          console.log("saveActivity: Processing supplies for new activity");
          
          // Process each supply in sequence
          for (const dosis of actividad.detalles.dosis) {
            try {
              // Log the dosis object for debugging
              console.log("saveActivity: Processing supply:", dosis);
              
              // Check if we have the necessary data
              if (!dosis.insumo) {
                console.warn("saveActivity: Supply missing insumo property:", dosis);
                continue; // Skip this supply
              }
              
              const supplyName = dosis.insumo?.name || 'unnamed supply';
              console.log("saveActivity: Reserving stock for supply:", supplyName);
              
              // Attempt to reserve stock
              const withdrawalOrder = await reserveSupplyStock(
                actividad.detalles.contratista,
                dosis,
                user,
                selectedCampaign,
                createWithdrawalOrder,
              )
              
              // IMPORTANT: Asignar la orden de retiro al objeto dosis para que se guarde con la actividad
              if (withdrawalOrder) {
                dosis.orden_de_retiro = withdrawalOrder;
                console.log("saveActivity: Withdrawal order assigned to dosis:", withdrawalOrder);
              }
              
              console.log("saveActivity: Stock reserved successfully for:", supplyName);
            } catch (error) {
              // Log error but continue with other supplies
              console.error(
                `Error reserving stock for supply:`,
                error,
              )
              // Don't return here, continue with other supplies
            }
          }
          
          // IMPORTANT: Actualizar la actividad en la base de datos con las órdenes de retiro
          console.log("saveActivity: Updating activity with withdrawal orders");
          try {
            // Obtener la versión más reciente de la actividad para evitar conflictos
            const latestActivity = await db.get(actividad._id);
            
            // Actualizar solo las dosis con las órdenes de retiro
            latestActivity.detalles.dosis = actividad.detalles.dosis;
            
            await db.put(latestActivity);
            console.log("saveActivity: Activity updated with withdrawal orders");
          } catch (error) {
            console.error("saveActivity: Error updating activity with withdrawal orders:", error);
            // El error no es crítico - las órdenes se crearon pero no se guardaron en la actividad
            // El sistema aún puede funcionar sin ellas
          }
        }

        backToActivites()
      } catch (err) {
        console.error('Error creating new actividad:', err)
        throw err; // Rethrow to be caught by the caller
      }
    } else if (error.name === 'conflict') {
      console.error('Conflict detected. Trying to save again.')
      throw new Error('Document conflict detected. Please try again.');
    } else {
      console.error('Error saving actividad:', error)
      throw error; // Rethrow to be caught by the caller
    }
  }
}