import { readonly } from './helpers'

describe('readonly', () => {
  it('should return the same proxy on repeated access', () => {
    const data = { nested: { n: 1 } }
    const ro = readonly(data)

    // Repeated nested access must not leak the raw object.
    expect(ro.nested).toBe(ro.nested)
    expect(readonly(data)).toBe(ro)
  })

  it('should block writes', () => {
    const data = { n: 1 }
    const ro = readonly(data) as any

    ro.n = 2
    ro.nested = { x: 1 }

    expect(data.n).toBe(1)
    expect((data as any).nested).toBeUndefined()
  })

  it('should deeply proxy nested objects', () => {
    const data = { nested: { n: 1 } }
    const ro = readonly(data) as any

    ro.nested.n = 2
    expect(data.nested.n).toBe(1)
  })
})
