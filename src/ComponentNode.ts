import { isObject } from '@0x-jerry/utils'
import type { FunctionalComponent } from './defineComponent'
import { normalizeProps, type AnyProps } from './props'
import { mount } from './mount'
import {
  ComponentContext,
  createNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'
import { appendToCurrentContext } from './context'

let componentId = 0

const ComponentNodeSymbol = Symbol('ComponentNode')
type ComponentNodeSymbol = typeof ComponentNodeSymbol

export interface ComponentNode {
  [ComponentNodeSymbol]: true
  type: FunctionalComponent
  id: number
  props?: AnyProps
  children?: unknown[]
  mounted?: boolean
  context?: ComponentContext
}

export function createComponentNode(
  type: FunctionalComponent,
  props: AnyProps | undefined,
  children: unknown[],
) {
  const node: ComponentNode = {
    [ComponentNodeSymbol]: true,
    type,
    id: componentId++,
    props,
    children,
    mounted: false,
  }

  return node
}

export function isComponentNode(o: unknown): o is ComponentNode {
  return isObject(o) && ComponentNodeSymbol in o
}

export function mountComponentNode(node: ComponentNode): HTMLElement | undefined {
  if (node.mounted) {
    console.warn('component node mounted mounted')
    return
  }

  const ctx = createNodeContext(node.type.name)
  node.context = ctx

  appendToCurrentContext(ctx)

  setCurrentContext(ctx)

  const proxiedProps = normalizeProps(node.type, node.props)
  ctx.props = proxiedProps

  const componentRoot = node.type(proxiedProps, node.children)

  const rootEl = mount(componentRoot)

  popCurrentContext()

  node.mounted = true

  return rootEl
}
