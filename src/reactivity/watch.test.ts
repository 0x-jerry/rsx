import { signal } from '.'
import { watch } from './watch'
import { nextTick } from './scheduler'

describe('watch', () => {
  it('should be lazy by default and fire on change', async () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(v, fn)

    await nextTick()
    expect(fn).toHaveBeenCalledTimes(0)

    v(2)
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2, 1, expect.any(Function))
  })

  it('should support immediate', async () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(v, fn, { immediate: true })

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1, undefined, expect.any(Function))

    v(2)
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should not fire the callback twice with immediate', () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(v, fn, { immediate: true })

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not double-fire when the immediate callback writes to the source', () => {
    const v = signal(0)
    const fn = vi.fn(() => {
      v(v() + 1)
    })

    watch(v, fn, { immediate: true })

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should run the cleanup before the next run, not right after immediate', async () => {
    const v = signal(1)
    const cleanup = vi.fn()
    const fn = vi.fn((_value, _old, onCleanup) => {
      onCleanup(cleanup)
    })

    watch(v, fn, { immediate: true })

    expect(fn).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    v(2)
    await nextTick()

    expect(fn).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should invoke cleanup when stopped', async () => {
    const v = signal(1)
    const cleanup = vi.fn()
    const fn = vi.fn((_value, _old, onCleanup) => {
      onCleanup(cleanup)
    })

    const stop = watch(v, fn, { immediate: true })
    await nextTick()

    stop()

    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should not fire the callback after stop', async () => {
    const v = signal(1)
    const fn = vi.fn()

    const stop = watch(v, fn)
    await nextTick()

    // Queue the watcher job, then stop before the queue flushes.
    v(2)
    v(3)
    stop()
    await nextTick()

    expect(fn).not.toHaveBeenCalled()
  })

  it('should support getter source', async () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(() => v() * 2, fn)

    await nextTick()
    v(2)
    await nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(4, 2, expect.any(Function))
  })

  it('should evaluate the getter only once per change', async () => {
    const v = signal(1)
    const getter = vi.fn(() => v() * 2)
    const fn = vi.fn()

    watch(getter, fn)

    await nextTick()
    expect(getter).toHaveBeenCalledTimes(1)

    v(2)
    await nextTick()

    expect(getter).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(4, 2, expect.any(Function))
  })

  it('should support array of sources', async () => {
    const a = signal(1)
    const b = signal(2)
    const fn = vi.fn()

    watch([a, b], fn)

    await nextTick()
    a(3)
    await nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith([3, 2], [1, 2], expect.any(Function))
  })

  it('should coalesce multiple writes into a single callback', async () => {
    const v = signal(0)
    const fn = vi.fn()

    watch(v, fn)

    await nextTick()
    v(1)
    v(2)
    v(3)

    expect(fn).toHaveBeenCalledTimes(0)
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(3, 0, expect.any(Function))
  })

  it('should fire synchronously on change with flush: sync', () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(v, fn, { flush: 'sync' })

    expect(fn).not.toHaveBeenCalled()

    v(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2, 1, expect.any(Function))
  })

  it('should fire for each write with flush: sync', () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(v, fn, { flush: 'sync' })

    v(2)
    v(3)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(3, 2, expect.any(Function))
  })

  it('should support flush: pre', async () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(v, fn, { flush: 'pre' })

    await nextTick()
    v(2)
    await nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2, 1, expect.any(Function))
  })

  it('should support flush: post', async () => {
    const v = signal(1)
    const fn = vi.fn()

    watch(v, fn, { flush: 'post' })

    await nextTick()
    v(2)
    await nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2, 1, expect.any(Function))
  })

  it('should run pre-flush watchers before post-flush watchers', async () => {
    const v = signal(1)
    const order: string[] = []

    watch(
      v,
      () => {
        order.push('pre')
      },
      { flush: 'pre' },
    )
    watch(
      v,
      () => {
        order.push('post')
      },
      { flush: 'post' },
    )

    await nextTick()
    v(2)
    await nextTick()

    expect(order).toEqual(['pre', 'post'])
  })

  it('should not fire on deep-equal replacement with deep: true', async () => {
    const v = signal({ a: { b: 1 } })
    const fn = vi.fn()

    watch(v, fn, { deep: true })

    await nextTick()
    v({ a: { b: 1 } })
    await nextTick()

    expect(fn).not.toHaveBeenCalled()

    v({ a: { b: 2 } })
    await nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({ a: { b: 2 } }, { a: { b: 1 } }, expect.any(Function))
  })

  it('should stop watching when the handle is called', async () => {
    const v = signal(0)
    const fn = vi.fn()

    const stop = watch(v, fn)

    await nextTick()
    stop()
    v(1)
    await nextTick()

    expect(fn).toHaveBeenCalledTimes(0)
  })
})
