import { isFn } from '@0x-jerry/utils'
import { brandSignal, isRef, toValue } from './helpers'
import type { AnyProps } from '../props'
import type { Signal, UnRef } from './types'

/**
 * Create a binding signal: a callable that reads (and optionally writes
 * through) a property of an object, the result of a function, or a signal.
 *
 * - `$(obj, 'key')` — writable binding: `()` reads `obj.key`, `(v)` writes it.
 * - `$(fn)` — read-only binding: `()` re-evaluates `fn()`; `(v)` is a no-op.
 * - `$(signal)` — writable binding backed by the signal itself.
 */
function toBindingRef<T extends {}, K extends keyof UnRef<T>>(
  fn: () => T,
  key: K,
): Signal<UnRef<T>[K]>
function toBindingRef<T extends {}, K extends keyof UnRef<T>>(
  o: T,
  key: K,
): Signal<UnRef<T>[K]>
function toBindingRef<T>(fn: () => T): Signal<UnRef<T>>
function toBindingRef(fnOrObj: any, key?: string) {
  const isFnValue = isFn(fnOrObj)

  const get = () => {
    const value = toValue(isFnValue ? fnOrObj() : fnOrObj)
    return key == null ? value : value[key]
  }

  const set = (value: any) => {
    if (key != null) {
      const obj = toValue(isFnValue ? fnOrObj() : fnOrObj)
      obj[key] = value
      return
    }

    if (isRef(fnOrObj)) {
      fnOrObj(value)
    }
  }

  const s = ((...args: any[]) => {
    if (args.length) {
      set(args[0])
      return
    }
    return get()
  }) as Signal<any>

  return brandSignal(s)
}

/**
 * Binding function, convert data to a reactive signal.
 */
export const $ = toBindingRef

export type BindingRefs<T extends AnyProps> = {
  [key in keyof T]-?: Signal<UnRef<T[key]>>
}

export function toBindingRefs<T extends AnyProps>(object: T): BindingRefs<T> {
  const _cache = {} as Record<string, Signal<any>>

  /**
   * lazy initialize
   */
  const proxiedObject = new Proxy(object, {
    get(target, p, _receiver) {
      const key = p as string
      const v = _cache[key]
      if (v) {
        return v
      }

      _cache[key] = toBindingRef(target, key as any)

      return _cache[key]
    },
  })

  return proxiedObject as any
}
