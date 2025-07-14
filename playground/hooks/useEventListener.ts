import type { Fn } from '@0x-jerry/utils'
import { onUnmounted, useWatch } from '@/index'
import { type MaybeRef, unref } from '@/reactivity'

export function useEventListener(
  target: MaybeRef<EventTarget>,
  event: string,
  listener: Fn,
): void
export function useEventListener(event: string, listener: Fn): void
export function useEventListener(...args: unknown[]) {
  const normalizedParameters = args.length === 3 ? args : [window, ...args]

  const [t, eventName, listenerFn] = normalizedParameters as [
    MaybeRef<EventTarget>,
    string,
    Fn,
  ]

  useWatch(
    () => unref(t),
    (newTarget?: EventTarget, oldTarget?: EventTarget) => {
      oldTarget?.removeEventListener(eventName, callback)
      newTarget?.addEventListener(eventName, callback)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    unref(t).removeEventListener(eventName, callback)
  })

  function callback(...args: unknown[]) {
    listenerFn(...args)
  }
}

interface EventTarget {
  addEventListener(
    type: string,
    listener: Fn,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener(
    type: string,
    listener: Fn,
    options?: boolean | EventListenerOptions,
  ): void
}
