import { isArray, type Fn, type Optional } from '@0x-jerry/utils'
import { unref } from './reactivity'

export const def = Object.defineProperty

export function composeEventListeners<T extends Fn>(...listeners: Optional<T>[]) {
  return (...args: Parameters<T>) => {
    listeners.forEach((event) => unref(event)?.(...args))
  }
}

export function* normalizeChildren(children?: unknown[]) {
  const stack = children?.slice() || []

  while (stack.length) {
    const child = stack.shift()

    if (isArray(child)) {
      stack.unshift(...child)
      continue
    }

    yield child
  }
}
