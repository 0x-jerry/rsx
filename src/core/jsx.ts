import { camelCase, isString, PascalCase } from '@0x-jerry/utils'
import {
  appendToCurrentContext,
  createNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'
import {
  createFragment,
  createNativeElement,
  type DComponent,
  type DElement,
  isDComponent,
} from './node'
import { isRef, unref } from './reactivity'

type FunctionalComponent = (props?: any, children?: unknown[]) => DComponent

export function h(
  type: string | FunctionalComponent | DComponent,
  props?: Record<string, any>,
  ...children: unknown[]
): DElement {
  if (isDComponent(type)) {
    return type
  }

  const _props = transformProps(type, props)

  if (isString(type)) {
    return createNativeElement(type, _props, children)
  }

  return createComponentInstance(type, _props, children)
}

export const Fragment: FunctionalComponent = (_, children) => {
  return createFragment(children || [])
}

function createComponentInstance(
  type: FunctionalComponent,
  props?: any,
  children?: unknown[],
) {
  const ctx = createNodeContext(type.name)

  appendToCurrentContext(ctx)

  setCurrentContext(ctx)

  const el = type(props, children)

  el._ = ctx

  popCurrentContext()
  return el
}

function transformProps(type: any, props?: Record<string, any>): any {
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
