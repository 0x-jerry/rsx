import { Fn } from '@0x-jerry/utils'
import { DComponent, getContext } from './node'
import { getCurrentContext } from './context'

export function unmount(node: DComponent) {
  const ctx = getContext(node)

  node.remove()

  if (!ctx) return

  ctx.children?.forEach((child) => child.emit('unmounted'))

  ctx.emit('unmounted')
}

export function mount(node: DComponent) {
  const ctx = getContext(node)

  if (!ctx) return
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
