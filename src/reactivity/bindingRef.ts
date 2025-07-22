import { isFn } from '@0x-jerry/utils'
import { ReactiveFlags, type Ref, unref } from '@vue/reactivity'
import type { AnyProps } from '@/props'
import type { UnRef } from './types'

export { isRef, unref } from '@vue/reactivity'

/**
 * @private
 */
export class BindingRef {
  readonly [ReactiveFlags.IS_REF] = true

  get value() {
    const _value = this._getUnwrappedObject()

    return this.key == null ? _value : _value[this.key]
  }

  set value(value) {
    if (this.key == null) {
      return
    }

    const _value = this._getUnwrappedObject()
    _value[this.key] = value
  }

  constructor(
    readonly objOrFn: any,
    readonly key?: string,
  ) {}

  _getUnwrappedObject() {
    const v = isFn(this.objOrFn) ? this.objOrFn() : this.objOrFn

    return unref(v)
  }

  clone() {
    // @ts-ignore
    return $(this.objOrFn, this.key)
  }
}

/**
 *
 * Generate a lightweight binding ref
 *
 * @param o
 * @param key
 */
function toBindingRef<T extends {}, O extends UnRef<T>, K extends keyof O>(
  o: T | (() => T),
  key: K,
): Ref<UnRef<O[K]>>
function toBindingRef<T>(fn: () => T): Ref<UnRef<T>>
function toBindingRef(fnOrObj: any, key?: string) {
  return new BindingRef(fnOrObj, key) as unknown
}

/**
 * Binding function, convert data to reactive type
 */
export const $ = toBindingRef

export type BindingRefs<T extends AnyProps> = {
  [key in keyof T]-?: Ref<UnRef<T[key]>>
}

export function toBindingRefs<T extends AnyProps>(object: T): BindingRefs<T> {
  const _cache = {} as Record<string, Ref>

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
