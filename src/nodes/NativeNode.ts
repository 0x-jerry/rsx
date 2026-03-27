import { isObject } from '@0x-jerry/utils'
import { AnyProps } from '../props'
import { createNativeElement } from '../node'

const NativeNodeSymbol = Symbol('NativeNode')
type NativeNodeSymbol = typeof NativeNodeSymbol

export interface NativeNode {
  [NativeNodeSymbol]: true
  type: string
  props?: AnyProps
  children?: unknown[]
  mounted?: boolean
  unmounted?: boolean
  cleanup?: () => void
}

export function createNativeNode(type: string, props?: AnyProps, children?: unknown[]): NativeNode {
  return {
    [NativeNodeSymbol]: true,
    type: type,
    props,
    children,
    mounted: false,
  }
}

export function isNativeNode(o: unknown): o is NativeNode {
  return isObject(o) && NativeNodeSymbol in o
}

export function mountNativeNode(node: NativeNode): HTMLElement | undefined {
  if (node.mounted) {
    console.warn('native node mounted mounted')
    return
  }

  const { el, cleanup } = createNativeElement(node.type, node.props)

  node.cleanup = cleanup

  node.mounted = true

  return el
}

export function unmountNativeNode(node: NativeNode) {
  if (!node.mounted) {
    console.warn('native node not mounted')
    return
  }

  node.cleanup?.()
}
