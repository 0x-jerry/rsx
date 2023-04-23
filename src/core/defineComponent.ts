import { isFn } from '@0x-jerry/utils'
import { ToRefs, proxyRefs } from '@vue/reactivity'

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
  props: ToRefs<P>,
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
  if (isFn(opt)) return wrap(opt)

  // todo check props
  return wrap(impl!)

  function wrap(impl: FunctionalComponent<P>): FunctionalComponent<P> {
    return (props, children) => {
      const _props = proxyRefs(props)
      return impl(_props as any, children)
    }
  }
}

export const dc = defineComponent
