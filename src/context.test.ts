import { EventEmitter } from '@0x-jerry/utils'
import {
  appendToCurrentContext,
  ComponentContext,
  getCurrentContext,
  popCurrentContext,
  runWithContext,
  setCurrentContext,
} from './context'

function createFakeContext(name: string) {
  return {
    name,
    emitter: new EventEmitter(),
  } as ComponentContext
}

describe('context', () => {
  it('should working like a queue', () => {
    const c1 = createFakeContext('c1')
    const c2 = createFakeContext('c2')

    setCurrentContext(c1)
    setCurrentContext(c2)

    expect(getCurrentContext()).toBe(c2)

    popCurrentContext()
    expect(getCurrentContext()).toBe(c1)

    popCurrentContext()
    expect(getCurrentContext()).toBe(undefined)
  })

  it('should get current context when run with context', () => {
    const c1 = createFakeContext('c1')

    expect(getCurrentContext()).toBe(undefined)

    const fn = vi.fn(() => {
      expect(getCurrentContext()).toBe(c1)
      return 1
    })

    const r = runWithContext(fn, c1)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(r).toBe(1)
    expect(getCurrentContext()).toBe(undefined)
  })

  it('should pop context when throw an error', () => {
    const c1 = createFakeContext('c1')

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
    expect(hasError).toHaveBeenCalledTimes(1)

    expect(getCurrentContext()).toBe(undefined)
  })

  it("should append to current context's children", () => {
    const c1 = createFakeContext('c1')

    expect(c1.children).toBe(undefined)

    const c2 = createFakeContext('c2')

    runWithContext(() => {
      appendToCurrentContext(c2)
    }, c1)

    expect(c1.children?.has(c2)).toBe(true)
  })
})
