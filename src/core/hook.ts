import type { Fn } from '@0x-jerry/utils'
import type { WatchCallback, WatchEffect, WatchSource } from '@vue/reactivity'
import { type DNodeContext, getCurrentContext } from './context'
import { type DComponent, getContext } from './node'
import { type WatchHandle, type WatchOptions, watch } from './reactivity'

export function unmount(node: DComponent) {
  const ctx = getContext(node)

  node.remove()

  if (!ctx) return

  _unmount(ctx)
}

function _unmount(ctx: DNodeContext) {
  ctx.children?.forEach((child) => _unmount(child))

  ctx.emit('unmounted')
}

export function mount(node: DComponent) {
  const ctx = getContext(node)

  if (!ctx) return

  _mount(ctx)
}

function _mount(ctx: DNodeContext) {
  ctx.children?.forEach((item) => _mount(item))

  ctx.emit('mounted')
}

export function useContext() {
  const ctx = getCurrentContext()

  if (!ctx) {
    throw new Error('This should only used inside functional component.')
  }

  return ctx
}

export function onMounted(fn: Fn) {
  const ctx = useContext()

  ctx.on('mounted', fn)
}

export function onUnmounted(fn: Fn) {
  const ctx = useContext()

  ctx.on('unmounted', fn)
}

export function useWatch(
  getter: WatchSource | WatchSource[] | WatchEffect,
  fn: WatchCallback,
  opt?: WatchOptions,
): WatchHandle {
  const ctx = useContext()

  const stop = watch(getter, fn, opt)

  ctx.on('unmounted', stop)

  return stop
}
