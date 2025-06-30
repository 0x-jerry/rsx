import { camelCase, PascalCase } from '@0x-jerry/utils'
import type { Merge, UnionToIntersection } from 'type-fest'
import { isRef, unref } from './reactivity'

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
  Value = any,
  Required extends boolean = false,
> = Key extends `$${infer U}`
  ? Merge<
      Compose<U, Value, false>,
      Compose<`onUpdate${Capitalize<U>}`, (v: Value) => void, false>
    >
  : Compose<Key, Value, Required>

type CalcProps<T extends {}> = Omit<T, FilterPrefix<keyof T, '$'>> &
  UnionToIntersection<MapProp<T, FilterPrefix<keyof T, '$'> | {}>>

type FilterPrefix<T, Prefix extends string> = T extends `${Prefix}${infer _}`
  ? T
  : never

type MapProp<O extends {}, T> = T extends keyof O
  ? T extends FilterPrefix<T, '$'>
    ? Prop<T, O[T], O[T] extends undefined | null ? false : true>
    : {}
  : {}

export type DefineProps<T extends {}> = Merge<CalcProps<T>, {}>

export type AnyProps = Record<string, any>

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
