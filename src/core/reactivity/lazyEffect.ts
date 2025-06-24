import type { Fn } from '@0x-jerry/utils'
import {
  ReactiveEffect,
  type ReactiveEffectOptions,
  type ReactiveEffectRunner,
} from '@vue/reactivity'

export function lazyEffect(fn: Fn, options?: ReactiveEffectOptions) {
  if ((fn as ReactiveEffectRunner).effect instanceof ReactiveEffect) {
    fn = (fn as ReactiveEffectRunner).effect.fn
  }

  const e = new ReactiveEffect(fn)
  if (options) {
    Object.assign(e, options)
  }

  const runner = e.run.bind(e) as ReactiveEffectRunner
  runner.effect = e
  return runner
}
