import { isArray } from '@0x-jerry/utils'
import { AnchorNode, createFragment } from './AnchorNode'
import { ComponentNode } from './ComponentNode'
import { NativeNode } from './NativeNode'
import { createTextNode, TextNode } from './TextNode'

export abstract class BaseNode {
  abstract readonly type: NodeType

  children?: NodeElement[]

  /**
   * This function will:
   *
   * 1. Binding properties
   * 2. Generate context
   * 3. Create DOM element
   *
   */
  abstract initialize(): void
}

export enum NodeType {
  Component = 0,
  Native,
  Text,
  Anchor,
}

export type NodeElement = TextNode | ComponentNode | NativeNode | AnchorNode

export function isNodeElement(o: unknown): o is NodeElement {
  return (
    ComponentNode.is(o) ||
    NativeNode.is(o) ||
    TextNode.is(o) ||
    AnchorNode.is(o)
  )
}

function normalizeNode(data: unknown): NodeElement | null {
  if (isNodeElement(data)) {
    return data
  }

  if (isArray(data)) {
    return createFragment(data)
  }

  if (data == null) {
    return null
  }

  return createTextNode(data)
}

export function normalizeNodes(nodes: unknown[]): NodeElement[] {
  const result: NodeElement[] = []

  for (const node of nodes) {
    const nodeElement = normalizeNode(node)
    if (nodeElement) {
      result.push(nodeElement)
    }
  }

  return result
}
