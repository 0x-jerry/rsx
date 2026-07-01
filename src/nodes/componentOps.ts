import {
  createNodeContext,
  appendToCurrentContext,
  runWithContext,
} from './ComponentContext'
import { normalizeProps } from '../props'
import { getOps } from './ops'
import type { ComponentNode } from '../internalComponents'

export function connectComponentNode(node: ComponentNode, parentEl?: ParentNode, anchor?: Node | null) {
  const ctx = createNodeContext(node)
  ctx.props = normalizeProps(node.type, node.props)
  node.context = ctx

  appendToCurrentContext(ctx)

  // Use runWithContext so a throw inside the component setup can never corrupt
  // the context stack — finally always pops.
  runWithContext(() => {
    getOps(node)?.connect(node, parentEl, anchor)
  }, ctx)
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
