import { isFn, toArray } from '@0x-jerry/utils'
import { h } from './core'
import { computed, isRef, unref } from '@vue/reactivity'
export { Fragment } from './core'

const excludePrefixReg = /^(on|_)/

export const jsx = (tag: any, props: { children: any; [key: string]: any }) => {
  const { children, ...other } = props

  const _props: Record<string, any> = {}

  for (const key in other) {
    const prop = other[key]

    if (excludePrefixReg.test(key)) {
      _props[key] = prop
      continue
    }

    if (!isFn(prop)) {
      _props[key] = prop
      continue
    }

    if (isRef(prop())) {
      _props[key] = prop()
    } else {
      _props[key] = computed(() => prop())
    }
  }

  const convertedChildren = toArray(children).map((n) =>
    isFn(n) ? computed(() => unref(n())) : n,
  )

  return h(tag, _props, ...convertedChildren)
}

export const jsxs = jsx
