import type { EmptyObject } from '@0x-jerry/utils'
import type { DefineProps } from './props'
import type { IsStartWithCapitalizedLetter, MaybeRef } from './types'

export type PropsType<T = any> = Record<string, T>

type ToPropRefs<T extends {}> = {
  /**
   * Start with capitalized letter means this prop is not used as reactive prop
   */
  [key in keyof T]: key extends IsStartWithCapitalizedLetter<key>
    ? T[key]
    : MaybeRef<T[key]>
}

/**
 * @private
 */
export type FunctionalComponent<P extends PropsType = any> = (
  props: P,
  children?: any[],
) => unknown

type _NoInferProps<P extends EmptyObject> = DefineProps<P> & Record<string, any>

export type ExposedFunctionalComponent<P extends PropsType = any> =
  FunctionalComponent<ToPropRefs<P>>

/**
 * Auto calculate props from generic type P
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  impl: NoInfer<FunctionalComponent<_NoInferProps<P>>>,
): ExposedFunctionalComponent<P>

/**
 * Infer props from impl parameter
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  impl: FunctionalComponent<P>,
): ExposedFunctionalComponent<P>

/**
 * implement
 */
export function defineComponent(impl?: any): any {
  // todo check props type
  return impl
}

export const dc = defineComponent
