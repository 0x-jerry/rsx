import {
  appendToCurrentContext,
  createNodeContext,
  type DNodeContext,
  popCurrentContext,
  setCurrentContext,
} from '@/context'
import type { FunctionalComponent } from '../defineComponent'
import { type AnyProps, normalizeProps } from '../props'
import { BaseNode, NodeType, normalizeNodes } from './shared'

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
  el?: any

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
    if (!this.context) {
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

    if (rootEl != null) {
      rootEl.initialize()
      this.el = rootEl.el
    }

    popCurrentContext()

    if (this.children) {
      for (const child of this.children) {
        child.initialize()
      }
    }
  }
}

export function createComponentNode(
  type: FunctionalComponent,
  props: AnyProps | undefined,
  children?: unknown[],
) {
  const node = new ComponentNode(type, props, children)

  return node
}
