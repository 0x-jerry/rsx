import {
  createNodeContext,
  appendToCurrentContext,
  setCurrentContext,
  popCurrentContext,
} from './ComponentContext'
import { normalizeProps } from '../props'
import { getOps } from './ops'
import type { ComponentNode } from '../internalComponents'

export function connectComponentNode(node: ComponentNode, parentEl?: ParentNode) {
  const ctx = createNodeContext(node)
  ctx.props = normalizeProps(node.type, node.props)
  node.context = ctx

  appendToCurrentContext(ctx)

  setCurrentContext(ctx)

  getOps(node)?.connect(node, parentEl)

  popCurrentContext()
}

export function disconnectComponentNode(node: ComponentNode) {
  const ctx = node.context

  if (!ctx) {
    throw new Error(`disconnect component node failed!`)
  }

  getOps(node)?.disconnect(node)
}

export function moveComponentNode(node: ComponentNode, parentEl: ParentNode, anchor?: Node) {
  getOps(node)?.move(node, parentEl, anchor)
}

export function getComponentNodeElement(node: ComponentNode) {
  return getOps(node)?.getElementRange(node)
}
