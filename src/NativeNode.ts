import { isArray, isObject } from '@0x-jerry/utils'
import { AnyProps } from './props'
import { createNativeElement, createTextElement } from './node'
import { isComponentNode, mountComponentNode } from './ComponentNode'

const NativeNodeSymbol = Symbol('NativeNode')
type NativeNodeSymbol = typeof NativeNodeSymbol

export interface NativeNode {
  [NativeNodeSymbol]: true
  type: string
  props?: AnyProps
  children?: unknown[]
  mounted?: boolean
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
  // TODO: call cleanup

  const stack = node.children?.slice() || []

  while (stack.length) {
    const child = stack.shift()

    if (isArray(child)) {
      stack.unshift(...child)
      continue
    }

    if (isNativeNode(child)) {
      const childEl = mountNativeNode(child)
      if (childEl) {
        el.appendChild(childEl)
      }
      continue
    }

    if (isComponentNode(child)) {
      const childEl = mountComponentNode(child)

      if (childEl) {
        el.appendChild(childEl)
      }
      continue
    }

    el.appendChild(createTextElement(child))
  }

  node.mounted = true

  return el
}
