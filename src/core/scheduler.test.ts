import { ref } from '@vue/reactivity'
import { nextTick, queueEffectJob } from './scheduler'

describe('scheduler', () => {
  it('should run after next tick', async () => {
    const fn = vi.fn()

    queueEffectJob(fn)

    expect(fn).toBeCalledTimes(0)
    await nextTick()
    expect(fn).toBeCalledTimes(1)
  })

  it('should run immediate', () => {
    const fn = vi.fn()

    queueEffectJob(fn, { immediate: true })

    expect(fn).toBeCalledTimes(1)
  })

  it('should flushed by order: pre -> sync -> post', async () => {
    const order: number[] = []
    const fn1 = vi.fn(() => order.push(1))
    const fn2 = vi.fn(() => order.push(2))
    const fn3 = vi.fn(() => order.push(3))

    queueEffectJob(fn1, { flush: 'pre' })
    queueEffectJob(fn3, { flush: 'pre' })

    // default is sync
    queueEffectJob(fn2)
    queueEffectJob(fn3)
    queueEffectJob(fn2)

    queueEffectJob(fn3, { flush: 'post' })
    queueEffectJob(fn1, { flush: 'post' })
    await nextTick()

    expect(order).eql([
      // pre
      1, 3,
      // sync
      2, 3, 2,
      // post
      3, 1,
    ])
  })

  it('should only run once when there are multiple assignment', async () => {
    const v = ref(0)

    const fn = vi.fn(() => {
      return v.value
    })

    queueEffectJob(fn)
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
