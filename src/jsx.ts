import { Optional, isString } from '@0x-jerry/utils'
import {
  FragmentType,
  VNode,
  createEl,
  createFragment,
  createUpdater,
  isInternalElements,
  unmount
} from './dom'
import { MaybeRef } from '@vueuse/core'
import { isRef, unref } from '@vue/reactivity'
import { VInternalElements } from './dom'

type FunctionalComponent = (props?: any) => VNode

export function h(
  type: string | FunctionalComponent | VInternalElements,
  props?: Record<string, any>,
  ...children: VNode[]
): VNode {
  if (isInternalElements(type)) {
    return type
  }

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
  const el = createFragment(FragmentType.None, props.children)

  return el
}

export function vIf(
  condition: MaybeRef<boolean>,
  /**
   * should return jsx
   */
  truthy: Optional<() => any>,
  /**
   * should return jsx
   */
  falsy: Optional<() => any>
) {
  const el = createFragment(FragmentType.If)

  const u = createUpdater()

  if (isRef(condition)) {
    u.updaters.push(() => {
      const child = el.firstChild

      if (isInternalElements(child)) {
        unmount(child)
      }

      const newChild = unref(condition) ? truthy?.() : falsy?.()

      if (child) {
        if (newChild) {
          el.replaceChild(newChild, child)
        } else {
          el.removeChild(child)
        }
      } else if (newChild) {
        el.appendChild(newChild)
      }
    })
  }

  u.run()

  el.addEventListener('unmount', u.stop)

  return el
}

export function vFor() {}
