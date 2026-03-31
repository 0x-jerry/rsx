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
  const normalizedChildren = normalizeChildren(children).toArray()

  if (isString(type)) {
    return createNativeNode(type, props, normalizedChildren)
  }

  return createComponentNode(type, props, normalizedChildren)
}

function* normalizeChildren(children?: unknown[]) {
  const stack = children?.slice() || []

  while (stack.length) {
    const child = stack.shift()

    if (isArray(child)) {
      stack.unshift(...child)
      continue
    }

    yield normalizeNode(child)
  }
}

function normalizeNode(node: unknown): AnyNode {
  if (isAnyNode(node)) {
    return node
  }

  const textNode = createNativeTextNode(node)

  return textNode
}
