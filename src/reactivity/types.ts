import type { Ref } from '@vue/reactivity'

export type MaybeRef<T> = T | Ref<T>

export type ToMaybeRef<T> = T extends {}
  ? {
      [key in keyof T]: MaybeRef<T[key]>
    }
  : MaybeRef<T>
