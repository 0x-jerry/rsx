import {
  effect,
  isRef,
  stop,
  unref,
  type Ref,
  type ReactiveEffectOptions,
} from '@vue/reactivity'
import { type Promisable, isArray, isFn } from '@0x-jerry/utils'
import { queueJob } from '../scheduler'

export type StopWatcher = () => void

export type TriggerFn<T> = (newVal: T, oldValue?: T) => Promisable<void>

export interface WatchOption extends Omit<ReactiveEffectOptions, 'lazy'> {
  immediate?: boolean
}

/**
 * used to check oldValue
 */
const initOldValue = Symbol()

export function watch<T>(
  getter: Ref<T> | (() => T),
  fn: TriggerFn<T>,
  option?: WatchOption,
): StopWatcher {
  let oldVal: any = initOldValue
  let triggered = false

  const getterIsRef = isRef(getter)

  const runner = effect(effectFn, {
    ...option,
    lazy: false,
    scheduler: () => {
      queueJob(runner)
    },
  })

  return () => stop(runner)

  function effectFn() {
    let newVal: any

    if (getterIsRef) {
      newVal = getter.value
    } else if (isFn(getter)) {
      newVal = getter()
    }

    newVal = unref(newVal)

    if (isEq(oldVal, newVal)) {
      return
    }

    if (option?.immediate || (!option?.immediate && triggered)) {
      fn(newVal, oldVal === initOldValue ? undefined : oldVal)
      oldVal = newVal
    }

    triggered = true
  }
}

function isEq(a: unknown, b: unknown) {
  if (isArray(a) && isArray(b) && a.length === b.length) {
    return a.every((v, idx) => v === b[idx])
  }

  return a === b
}
