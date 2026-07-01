import { isArray, isString } from '@0x-jerry/utils'
import type { FunctionalComponent } from './defineComponent'
import type { AnyProps } from './props'
import {
  createNativeNode,
  createNativeTextNode,
  isAnyNode,
  type AnyNode,
  type NativeNode,
} from './nodes'
import { type ComponentNode, createComponentNode } from './internalComponents'

export function h(
  type: string | FunctionalComponent,
  props?: AnyProps,
  ...children: unknown[]
): ComponentNode | NativeNode {
  const normalizedChildren = normalizeChildren(children)

  if (isString(type)) {
    return createNativeNode(type, props, normalizedChildren)
  }

  return createComponentNode(type, props, normalizedChildren)
}

function normalizeChildren(children?: unknown[]): AnyNode[] {
  const result: AnyNode[] = []
  if (!children) return result

  flattenChildren(children, result)

  return result
}

function flattenChildren(items: unknown[], result: AnyNode[]) {
  for (const item of items) {
    if (isArray(item)) {
      flattenChildren(item, result)
    } else {
      result.push(normalizeNode(item))
    }
  }
}

function normalizeNode(node: unknown): AnyNode {
  if (isAnyNode(node)) {
    return node
  }

  const textNode = createNativeTextNode(node)

  return textNode
}
