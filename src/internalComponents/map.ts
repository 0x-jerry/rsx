import { Optional } from '@0x-jerry/utils'
import { createFragment, createUpdaterScope } from '../node'
import { DComponent } from '../node'
import { createTextElement } from '../node'
import { getContext, isFragment } from '../node'
import { MaybeRef } from '../types'
import { computed, effect, isRef, unref } from '@vue/reactivity'
import { stop } from '@vue/reactivity'

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

  type ChildElement = DComponent & {
    /**
     * if should reuse
     */
    _r?: boolean
  }

  const key2el = new Map<string, ChildElement>()
  const el2key = new Map<ChildElement, string>()

  let renderedChildren: ChildElement[] = []

  const keys = computed(() => unref(list).map((n) => n[key]))

  // fix me, infinite loop, should only diff keys.

  let oldKeys: string[] | null = null

  const runner = effect(
    () => {
      if (!oldKeys) oldKeys = keys.value as string[]
      else {
        console.log(oldKeys, keys.value)

        oldKeys = keys.value as string[]
      }

      Promise.resolve().then(update)
    },
    {
      lazy: true,
    },
  )

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

    el.children = [anchorStart,...newList, anchorEnd]
  }

  ctx.on('mounted', runner)

  getContext(anchorEnd).on('unmounted', () => {
    stop(runner)

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
