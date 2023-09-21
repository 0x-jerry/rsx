import { isFn, toArray } from '@0x-jerry/utils'
import { h } from './core'
import { computed, unref } from '@vue/reactivity'
export { Fragment } from './core'

export const jsx = (tag: any, props: { children: any }) => {
  const { children, ...other } = props

  const convertedChildren = toArray(children).map((n) =>
    isFn(n) ? computed(() => unref(n())) : n,
  )

  return h(tag, other, ...convertedChildren)
}

export const jsxs = jsx
