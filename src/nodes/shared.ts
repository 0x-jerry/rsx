import { isArray } from '@0x-jerry/utils'
import type { Ref } from '@vue/reactivity'
import { AnchorNode, createFragment } from './AnchorNode'
import { ComponentNode } from './ComponentNode'
import { NativeNode } from './NativeNode'
import { createTextNode, TextNode } from './TextNode'

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

export type NodeRef<T = any> = Ref<T> | ((element: T) => void)
