import { isObject, type Optional } from '@0x-jerry/utils'
import type { AnyProps } from '../props'
import { getNativeNodeElement, isNativeNode, moveNativeNode } from './NativeNode'
import { type ComponentNode, isComponentNode } from '../internalComponents'
import { getComponentNodeElement, moveComponentNode } from './componentOps'
import type { FunctionalComponent } from '../defineComponent'

export const AnyNodeSymbol = Symbol('AnyNode')
export type AnyNodeSymbol = typeof AnyNodeSymbol

export enum AnyNodeType {
  Native = 1,
  Component = 2,
}

export interface AnyNode {
  [AnyNodeSymbol]: AnyNodeType
  /**
   * Raw props
   */
  props?: AnyProps

  children?: AnyNode[]
}

export function isAnyNode(node: unknown): node is AnyNode {
  return isObject(node) && AnyNodeSymbol in node
}

/**
 * Move node elements to anchor's before, is anchor is null, append to parentEl
 *
 * @param node
 * @param anchor
 */
export function moveNode(node: AnyNode, parentEl: ParentNode, anchor?: Node) {
  if (isNativeNode(node)) {
    moveNativeNode(node, parentEl, anchor)
    return
  }

  if (isComponentNode(node)) {
    moveComponentNode(node, parentEl, anchor)

    return
  }
}

export interface NodeElementRange {
  start?: ChildNode | null
  end?: ChildNode | null
}

export function getNodeElement(node?: AnyNode): Optional<NodeElementRange> {
  if (isNativeNode(node)) {
    return getNativeNodeElement(node)
  } else if (isComponentNode(node)) {
    return getComponentNodeElement(node)
  }
}

export interface InternalComponentOps {
  is: (type: FunctionalComponent) => boolean

  connect: (node: ComponentNode, parentEl?: ParentNode) => void
  disconnect: (node: ComponentNode) => void
  move: (node: ComponentNode, parentEl: ParentNode, anchor?: Node) => void
  getElementRange: (node: ComponentNode) => Optional<NodeElementRange>
}
