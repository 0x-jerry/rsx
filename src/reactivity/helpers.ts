import { REF_BRAND, type MaybeRef, type Signal } from './types'

export function brandSignal<T extends (...args: any[]) => any>(fn: T): T & { [REF_BRAND]: true } {
  ;(fn as any)[REF_BRAND] = true
  return fn as T & { [REF_BRAND]: true }
}

export function isRef(value: unknown): value is Signal<any> {
  return typeof value === 'function' && (value as any)[REF_BRAND] === true
}

export function toValue<T>(value: MaybeRef<T>): T {
  return isRef(value) ? (value as Signal<T>)() : (value as T)
}

export const unref = toValue

// ---------------- readonly ----------------

const readonlyCache = new WeakMap<object, object>()

/**
 * Non-reactive deep readonly view of an object. Used by `useExpose` to prevent
 * consumers from mutating exposed state. Sets are silently ignored.
 *
 * Proxies are cached per raw target so repeated access (including nested
 * property reads) returns the same readonly proxy instead of the raw object.
 */
export function readonly<T extends object>(target: T): Readonly<T> {
  const cached = readonlyCache.get(target)
  if (cached) {
    return cached as Readonly<T>
  }

  const proxy = new Proxy(target, {
    get(t, p, r) {
      const value = Reflect.get(t, p, r)
      return isObject(value) ? readonly(value) : value
    },
    set() {
      return true
    },
    deleteProperty() {
      return true
    },
  }) as Readonly<T>

  readonlyCache.set(target, proxy)

  return proxy
}

function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}
