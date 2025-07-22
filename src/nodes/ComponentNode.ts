import {
  appendToCurrentContext,
  createNodeContext,
  type DNodeContext,
  popCurrentContext,
  setCurrentContext,
} from '@/context'
import type { FunctionalComponent } from '../defineComponent'
import { type AnyProps, normalizeProps } from '../props'
import { BaseNode } from './BaseNode'
import { type NodeElement, NodeType, normalizeNodes } from './shared'

let componentId = 0

export class ComponentNode extends BaseNode {
  static is(o: unknown): o is ComponentNode {
    return o instanceof ComponentNode
  }

  readonly type = NodeType.Component

  id = componentId++
  tag: FunctionalComponent

  /**
   * Original props, not normalized
   */
  props: AnyProps

  context!: DNodeContext

  /**
   * Host element
   */
  el?: HTMLElement

  root?: NodeElement | null

  constructor(
    type: FunctionalComponent,
    props: AnyProps | undefined,
    children?: unknown[],
  ) {
    super()
    this.tag = type
    this.props = Object.assign({}, props)

    if (children?.length) {
      this.children = normalizeNodes(children)
    }
  }

  initialize() {
    if (this.context) {
      console.error('[ComponentNode] ComponentNode has been initialized')
      return
    }

    const ctx = createNodeContext(this.tag.name)
    ctx._node = this
    this.context = ctx

    appendToCurrentContext(ctx)

    setCurrentContext(ctx)

    const proxiedProps = normalizeProps(this.tag, this.props)

    const rootEl = this.tag(proxiedProps, this.children)
    this.root = rootEl

    if (rootEl != null) {
      rootEl.initialize()
      this.el = rootEl.el as HTMLElement
    }

    popCurrentContext()
  }
}

export function createComponentNode(
  tag: FunctionalComponent,
  props: AnyProps | undefined,
  children?: unknown[],
) {
  const node = new ComponentNode(tag, props, children)

  return node
}
