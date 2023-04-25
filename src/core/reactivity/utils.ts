import { computed } from '@vue/reactivity'

export function toComputed<T extends {}, K extends keyof T>(o: T, key: K) {
  return computed(() => o[key])
}

export const $ = toComputed
