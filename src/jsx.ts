import { Optional, isString, makePair } from '@0x-jerry/utils'
import {
  FragmentType,
  VNode,
  createEl,
  createFragment,
  createTextEl,
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

export function vCase(
  condition: MaybeRef<string | boolean | number>,
  /**
   * should return jsx
   */
  cases: Record<string, () => any>
) {
  const el = createTextEl('')

  const pair = makePair(cases)

  const u = createUpdater()

  let renderedEl: VInternalElements | null = null

  if (isRef(condition)) {
    u.updaters.push(() => {
      const oldChild = renderedEl

      if (isInternalElements(oldChild)) {
        unmount(oldChild)
      }

      const newChild = pair(String(unref(condition)))

      if (oldChild) {
        if (newChild) {
          el.parentElement?.replaceChild(newChild, oldChild)
        } else {
          el.removeChild(oldChild)
        }
      } else if (newChild) {
        el.parentElement?.insertBefore(newChild, el)
      }

      renderedEl = newChild
    })
  } else {
    const newChild = pair(String(unref(condition)))
    el.parentElement?.insertBefore(newChild, el)
  }

  // should waiting `el` to append to it's parent
  Promise.resolve().then(() => u.run())

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
  const el = createTextEl('')

  const u = createUpdater()

  type ChildElement = VInternalElements & {
    /**
     * if should reuse
     */
    _r?: boolean
  }

  const key2el = new Map<string, ChildElement>()
  const el2key = new Map<ChildElement, string>()

  let renderedChildren: ChildElement[] = []

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

      for (const child of renderedChildren) {
        child.remove()

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

      renderedChildren = newList

      // re-render all items
      newList.forEach((item) => {
        el.parentElement?.insertBefore(item, el)
      })
    })
  }

  // should waiting `el` to append to it's parent
  Promise.resolve().then(() => u.run())

  el.addEventListener('unmount', u.stop)

  return el
}
