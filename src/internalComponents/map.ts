import { Optional } from '@0x-jerry/utils'
import { createFragment, createUpdaterScope } from '../node'
import { DComponent } from '../node'
import { createTextElement } from '../node'
import { getContext, isFragment } from '../node'
import { MaybeRef } from '../types'
import { isRef, unref } from '@vue/reactivity'

export function vMap<T>(
  list: MaybeRef<T[]>,
  key: keyof T,
  /**
   * should return jsx
   */
  render: (item: T, idx: number) => Optional<DComponent>,
) {
  const anchorStart = createTextElement('')
  const anchorEnd = createTextElement('')

  const el = createFragment([anchorStart, anchorEnd])

  const ctx = getContext(el)

  const u = createUpdaterScope()

  type ChildElement = DComponent & {
    /**
     * if should reuse
     */
    _r?: boolean
  }

  const key2el = new Map<string, ChildElement>()
  const el2key = new Map<ChildElement, string>()

  let renderedChildren: ChildElement[] = []

  if (isRef(list)) {
    u.add(() => {
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
        getContext(child).emit('unmounted')

        el2key.delete(child)
        key2el.delete(keyValue)
      })

      const parent = anchorEnd.parentElement!

      newList.forEach((item) => {
        if (isFragment(item)) {
          item.moveTo(parent, anchorEnd)
        } else {
          parent.insertBefore(item, anchorEnd)
        }
      })

      renderedChildren = newList

      el.children = [anchorStart, ...newList, anchorEnd]
    })
  } else {
    const newList: ChildElement[] = generateNewList()
    const parent = anchorEnd.parentElement!

    newList.forEach((item) => {
      if (isFragment(item)) {
        item.moveTo(parent, anchorEnd)
      } else {
        parent.insertBefore(item, anchorEnd)
      }
    })
    renderedChildren = newList
  }

  ctx.on('mounted', u.run)

  getContext(anchorEnd).on('unmounted', () => {
    u.stop()

    renderedChildren.forEach((item) => {
      getContext(item).emit('unmounted')
    })
  })

  return el

  function generateNewList() {
    const newList: ChildElement[] = []

    unref(list).forEach((n, idx) => {
      const keyValue = String(n[key])

      if (key2el.has(keyValue)) {
        const reuseEl = key2el.get(keyValue)!
        reuseEl._r = true

        newList.push(reuseEl)

        return reuseEl
      }

      const el = render(n, idx)

      if (el) {
        key2el.set(keyValue, el)
        el2key.set(el, keyValue)

        newList.push(el)
      }
    })
    return newList
  }
}
