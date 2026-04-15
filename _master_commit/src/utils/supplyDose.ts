const parseNumericValue = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const normalized = String(value).trim().replace(',', '.')
  if (!normalized) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const roundValue = (value: number, decimals = 4) => {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

const getExplicitDose = (line: any): number | null => {
  const directDosificacion = parseNumericValue(line?.dosificacion)
  if (directDosificacion !== null) return directDosificacion

  const legacyDose = parseNumericValue(line?.dosis)
  if (legacyDose !== null) return legacyDose

  return null
}

const getTotalQuantity = (line: any): number | null =>
  parseNumericValue(line?.total ?? line?.totalCantidad)

const getHectares = (line: any, fallbackHectares?: unknown): number | null =>
  parseNumericValue(line?.hectareas ?? fallbackHectares)

export const resolveSupplyDosificacion = (
  line: any,
  fallbackHectares?: unknown,
): number | '' => {
  const explicitDose = getExplicitDose(line)
  const totalQuantity = getTotalQuantity(line)
  const hectares = getHectares(line, fallbackHectares)

  if (explicitDose !== null) {
    if (explicitDose === 0 && totalQuantity !== null && hectares && hectares > 0) {
      const derivedDose = roundValue(totalQuantity / hectares)
      if (derivedDose > 0) {
        return derivedDose
      }
    }

    return explicitDose
  }

  if (totalQuantity !== null && hectares && hectares > 0) {
    return roundValue(totalQuantity / hectares)
  }

  return ''
}

export const resolveSupplyTotal = (
  line: any,
  fallbackHectares?: unknown,
): number | '' => {
  const explicitTotal = getTotalQuantity(line)
  if (explicitTotal !== null) return explicitTotal

  const explicitDose = getExplicitDose(line)
  const hectares = getHectares(line, fallbackHectares)
  if (explicitDose !== null && hectares && hectares > 0) {
    return roundValue(explicitDose * hectares)
  }

  return ''
}

export const normalizeSupplyDoseLine = (line: any, fallbackHectares?: unknown) => {
  if (!line) return line

  const dosificacion = resolveSupplyDosificacion(line, fallbackHectares)
  const total = resolveSupplyTotal(line, fallbackHectares)
  const hectares = getHectares(line, fallbackHectares)

  return {
    ...line,
    dosificacion,
    dosis: dosificacion === '' ? line?.dosis ?? '' : dosificacion,
    total,
    hectareas: hectares ?? line?.hectareas,
  }
}

export const normalizeSupplyDoseLines = (
  lines: any[] = [],
  fallbackHectares?: unknown,
) => lines.map((line) => normalizeSupplyDoseLine(line, fallbackHectares))
