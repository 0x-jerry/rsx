import { isFn } from '@0x-jerry/utils'

export interface PropOption<T = any> {
  type?: T
  default?: T | (() => T)
}

export type PropsType<T = any> = Record<string, T | PropOption<T>>

export interface ComponentOption<Props extends PropsType = {}> {
  props?: Props
  toRefs?: boolean
}

export type FunctionalComponent<P extends PropsType> = (
  props: P,
  children?: any[],
) => JSX.Element

/**
 * without option
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  impl: FunctionalComponent<P>,
): FunctionalComponent<P>
/**
 * with option
 * @param opt
 * @param impl
 */
export function defineComponent<P extends PropsType>(
  opt: ComponentOption<P>,
  impl: FunctionalComponent<P>,
): FunctionalComponent<P>
/**
 * implement
 */
export function defineComponent<P extends PropsType>(
  opt: ComponentOption<P> | FunctionalComponent<P>,
  impl?: FunctionalComponent<P>,
): FunctionalComponent<P> {
  if (isFn(opt)) return opt

  // todo check props type
  return impl!
}

export const dc = defineComponent
