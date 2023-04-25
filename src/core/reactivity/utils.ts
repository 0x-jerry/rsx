import { computed, isReactive, toRef } from '@vue/reactivity'

function toReactiveRef<T extends {}, K extends keyof T>(o: T, key: K) {
  return isReactive(o) ? toRef(o, key) : computed(() => o[key])
}

export const $ = toReactiveRef
