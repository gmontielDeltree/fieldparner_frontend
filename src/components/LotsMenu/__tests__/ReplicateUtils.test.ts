import { adjustActivityForHectares } from '../../LotsMenu/Activities/replicate-utils'

describe('adjustActivityForHectares', () => {
  it('adjusts dosis totals and service costs according to target hectares', () => {
    const original: any = {
      estado: 'planificada',
      detalles: {
        hectareas: 10,
        dosis: [
          { dosis: '2', total: 20 },
          { dosis: 1.5, total: 15 },
        ],
        servicios: [
          { precio_unidad: 100, unidades: 10, costo_total: 1000 },
          { precio_unidad: 50, unidades: 10, costo_total: 500 },
        ],
      },
    }

    const adjusted = adjustActivityForHectares(original, 5)

    // Supplies totals
    expect(adjusted.detalles.dosis[0].total).toBeCloseTo(10)
    expect(adjusted.detalles.dosis[1].total).toBeCloseTo(7.5)

    // Services updates
    expect(adjusted.detalles.servicios[0].unidades).toBe(5)
    expect(adjusted.detalles.servicios[0].costo_total).toBeCloseTo(500)
    expect(adjusted.detalles.servicios[1].unidades).toBe(5)
    expect(adjusted.detalles.servicios[1].costo_total).toBeCloseTo(250)

    // Status becomes pending
    expect(adjusted.estado).toBe('pendiente')
  })
})


