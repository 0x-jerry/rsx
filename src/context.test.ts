import {
  appendToCurrentContext,
  createNodeContext,
  getCurrentContext,
  popCurrentContext,
  runWithContext,
  setCurrentContext,
} from './context'

describe('context', () => {
  it('should working like a queue', () => {
    const c1 = createNodeContext('c1')
    const c2 = createNodeContext('c2')

    setCurrentContext(c1)
    setCurrentContext(c2)

    expect(getCurrentContext()).toBe(c2)

    popCurrentContext()
    expect(getCurrentContext()).toBe(c1)

    popCurrentContext()
    expect(getCurrentContext()).toBe(undefined)
  })

  it('should get current context when run with context', () => {
    const c1 = createNodeContext('c1')

    expect(getCurrentContext()).toBe(undefined)

    const fn = vi.fn(() => {
      expect(getCurrentContext()).toBe(c1)
      return 1
    })

    const r = runWithContext(fn, c1)

    expect(fn).toBeCalledTimes(1)
    expect(r).toBe(1)
    expect(getCurrentContext()).toBe(undefined)
  })

  it('should pop context when throw an error', () => {
    const c1 = createNodeContext('c1')

    const hasError = vi.fn()
    try {
      runWithContext(() => {
        expect(getCurrentContext()).toBe(c1)
        throw 1
      }, c1)
    } catch (error) {
      hasError()
      expect(error).toBe(1)
    }
    expect(hasError).toBeCalledTimes(1)

    expect(getCurrentContext()).toBe(undefined)
  })

  it("should append to current context's children", () => {
    const c1 = createNodeContext('c1')

    expect(c1.children).toBe(undefined)

    const c2 = createNodeContext('c2')

    runWithContext(() => {
      appendToCurrentContext(c2)
    }, c1)

    expect(c1.children?.has(c2)).toBe(true)
  })
})
