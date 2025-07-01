import { isFn } from '@0x-jerry/utils'
import {
  isRef as _isRef,
  type ComputedRef,
  type Ref,
  type UnwrapRef,
} from '@vue/reactivity'
import type { AnyProps } from '@/props'

/**
 * @private
 */
export class BindingRef {
  get value() {
    const _value = this._getUnwrappedObject()

    return this.key == null ? _value : _value[this.key!]
  }

  set value(value) {
    if (this.key == null) {
      return
    }

    const _value = this._getUnwrappedObject()
    _value[this.key!] = value
  }

  constructor(
    readonly objOrFn: any,
    readonly key?: string,
  ) {}

  _getUnwrappedObject() {
    const v = isFn(this.objOrFn) ? this.objOrFn() : this.objOrFn

    return unref(v)
  }
}

/**
 *
 * Generate a lightweight binding ref
 *
 * @param o
 * @param key
 */
function toBindingRef<T extends {}, O extends UnwrapRef<T>, K extends keyof O>(
  o: T | (() => T),
  key: K,
): Ref<UnwrapRef<O[K]>>
function toBindingRef<T>(fn: () => T): Ref<UnwrapRef<T>>
function toBindingRef(fnOrObj: any, key?: string) {
  return new BindingRef(fnOrObj, key) as unknown
}

/**
 * Binding function, convert data to reactive type
 */
export const $ = toBindingRef

export function isRef(value: unknown): value is Ref<unknown> {
  return _isRef(value) || value instanceof BindingRef
}

export function unref<T>(value: T | Ref<T> | ComputedRef<T>): T {
  return isRef(value) ? value.value : value
}

export type BindingRefs<T extends AnyProps> = {
  [key in keyof T]: Ref<UnwrapRef<T[key]>>
}

export function toBindingRefs<T extends AnyProps>(object: T): BindingRefs<T> {
  const refs = {} as BindingRefs<T>

  for (const key in object) {
    // @ts-ignore
    refs[key] = toBindingRef(object, key)
  }

  return refs
}
