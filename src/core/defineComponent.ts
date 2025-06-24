import { isFn } from '@0x-jerry/utils'
import type { Merge } from 'type-fest'
import type { ToMaybeRef } from '.'
import type { DefineProps } from './props'

export interface PropOption<T = any> {
  type?: T
  default?: T | (() => T)
}

export type PropsType<T = any> = Record<string, T | PropOption<T>>

export interface ComponentOption<Props extends PropsType = {}> {
  props?: Props
  toRefs?: boolean
}

interface CommonProps {
  class?: any
  [key: string]: any
}

export type FunctionalComponent<P extends PropsType = {}> = (
  props: Merge<P, CommonProps>,
  children?: any[],
) => JSX.Element

/**
 * without option
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  impl: FunctionalComponent<DefineProps<P>>,
): FunctionalComponent<ToMaybeRef<P>>
/**
 * with option
 * @param opt
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  opt: ComponentOption<P>,
  impl: FunctionalComponent<DefineProps<P>>,
): FunctionalComponent<ToMaybeRef<P>>
/**
 * implement
 */
export function defineComponent<P extends PropsType>(
  opt: ComponentOption<P> | FunctionalComponent,
  impl?: FunctionalComponent,
): FunctionalComponent {
  if (isFn(opt)) return opt

  // todo check props type
  return impl!
}

export const dc = defineComponent
