import { isFn } from '@0x-jerry/utils'
import { isRef as _isRef, type ComputedRef, type Ref } from '@vue/reactivity'
import type { AnyProps } from '@/props'

/**
 * @private
 */
export class BindingRef {
  #isFn = false

  get value() {
    return this.#isFn ? this.objOrFn() : this.objOrFn[this.key!]
  }

  set value(value) {
    if (this.#isFn) {
      return
    }

    this.objOrFn[this.key!] = value
  }

  constructor(
    readonly objOrFn: any,
    readonly key?: string,
  ) {
    this.#isFn = isFn(objOrFn)
  }
}

/**
 *
 * Generate a lightweight binding ref
 *
 * @param o
 * @param key
 */
function toBindingRef<T extends {}, K extends keyof T>(o: T, key: K): Ref<T[K]>
function toBindingRef<T>(fn: () => T): Ref<T>
function toBindingRef(fnOrObj: any, key?: string) {
  return new BindingRef(fnOrObj, key) as unknown as Ref<any>
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
  [key in keyof T]: Ref<T[key]>
}

export function toBindingRefs<T extends AnyProps>(object: T): BindingRefs<T> {
  const refs = {} as BindingRefs<T>

  for (const key in object) {
    refs[key] = toBindingRef(object, key)
  }

  return refs
}
