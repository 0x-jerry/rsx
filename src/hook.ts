import { EventEmitter, Fn } from '@0x-jerry/utils'
import { DNodeContext } from './node'

let currentCtx: DNodeContext | null = null

export function createNodeContext() {
  const ctx = new EventEmitter() as DNodeContext

  return ctx
}

export function setCurrentContext(ctx: DNodeContext | null) {
  currentCtx = ctx
}

export function getCurrentContext() {
  return currentCtx
}

export function useContext() {
  if (!currentCtx)
    throw new Error('This should only used inside functional component.')

  return currentCtx
}

export function onMounted(fn: Fn) {
  const ctx = useContext()

  ctx.on('mounted', fn)
}

export function onUnmounted(fn: Fn) {
  const ctx = useContext()

  ctx.on('unmounted', fn)
}
