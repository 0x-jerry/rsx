import type { FunctionalComponent } from '../defineComponent'
import { type AnyProps } from '../props'
import {
  type AnyNode,
  AnyNodeSymbol,
  AnyNodeType,
  type ComponentContext,
  getNodeElement,
  type InternalComponentOps,
  isAnyNode,
  moveNode,
} from '../nodes'
import { connect, disconnect } from '../ops'
import { onUnmounted } from '../hook'

export interface ComponentNode extends AnyNode {
  [AnyNodeSymbol]: AnyNodeType.Component
  type: FunctionalComponent
  context?: ComponentContext
}

export function createComponentNode(
  type: FunctionalComponent,
  props: AnyProps | undefined,
  children: AnyNode[],
) {
  const node: ComponentNode = {
    [AnyNodeSymbol]: AnyNodeType.Component,
    type,
    props,
    children,
  }

  return node
}

export function isComponentNode(o: unknown): o is ComponentNode {
  return isAnyNode(o) && o[AnyNodeSymbol] === AnyNodeType.Component
}

export const ComponentOps: InternalComponentOps = {
  is: () => true,
  connect: _connectComponentNode,
  disconnect: _disconnectComponentNode,
  move: _moveComponentNode,
  getElementRange: _getComponentNodeElement,
}

function _connectComponentNode(node: ComponentNode, parentEl?: ParentNode, anchor?: Node | null) {
  const ctx = node.context!

  const componentRoot = node.type(ctx.props, node.children)

  if (!isAnyNode(componentRoot)) {
    throw new Error(`mount failed!`)
  }

  ctx.root = componentRoot

  onUnmounted(() => {
    ctx?.parent?.children?.delete(ctx)
  })

  connect(componentRoot, parentEl, anchor)
}

function _disconnectComponentNode(node: ComponentNode) {
  const ctx = node.context
  const root = ctx?.root

  if (root) {
    disconnect(root)
  }
}

function _moveComponentNode(node: ComponentNode, parentEl: ParentNode, anchor?: Node) {
  const rootNode = node.context?.root
  if (!rootNode) {
    return
  }

  moveNode(rootNode, parentEl, anchor)
}

function _getComponentNodeElement(node: ComponentNode) {
  const root = node.context?.root

  if (!root) {
    return
  }

  return getNodeElement(root)
}
