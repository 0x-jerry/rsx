import { Optional } from '@0x-jerry/utils'
import { createFragment } from '../node'
import { DComponent } from '../node'
import { MaybeRef } from '../types'
import { unref } from '@vue/reactivity'
import { onUnmounted, unmount, useContext } from '..'
import { watch } from '../reactivity'
import { runWithContext } from '../context'

export function VMap<T>(props: {
  list: MaybeRef<T[]>
  key: keyof T
  /**
   * should return jsx
   */
  render: (item: T, idx: number) => Optional<DComponent>
}) {
  const ctx = useContext()

  const el = createFragment([])

  el._ = ctx

  type ChildElement = DComponent & {
    /**
     * if should reuse
     */
    _r?: boolean
  }

  const key2el = new Map<string, ChildElement>()
  const el2key = new Map<ChildElement, string>()

  let renderedChildren: ChildElement[] = []

  const stop = watch(
    () => unref(props.list).map((n) => n[props.key]),
    () => runWithContext(update, ctx),
  )

  onUnmounted(stop)

  return el

  function update() {
    const newList: ChildElement[] = generateNewList()

    // todo Minimum movement algorithm

    renderedChildren.forEach((child) => {
      const keyValue = el2key.get(child)!
      if (child._r) {
        // reset reuse flag
        child._r = false
        return
      }

      // unmount
      unmount(child)

      el2key.delete(child)
      key2el.delete(keyValue)
    })

    newList.forEach((item) => {
      el.appendChild(item)
    })

    renderedChildren = newList
  }

  function generateNewList() {
    const newList: ChildElement[] = []

    unref(props.list).forEach((n, idx) => {
      const keyValue = String(n[props.key])

      if (key2el.has(keyValue)) {
        const reuseEl = key2el.get(keyValue)!
        reuseEl._r = true

        newList.push(reuseEl)

        return reuseEl
      }

      const el = props.render(n, idx)

      if (el) {
        key2el.set(keyValue, el)
        el2key.set(el, keyValue)

        newList.push(el)
      }
    })
    return newList
  }
}

export function vMap<T>(
  list: MaybeRef<T[]>,
  key: keyof T,
  /**
   * should return jsx
   */
  render: (item: T, idx: number) => Optional<DComponent>,
) {}
