import type { EmptyObject } from '@0x-jerry/utils'
import type { ToMaybeRef } from '.'
import type { DefineProps } from './props'

export interface PropOption<T = any> {
  type?: T
  default?: T | (() => T)
}

export type PropsType<T = any> = Record<string, T | PropOption<T>>

// export interface ComponentOption<Props extends PropsType = EmptyObject> {
//   name?: string
//   props?: Props
// }

/**
 * @private
 */
export type FunctionalComponent<P extends PropsType = any> = (
  props: P,
  children?: any[],
) => any

type _NoInferProps<P extends EmptyObject> = DefineProps<P> & Record<string, any>

/**
 * Auto calculate props from generic type P
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  impl: NoInfer<FunctionalComponent<_NoInferProps<P>>>,
): FunctionalComponent<ToMaybeRef<P>>

/**
 * Infer props from impl parameter
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  impl: FunctionalComponent<P>,
): FunctionalComponent<ToMaybeRef<P>>

/**
 * implement
 */
export function defineComponent(impl?: any): any {
  // todo check props type
  return impl
}

export const dc = defineComponent
