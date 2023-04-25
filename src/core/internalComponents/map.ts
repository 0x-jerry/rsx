import { Optional } from '@0x-jerry/utils'
import { createFragment, DComponent } from '../node'
import { MaybeRef } from '../types'
import { unref } from '@vue/reactivity'
import { mount, onMounted, unmount, useContext, useWatch } from '../hook'
import { runWithContext } from '../context'
import { h } from '../jsx'
import { insertBefore } from '../nodeOp'

export function VMap<T>(props: {
  list: MaybeRef<T[]>
  key?: (item: T, idx: number) => any
  /**
   * should return jsx
   */
  render: (props: { item: T; index: number }) => JSX.Element
}) {
  const ctx = useContext()

  const el = createFragment()

  type ChildElement = DComponent & {
    /**
     * if should reuse
     */
    _r?: boolean
  }

  const key2el = new Map<string, ChildElement>()
  const el2key = new Map<ChildElement, string>()

  useWatch(
    () => unref(props.list).map(getKey),
    () => runWithContext(update, ctx),
  )

  onMounted(() => {
    runWithContext(update, ctx)
  })

  return el

  function getKey(item: T, index: number) {
    const k = props.key ? props.key(item, index) : item

    return k
  }

  function update() {
    const newList: ChildElement[] = generateNewList()

    el.__children.forEach((child: ChildElement) => {
      const keyValue = el2key.get(child)!
      // skip reuse node
      if (child._r) {
        return
      }

      el2key.delete(child)
      key2el.delete(keyValue)

      // unmount
      unmount(child)
    })

    newList.forEach((item) => {
      insertBefore(el, item)

      // reset reuse flag
      if (item._r) {
        console.log('reuse!')
        item._r = false
        return
      }

      mount(item)
    })

    el.__children = newList
  }

  function generateNewList() {
    const newList: ChildElement[] = []

    unref(props.list).forEach((n, idx) => {
      const keyValue = getKey(n, idx)

      if (key2el.has(keyValue)) {
        const reuseEl = key2el.get(keyValue)!
        reuseEl._r = true

        newList.push(reuseEl)

        return reuseEl
      }

      const el = h(props.render, { item: n, index: idx })

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
) {
  return h(VMap, { list, key, render })
}
