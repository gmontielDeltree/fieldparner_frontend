import { describe, expect, it } from 'vitest'

import { resolveLaborServiceName } from '../laborService'

describe('laborService utils', () => {
  it('keeps plain string values', () => {
    expect(resolveLaborServiceName(' Pulverizacion ')).toBe('Pulverizacion')
  })

  it('extracts the service name from persisted objects', () => {
    expect(
      resolveLaborServiceName({ _id: 'lab-1', service: 'Aplicacion terrestre' }),
    ).toBe('Aplicacion terrestre')
  })

  it('falls back to common label fields', () => {
    expect(
      resolveLaborServiceName({ displayName: 'Siembra directa' }),
    ).toBe('Siembra directa')
  })

  it('returns an empty string for unsupported values', () => {
    expect(resolveLaborServiceName(42)).toBe('')
  })
})
