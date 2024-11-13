import React, { useEffect } from 'react'
import { useAppSelector, useOrder } from '../../../hooks'
import { WithdrawalOrderType } from '../../../types'

interface WithdrawalOrderManagerProps {
  actividad: any
  onSuccess: () => void
  onError: (error: any) => void
}

const WithdrawalOrderManager: React.FC<WithdrawalOrderManagerProps> = ({
  actividad,
  onSuccess,
  onError,
}) => {
  const { user } = useAppSelector((state) => state.auth)
  const selectedCampaign = useAppSelector(
    (state) => state.campaign.selectedCampaign,
  )
  const { createWithdrawalOrder } = useOrder()

  const reserveSupplyStock = async (dosisList) => {
    for (const dosis of dosisList) {
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
      } else {
        throw new Error(
          `Error reservando stock para el insumo ${dosis.insumo.name}`,
        )
      }
    }
  }

  useEffect(() => {
    const handleReserveStock = async () => {
      try {
        if (actividad.detalles.dosis) {
          await reserveSupplyStock(actividad.detalles.dosis)
        }
        onSuccess()
      } catch (error) {
        console.error('Error en WithdrawalOrderManager:', error)
        onError(error)
      }
    }

    handleReserveStock()
  }, [actividad])

  return null
}

export default WithdrawalOrderManager
