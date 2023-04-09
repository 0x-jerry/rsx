import { Optional, isString } from '@0x-jerry/utils'
import { FragmentType, VNode, createEl, createFragment } from './dom'
import { MaybeRef } from '@vueuse/core'
import { isRef } from '@vue/reactivity'

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

export function vIf(
  condition: MaybeRef<boolean>,
  truety: Optional<() => VNode>,
  falsy: Optional<() => VNode>
) {
  const el = createFragment(FragmentType.If)

  if (isRef(condition)) {

  }
}

export function vFor() {}
