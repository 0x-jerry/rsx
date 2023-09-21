import { isFn, toArray } from '@0x-jerry/utils'
import { h } from './core'
import { computed, unref } from '@vue/reactivity'
export { Fragment } from './core'

export const jsx = (tag: any, props: { children: any; [key: string]: any }) => {
  const { children, ...other } = props

  const _props: Record<string, any> = {}

  for (const key in other) {
    const prop = other[key]

    _props[key] =
      isFn(prop) && !key.startsWith('on') ? computed(() => unref(prop())) : prop
  }

  const convertedChildren = toArray(children).map((n) =>
    isFn(n) ? computed(() => unref(n())) : n,
  )

  return h(tag, _props, ...convertedChildren)
}

export const jsxs = jsx
