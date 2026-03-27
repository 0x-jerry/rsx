import { type EmptyObject, type Fn } from '@0x-jerry/utils'
import { readonly, type WatchCallback, type WatchEffect, type WatchSource } from '@vue/reactivity'
import {
  type ComponentContext,
  ComponentContextEventNameMap,
  type ComponentEvents,
  getCurrentContext,
} from './context'
import { isRef, type WatchHandle, type WatchOptions, watch } from './reactivity'

export function useContext() {
  const ctx = getCurrentContext()

  if (!ctx) {
    throw new Error('This should only used inside functional component.')
  }

  return ctx
}

function createContextHook(name: keyof ComponentEvents) {
  return (fn: Fn, ctx?: ComponentContext) => {
    ctx ||= useContext()

    ctx.emitter.on(name, fn)
  }
}

export const onBeforeMount = createContextHook(ComponentContextEventNameMap.beforeMount)
export const onMounted = createContextHook(ComponentContextEventNameMap.mounted)

export const onBeforeUnmount = createContextHook(ComponentContextEventNameMap.beforeUnmount)
export const onUnmounted = createContextHook(ComponentContextEventNameMap.unmounted)

export function useWatch(
  getter: WatchSource | WatchSource[] | WatchEffect,
  fn: WatchCallback,
  opt?: WatchOptions,
): WatchHandle {
  const stopHandle = watch(getter, fn, opt)

  onUnmounted(stopHandle)

  return stopHandle
}

export type InjectKey<T> = (string | symbol) & { _: T }

export function provide<T = unknown>(key: string | symbol | InjectKey<T>, value: T) {
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

export function useRawProps() {
  const ctx = useContext()

  return ctx.node?.props || {}
}

export function useExpose<T extends EmptyObject>(exposed: T) {
  const ref = useRawProps().ref

  if (isRef(ref)) {
    ref.value = readonly(exposed)
  }
}

export function useRawChildren() {
  return useContext().node?.children || []
}
