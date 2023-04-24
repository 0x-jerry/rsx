import { ref } from '@vue/reactivity'
import { watch } from '.'
import { nextTick } from '../scheduler'

describe('watch', () => {
  it('should not trigger immediate', async () => {
    const fn = vi.fn()

    const a = ref(0)

    watch(a, fn)

    expect(fn).toBeCalledTimes(0)

    a.value++

    await nextTick()
    expect(fn).toBeCalledTimes(1)
  })

  it('should trigger immediate', () => {
    const fn = vi.fn()

    const a = ref(0)

    watch(a, fn, { immediate: true })

    expect(fn).toBeCalledTimes(1)
  })

  it('should work with function', async () => {
    const fn = vi.fn()

    const a = ref(0)

    watch(() => a.value, fn)

    a.value++
    await nextTick()
    expect(fn).toBeCalledTimes(1)
  })

  it('should be undefined when triggered by the first time', async () => {
    let old = null

    const fn = vi.fn((_v, _old) => (old = _old))

    const count = ref(0)

    watch(() => count.value, fn)

    count.value++
    await nextTick()
    expect(fn).toBeCalledTimes(1)
    expect(old).toBe(undefined)

    count.value++
    await nextTick()
    expect(fn).toBeCalledTimes(2)
    expect(old).toBe(1)
  })

  it('should not be triggered by the same value', async () => {
    const fn = vi.fn()

    const count = ref(0)

    watch(() => [count.value % 2], fn)

    count.value += 2
    await nextTick()
    expect(fn).toBeCalledTimes(1)

    count.value += 2
    await nextTick()
    expect(fn).toBeCalledTimes(1)
  })

  it('should stop', async () => {
    const fn = vi.fn()

    const count = ref(0)

    const stop = watch(() => count.value, fn)

    count.value++
    await nextTick()
    expect(fn).toBeCalledTimes(1)

    stop()
    count.value++
    await nextTick()
    expect(fn).toBeCalledTimes(1)
  })
})
