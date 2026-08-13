import { signal } from '.'
import { effect } from './effect'
import { nextTick } from './scheduler'

describe('scheduler', () => {
  it('should run immediate', () => {
    const fn = vi.fn()

    effect(fn)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should only run once when there are multiple assignment', async () => {
    const v = signal(0)

    const fn = vi.fn(() => {
      return v()
    })

    effect(fn)
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)

    v(v() + 1)
    v(v() + 1)
    v(v() + 1)
    v(v() + 1)
    v(v() + 1)

    expect(fn).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
