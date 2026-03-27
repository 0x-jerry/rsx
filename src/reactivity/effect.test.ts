import { ref } from '.'
import { effect } from './effect'
import { nextTick } from './scheduler'

describe('scheduler', () => {
  it('should run immediate', () => {
    const fn = vi.fn()

    effect(fn)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should only run once when there are multiple assignment', async () => {
    const v = ref(0)

    const fn = vi.fn(() => {
      return v.value
    })

    effect(fn)
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)

    v.value++
    v.value++
    v.value++
    v.value++
    v.value++

    expect(fn).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
