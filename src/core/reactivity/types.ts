import { ComputedRef, Ref } from '@vue/reactivity'

type RefType<T> = Ref<T> | ComputedRef<T>

export type MaybeRef<T> = T | RefType<T>

export type ToMaybeRef<T> = T extends {}
  ? {
      [key in keyof T]: MaybeRef<T[key]>
    }
  : MaybeRef<T>
