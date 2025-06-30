import type { Fn } from '@0x-jerry/utils'
import type { WatchCallback, WatchEffect, WatchSource } from '@vue/reactivity'
import {
  type DNodeContext,
  DNodeContextEventName,
  type DNodeEventMap,
  getCurrentContext,
} from './context'
import { type WatchHandle, type WatchOptions, watch } from './reactivity'

export function unmount(ctx: DNodeContext) {
  ctx.emit(DNodeContextEventName.beforeUnmount)

  ctx.el?.remove()

  ctx.children?.forEach((child) => unmount(child))

  ctx.emit(DNodeContextEventName.unmounted)
}

export function mount(ctx: DNodeContext) {
  ctx.emit(DNodeContextEventName.beforeMount)

  ctx.children?.forEach((item) => mount(item))

  ctx.emit(DNodeContextEventName.mounted)
}

export function useContext() {
  const ctx = getCurrentContext()

  if (!ctx) {
    throw new Error('This should only used inside functional component.')
  }

  return ctx
}

function createContextHook(name: keyof DNodeEventMap) {
  return (fn: Fn, ctx?: DNodeContext) => {
    ctx ||= useContext()

    ctx.on(name, fn)
  }
}

export const onBeforeMount = createContextHook(
  DNodeContextEventName.beforeMount,
)
export const onMounted = createContextHook(DNodeContextEventName.mounted)

export const onBeforeUnmount = createContextHook(
  DNodeContextEventName.beforeUnmount,
)
export const onUnmounted = createContextHook(DNodeContextEventName.unmounted)

export function useWatch(
  getter: WatchSource | WatchSource[] | WatchEffect,
  fn: WatchCallback,
  opt?: WatchOptions,
): WatchHandle {
  const stop = watch(getter, fn, opt)

  onUnmounted(stop)

  return stop
}

export type InjectKey<T> = (string | symbol) & { _: T }

export function provide<T = unknown>(
  key: string | symbol | InjectKey<T>,
  value: T,
) {
  const ctx = useContext()
  ctx.ex ||= {}
  ctx.ex[key] = value
}

export function inject<T>(key: string | symbol | InjectKey<T>): T | undefined {
  const ctx = useContext()

  let node = ctx.parent

  while (node) {
    if (node.ex?.[key]) {
      return node.ex[key] as T
    }

    node = node.parent
  }
}
