import { isString } from '@0x-jerry/utils'
import { VNode, createEl, createFragment } from './dom'

type FunctionalComponent = (props?: any) => VNode

export function h(
  type: string | FunctionalComponent,
  props?: Record<string, any>,
  ...children: VNode[]
): VNode {
  if (!isString(type)) {
    const _p = {
      ...props,
      children
    }

    return type(_p)
  }

  return createEl(type, props, children)
}

export function Fragment(props: { children?: any[] }): VNode {
  const el = createFragment()

  for (const child of props.children || []) {
    el.appendChild(child)
  }

  return el
}
