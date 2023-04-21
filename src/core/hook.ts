import { Fn } from '@0x-jerry/utils'
import { DComponent, getContext } from './node'
import { DNodeContext, getCurrentContext } from './context'
import {
  StopWatcher,
  TriggerFn,
  WatchOption,
  watch,
  watchLazy,
} from './reactivity'
import { Ref } from '@vue/reactivity'

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

export function useWatch<T>(
  getter: Ref<T> | (() => T),
  fn: TriggerFn<T>,
  opt?: WatchOption,
): StopWatcher {
  const ctx = useContext()
  const stop = watch(getter, fn, {
    lazy: true,
    ...opt,
  })

  ctx.on('unmounted', stop)

  return stop
}
