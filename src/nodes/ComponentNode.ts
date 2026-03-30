import type { FunctionalComponent } from '../defineComponent'
import { normalizeProps, type AnyProps } from '../props'
import { connect } from '../ops'
import {
  ComponentContext,
  createNodeContext,
  popCurrentContext,
  setCurrentContext,
  appendToCurrentContext,
} from './ComponentContext'
import { AnyNode, AnyNodeSymbol, AnyNodeType, isAnyNode } from './node'
import {
  connectCaseComponent,
  connectFragmentNode,
  Fragment,
  isCaseComponent,
  isFragmentComponent,
} from '../internalComponents'
import { getNodeElement } from './utils'

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

export function connectComponentNode(node: ComponentNode, parentEl?: ParentNode) {
  const ctx = createNodeContext(node)
  ctx.props = normalizeProps(node.type, node.props)
  node.context = ctx

  appendToCurrentContext(ctx)

  setCurrentContext(ctx)

  if (isFragmentComponent(node.type)) {
    connectFragmentNode(node, parentEl)
  } else if (isCaseComponent(node.type)) {
    connectCaseComponent(node, parentEl)
  } else {
    _connectComponentNode(node, parentEl)
  }

  popCurrentContext()

  return ctx.el
}

function _connectComponentNode(node: ComponentNode, parentEl?: ParentNode) {
  const ctx = node.context!

  const componentRoot = node.type(ctx.props, node.children)

  if (!isAnyNode(componentRoot)) {
    throw new Error(`mount failed!`)
  }

  ctx.root = componentRoot

  connect(componentRoot, parentEl)

  const rootEl = getNodeElement(componentRoot)

  if (!rootEl) {
    return
  }

  ctx.el = rootEl
  parentEl?.appendChild(rootEl)
}

export function disconnectComponentNode(node: ComponentNode) {
  const ctx = node.context
  if (!ctx) {
    throw new Error(`disconnect component node failed!`)
  }

  ctx.parent?.children?.delete(ctx)
  ctx.el?.remove()
}
