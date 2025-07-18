import { isObject } from '@0x-jerry/utils'
import {
  appendToCurrentContext,
  createNodeContext,
  type DNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'
import type { FunctionalComponent } from './defineComponent'
import { isHTMLNode } from './node'
import { type AnyProps, normalizeProps } from './props'

let componentId = 0

export class ComponentNode {
  readonly __cf = true

  id = componentId++
  type: FunctionalComponent

  /**
   * Original props, not normalized
   */
  props: AnyProps

  /**
   * Original children, not normalized
   */
  children: unknown[]

  instance!: DNodeContext

  _initialized = false

  constructor(
    type: FunctionalComponent,
    props: AnyProps | undefined,
    children: unknown[],
  ) {
    this.type = type
    this.props = Object.assign({}, props)
    this.children = children
  }

  initialize() {
    if (this._initialized) {
      console.error('[ComponentNode] ComponentNode has been initialized')
      return
    }

    this.instance = this._createComponentInstance()
    this._initialized = true
  }

  _createComponentInstance() {
    const ctx = createNodeContext(this.type.name)
    ctx._node = this

    appendToCurrentContext(ctx)

    setCurrentContext(ctx)

    const proxiedProps = normalizeProps(this.type, this.props)

    const rootEl = this.type(proxiedProps, this.children)

    if (rootEl != null) {
      if (isComponentNode(rootEl)) {
        rootEl.initialize()

        ctx.el = rootEl.instance.el
      } else if (isHTMLNode(rootEl)) {
        ctx.el = rootEl as ChildNode
      } else {
        console.warn('[ComponentNode] Invalid component node', rootEl)
      }
    }

    popCurrentContext()

    return ctx
  }
}

export function createComponentNode(
  type: FunctionalComponent,
  props: AnyProps | undefined,
  children: unknown[],
) {
  const node = new ComponentNode(type, props, children)

  return node
}

export function isComponentNode(o: unknown): o is ComponentNode {
  return isObject(o) && '__cf' in o && o.__cf === true
}
