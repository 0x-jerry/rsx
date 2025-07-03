import {
  camelCase,
  type EmptyObject,
  isString,
  PascalCase,
} from '@0x-jerry/utils'
import type { Merge, UnionToIntersection } from 'type-fest'
import type { FunctionalComponent } from '.'
import { isRef, unref } from './reactivity'
import { composeEventListeners } from './utils'

type Compose<
  Key extends string,
  Value,
  Required extends boolean,
> = Required extends true
  ? {
      [key in Key]: Value
    }
  : {
      [key in Key]?: Value
    }

type Prop<
  Key extends string,
  Value = unknown,
  Required extends boolean = false,
> = Key extends `$${infer U}`
  ? Merge<
      Compose<U, Value, false>,
      Compose<`onUpdate${Capitalize<U>}`, (v: Value) => void, false>
    >
  : Compose<Key, Value, Required>

type CalcProps<T extends {}> = Omit<T, FilterPrefix<keyof T, '$'>> &
  UnionToIntersection<MapProp<T, FilterPrefix<keyof T, '$'> | EmptyObject>>

type FilterPrefix<T, Prefix extends string> = T extends `${Prefix}${infer _}`
  ? T
  : never

type MapProp<O extends {}, T> = T extends keyof O
  ? T extends FilterPrefix<T, '$'>
    ? Prop<T, O[T], O[T] extends undefined | null ? false : true>
    : EmptyObject
  : EmptyObject

export type DefineProps<T extends {}> = Merge<
  CalcProps<T>,
  { [key in string]: any }
>

export type AnyProps = Record<string, any>

export function normalizeProps(
  type: string | FunctionalComponent,
  props?: AnyProps,
): AnyProps {
  const _raw: AnyProps = {}

  if (!props) return _raw

  for (const key in props) {
    const value = props[key]
    if (!key.startsWith('$')) {
      // Prevent change props directly.
      // Skip overridden event
      if (!_raw[key]) {
        _raw[key] = value
      }

      continue
    }

    if (key === '$') {
      const newProps = isString(type)
        ? transformNativeBindingRef(type, value, props)
        : {}

      // todo, warning when key is duplicated
      Object.assign(_raw, newProps)
      continue
    }

    // binding syntax sugar
    // <input $value:trim={refValue} />
    // todo, support modifier
    const [name, _modifier] = key.slice(1).split(':')
    _raw[camelCase(name)] = value

    if (isRef(value)) {
      // fix me: compose events
      const evtKey = `onUpdate${PascalCase(name)}`
      const existCallback = _raw[evtKey]

      _raw[evtKey] = composeEventListeners((v: unknown) => {
        value.value = v
      }, existCallback)
    }
  }

  // return proxied object
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

/**
 *
 * eg. `<input type="checkbox" $={refValue} />`
 *
 * @param type
 * @param value
 * @param allProps
 * @returns
 */
function transformNativeBindingRef(
  type: string,
  value: unknown,
  allProps: AnyProps,
) {
  const props: AnyProps = {}

  if (type === 'input') {
    if (unref(allProps.type) === 'checkbox') {
      props.checked = value
      if (isRef(value)) {
        props.onChange = composeEventListeners((e: InputEvent) => {
          value.value = (e.target as HTMLInputElement).checked
        }, allProps.onChange)
      }
    } else {
      props.value = value

      if (isRef(value)) {
        props.onInput = composeEventListeners((e: InputEvent) => {
          value.value = (e.target as HTMLInputElement).value
        }, allProps.onInput)
      }
    }
  } else if (type === 'select') {
    props.value = value

    if (isRef(value)) {
      props.onChange = composeEventListeners((e: InputEvent) => {
        value.value = (e.target as HTMLSelectElement).value
      }, allProps.onChange)
    }
  }

  return props
}
