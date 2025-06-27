import type { Fn } from '@0x-jerry/utils'
import type { WatchCallback, WatchEffect, WatchSource } from '@vue/reactivity'
import {
  type DNodeContext,
  DNodeContextEventName,
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

export function onBeforeMount(fn: Fn, ctx?: DNodeContext) {
  ctx ||= useContext()

  ctx.on(DNodeContextEventName.beforeMount, fn)
}

export function onMounted(fn: Fn, ctx?: DNodeContext) {
  ctx ||= useContext()

  ctx.on(DNodeContextEventName.mounted, fn)
}

export function onBeforeUnmount(fn: Fn, ctx?: DNodeContext) {
  ctx ||= useContext()

  ctx.on(DNodeContextEventName.beforeUnmount, fn)
}

export function onUnmounted(fn: Fn, ctx?: DNodeContext) {
  ctx ||= useContext()

  ctx.on(DNodeContextEventName.unmounted, fn)
}

export function useWatch(
  getter: WatchSource | WatchSource[] | WatchEffect,
  fn: WatchCallback,
  opt?: WatchOptions,
): WatchHandle {
  const stop = watch(getter, fn, opt)

  onUnmounted(stop)

  return stop
}
