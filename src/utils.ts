import type { Fn, Optional } from '@0x-jerry/utils'
import { unref } from './reactivity'

export const def = Object.defineProperty

export function composeEventListeners<T extends Fn>(
  ...listeners: Optional<T>[]
) {
  return (...args: Parameters<T>) => {
    listeners.forEach((event) => unref(event)?.(...args))
  }
}

export function warn(...msgs: unknown[]) {
  console.warn(msgs)
}
