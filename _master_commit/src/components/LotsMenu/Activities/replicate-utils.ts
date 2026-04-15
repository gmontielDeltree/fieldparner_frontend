// Utility helpers to adjust an activity when replicating to another lot

export interface DosisLinea {
  insumo?: any
  uuid?: string
  dosis: number | string
  total?: number | string
  precio_estimado?: number
  deposito?: any
}

export interface ServicioLinea {
  servicio?: string
  laborId?: string
  contratista?: any
  costo_total?: number
  comentario?: string
  uuid?: string
  unidades?: number
  precio_unidad?: number
}

export interface ActivityLike {
  estado?: string
  lote_uuid?: string
  uuid?: string
  _id?: string
  _rev?: string
  detalles: {
    fecha_ejecucion_tentativa?: string | Date
    hectareas: number
    dosis: DosisLinea[]
    servicios?: ServicioLinea[]
  }
}

export function parseNumber(value: number | string | undefined): number {
  if (value === undefined || value === null) return 0
  if (typeof value === 'number') return value
  // Replace comma with dot for decimal parsing
  const normalized = String(value).replace(',', '.')
  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

export function adjustActivityForHectares<T extends ActivityLike>(
  original: T,
  newHectares: number,
): T {
  const cloned: any = JSON.parse(JSON.stringify(original))

  cloned.estado = 'pendiente'
  cloned.detalles = cloned.detalles || {}
  cloned.detalles.hectareas = newHectares

  // Adjust supplies totals to the new hectare size
  if (Array.isArray(cloned.detalles.dosis)) {
    cloned.detalles.dosis = cloned.detalles.dosis.map((d: DosisLinea) => {
      const dosisValue = parseNumber(d.dosis)
      const total = newHectares * dosisValue
      return {
        ...d,
        dosis: dosisValue,
        total,
      }
    })
  }

  // Adjust services totals and units to the new hectare size
  if (Array.isArray(cloned.detalles.servicios)) {
    cloned.detalles.servicios = cloned.detalles.servicios.map((s: ServicioLinea) => {
      const precioUnidad = parseNumber(s.precio_unidad)
      const unidades = newHectares
      const costoTotal = precioUnidad ? precioUnidad * unidades : s.costo_total
      return {
        ...s,
        unidades,
        costo_total: costoTotal,
      }
    })
  }

  return cloned
}


