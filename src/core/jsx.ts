import { isString, camelCase, PascalCase, makePair } from '@0x-jerry/utils'
import {
  DComponent,
  DNode,
  createFragment,
  createNativeElement,
  isDComponent,
} from './node'
import { isRef, unref } from '@vue/reactivity'
import {
  appendToCurrentContext,
  createNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'

type FunctionalComponent = (props?: any, children?: DNode[]) => DComponent

export function h(
  type: string | FunctionalComponent | DComponent,
  props?: Record<string, any>,
  ...children: DComponent[]
): DComponent {
  if (isDComponent(type)) {
    return type
  }

  const _props = transformProps(type, props)

  if (type === Fragment) {
    return type(_props, children)
  }

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
  children?: DComponent[],
) {
  const ctx = createNodeContext(type.name)
  appendToCurrentContext(ctx)

  setCurrentContext(ctx)

  // ctx.on('mounted', () => console.log('mounted', ctx.name))

  const el = type(props, children)

  el._ = ctx

  popCurrentContext()
  return el
}

function transformProps(type: any, props?: Record<string, any>): any {
  if (!props) return {}

  const _raw: Record<string, any> = {}

  Object.entries(props).forEach(([key, value]) => {
    if (!key.startsWith('$')) {
      _raw[key] = value
      return
    }

    if (key === '$') {
      const props = transformDefaultBinding(type, value)

      // todo, check duplicate key
      Object.assign(_raw, props)
      return
    }

    // normal binding syntax sugar
    // <input $value:trim={refValue} />

    const [name, modifier] = key.slice(1).split(':')
    _raw[camelCase(name)] = value

    if (isRef(value)) {
      // fix me: compose events
      _raw[`on${PascalCase(name)}`] = (v: unknown) => (value.value = v)
    }
  })

  return _raw
  // const _props: Record<string, any> = new Proxy(_raw, {
  //   get(_, key) {
  //     return unref(_raw[key as string])
  //   },
  //   set() {
  //     return false
  //   },
  // })

  // return _props
}

// todo, default binding syntax sugar
function transformDefaultBinding(type: any, value: any) {
  const props: Record<string, any> = {}

  if (type === 'input') {
    if (props.type === 'checkbox') {
      props.checked = value
      if (isRef(value)) {
        props.onChange = (e: InputEvent) =>
          (value.value = (e.target as HTMLInputElement).checked)
      }
    } else {
      props.value = value

      if (isRef(value)) {
        props.onInput = (e: InputEvent) =>
          (value.value = (e.target as HTMLInputElement).value)
      }
    }
  } else if (type === 'select') {
    props.value = value

    if (isRef(value)) {
      props.onChange = (e: InputEvent) =>
        (value.value = (e.target as HTMLSelectElement).value)
    }
  }

  return props
}
