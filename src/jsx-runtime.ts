import { h } from './core'
export { Fragment } from './core'

// @ts-ignore
export const jsx = (tag, props) => {
  const { children, ...other } = props
  return h(tag, other, children)
}

export const jsxs = jsx
