import { camelCase, isObject, PascalCase } from '@0x-jerry/utils'
import {
  appendToCurrentContext,
  createNodeContext,
  type DNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'
import type { FunctionalComponent } from './defineComponent'
import { isHTMLNode } from './node'
import type { AnyProps } from './props'
import { isRef, unref } from './reactivity'

let componentId = 0

export class ComponentNode {
  readonly __cf = true

  id = componentId++
  type: FunctionalComponent
  props?: AnyProps
  children: unknown[]

  instance!: DNodeContext

  _initialized = false

  constructor(
    type: FunctionalComponent,
    props: AnyProps | undefined,
    children: unknown[],
  ) {
    this.type = type
    this.props = props
    this.children = children
  }

  initialize() {
    if (this._initialized) {
      console.error('[ComponentNode] ComponentNode has been initialized')
      return
    }

    this.instance = this._createComponentInstance()
  }

  _createComponentInstance() {
    const ctx = createNodeContext(this.type.name)

    appendToCurrentContext(ctx)

    setCurrentContext(ctx)

    const rootEl = this.type(this.props, this.children)

    if (isComponentNode(rootEl)) {
      rootEl.initialize()

      ctx.el = rootEl.instance.el
    } else if (isHTMLNode(rootEl)) {
      ctx.el = rootEl as ChildNode
    } else {
      console.warn('[ComponentNode] Invalid component node', rootEl)
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

export function transformProps(type: any, props?: AnyProps): any {
  const _raw: Record<string, any> = {}

  if (!props) return _raw

  Object.entries(props).forEach(([key, value]) => {
    if (!key.startsWith('$')) {
      // Prevent change props directly.
      _raw[key] = value
      return
    }

    if (key === '$') {
      const newProps = transformDefaultBinding(type, value, props)

      // todo, check duplicate key
      Object.assign(_raw, newProps)
      return
    }

    // normal binding syntax sugar
    // <input $value:trim={refValue} />

    const [name, modifier] = key.slice(1).split(':')
    _raw[camelCase(name)] = value

    if (isRef(value)) {
      // fix me: compose events
      _raw[`onUpdate${PascalCase(name)}`] = (v: unknown) => {
        value.value = v
      }
    }
  })

  // return _raw
  return new Proxy(_raw, {
    get(t, p, r) {
      return unref(Reflect.get(t, p, r))
    },
    set() {
      // Prevent change props directly.
      return true
    },
  })
}

// todo, default binding syntax sugar
// current: $xx={refValue}
// support new sugar: $xx={[data, 'key']}
function transformDefaultBinding(
  type: any,
  value: any,
  allProps: Record<string, any>,
) {
  const props: Record<string, any> = {}

  if (type === 'input') {
    if (unref(allProps.type) === 'checkbox') {
      props.checked = value
      if (isRef(value)) {
        props.onChange = (e: InputEvent) => {
          value.value = (e.target as HTMLInputElement).checked
        }
      }
    } else {
      props.value = value

      if (isRef(value)) {
        props.onInput = (e: InputEvent) => {
          value.value = (e.target as HTMLInputElement).value
        }
      }
    }
  } else if (type === 'select') {
    props.value = value

    if (isRef(value)) {
      props.onChange = (e: InputEvent) => {
        value.value = (e.target as HTMLSelectElement).value
      }
    }
  }

  return props
}
