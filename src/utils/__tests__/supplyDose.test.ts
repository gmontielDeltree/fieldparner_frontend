import { describe, expect, it } from 'vitest'

import {
  normalizeSupplyDoseLine,
  resolveSupplyDosificacion,
  resolveSupplyTotal,
} from '../supplyDose'

describe('supplyDose utils', () => {
  it('keeps an explicit dosificacion when present', () => {
    expect(resolveSupplyDosificacion({ dosificacion: 2.5, total: 25 }, 10)).toBe(2.5)
  })

  it('uses legacy dosis when dosificacion is missing', () => {
    expect(resolveSupplyDosificacion({ dosis: 3, totalCantidad: 30 }, 10)).toBe(3)
  })

  it('derives quantity per hectare from total and hectares when legacy dose was persisted as zero', () => {
    expect(resolveSupplyDosificacion({ dosis: 0, totalCantidad: 48 }, 12)).toBe(4)
  })

  it('normalizes a line with both dosificacion and total for the form', () => {
    expect(
      normalizeSupplyDoseLine({ dosis: 0, totalCantidad: 18 }, 6),
    ).toMatchObject({
      dosificacion: 3,
      dosis: 3,
      total: 18,
      hectareas: 6,
    })
  })

  it('derives total from dose and hectares when total is missing', () => {
    expect(resolveSupplyTotal({ dosificacion: 1.75 }, 8)).toBe(14)
  })
})
