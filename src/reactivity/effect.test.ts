import { ref } from '.'
import { effect } from './effect'
import { nextTick } from './scheduler'

describe('scheduler', () => {
  it('should run immediate', () => {
    const fn = vi.fn()

    effect(fn)

    expect(fn).toBeCalledTimes(1)
  })

  it('should only run once when there are multiple assignment', async () => {
    const v = ref(0)

    const fn = vi.fn(() => {
      return v.value
    })

    effect(fn)
    await nextTick()
    expect(fn).toBeCalledTimes(1)

    v.value++
    v.value++
    v.value++
    v.value++
    v.value++

    expect(fn).toBeCalledTimes(1)
    await nextTick()
    expect(fn).toBeCalledTimes(2)
  })
})
