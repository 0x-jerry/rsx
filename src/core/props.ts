import type { Merge, UnionToIntersection } from 'type-fest'

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
