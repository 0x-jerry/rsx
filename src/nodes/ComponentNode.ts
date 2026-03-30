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
import { Fragment } from '../internalComponents'
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

export function isFragmentNode(o: unknown): boolean {
  return isComponentNode(o) && o.type === Fragment
}

export function connectComponentNode(node: ComponentNode, parentEl?: HTMLElement) {
  const ctx = createNodeContext(node)
  node.context = ctx

  appendToCurrentContext(ctx)

  setCurrentContext(ctx)

  const proxiedProps = normalizeProps(node.type, node.props)
  ctx.props = proxiedProps

  if (isFragmentNode(node)) {
    ctx.el = document.createComment('fragment') as any as HTMLElement
    parentEl?.appendChild(ctx.el)

    for (const child of node.children || []) {
      connect(child, parentEl)
    }
  } else {
    const componentRoot = node.type(proxiedProps, node.children)

    if (!isAnyNode(componentRoot)) {
      throw new Error(`mount failed!`)
    }

    ctx.root = componentRoot

    connect(componentRoot, parentEl)

    const rootEl: HTMLElement | undefined = getNodeElement(componentRoot)

    if (rootEl) {
      ctx.el = rootEl
      parentEl?.appendChild(rootEl)
    }
  }

  popCurrentContext()

  return ctx.el
}

export function disconnectComponentNode(node: ComponentNode) {
  if (!node.context) {
    throw new Error(`disconnect component node failed!`)
  }

  node.context.parent?.children?.delete(node.context)
}
