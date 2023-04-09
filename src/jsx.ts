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
import { isRef, unref } from '@vue/reactivity'
import { VInternalElements } from './dom'
import { MaybeRef } from './types'

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
  } else {
    const newChild = condition ? truthy?.() : falsy?.()
    el.appendChild(newChild)
  }

  u.run()

  el.addEventListener('unmount', u.stop)

  return el
}

export function vFor<T>(
  list: MaybeRef<T[]>,
  key: keyof T,
  /**
   * should return jsx
   */
  render: (item: T, idx: number) => any
) {
  const el = createFragment(FragmentType.For)

  const u = createUpdater()

  type ChildElement = VInternalElements & {
    /**
     * if should reuse
     */
    _r?: boolean
  }

  const key2el = new Map<string, ChildElement>()
  const el2key = new Map<ChildElement, string>()

  if (isRef(list)) {
    u.updaters.push(() => {
      const newList = unref(list).map((n, idx) => {
        const keyValue = String(n[key])

        if (key2el.has(keyValue)) {
          const reuseEl = key2el.get(keyValue)!
          reuseEl._r = true

          return reuseEl
        }

        const el = render(n, idx) as VInternalElements & { _r?: boolean }

        key2el.set(keyValue, el)
        el2key.set(el, keyValue)

        return el
      })

      for (const child of Array.from(el.childNodes) as ChildElement[]) {
        if (child._r) {
          // reset reuse flag
          child._r = false
          continue
        }

        // should delete
        unmount(child)
        const keyValue = el2key.get(child)!

        el2key.delete(child)
        key2el.delete(keyValue)
      }

      el.innerHTML = ''
      el.append(...newList)
    })
  }

  u.run()

  el.addEventListener('unmount', u.stop)

  return el
}
