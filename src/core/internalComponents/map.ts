import type { Optional } from '@0x-jerry/utils'
import { runWithContext } from '../context'
import { mount, onMounted, unmount, useContext, useWatch } from '../hook'
import { h } from '../jsx'
import { createFragment, type DComponent } from '../node'
import { insertBefore } from '../nodeOp'
import { unref } from '../reactivity'
import type { MaybeRef } from '../types'

export function VMap<T>(props: {
  list: MaybeRef<T[]>
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

  let dataElMap = new Map<T, ChildElement[]>()

  useWatch(
    () => [...unref(props.list)],
    () => runWithContext(update, ctx),
  )

  onMounted(() => {
    runWithContext(update, ctx)
  })

  return el

  function update() {
    const c1: ChildElement[] = el.__children
    const c2: ChildElement[] = generateNewList()

    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (n1 !== n2) {
        break
      }
      n1._r = false

      i++
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (n1 !== n2) {
        break
      }
      n1._r = false

      e1--
      e2--
    }

    if (i > e1) {
      while (i <= e2) {
        const n = c2[i]
        const anchor = c1[e1 + 1] || el

        insertBefore(anchor, n)
        mount(n)

        i++
      }
    } else if (i > e2) {
      // already unmounted
      // no need to do anything
    } else {
      // const s1 = i
      const s2 = i

      const newSequence: number[] = []
      const oldToNew = new Map<number, number>()

      // todo, move check
      for (let j = s2; j <= e2; j++) {
        const element = c2[j]
        const oldIdx = c1.indexOf(element)
        if (oldIdx !== -1) {
          newSequence.push(oldIdx)
          oldToNew.set(oldIdx, j)
        }
      }

      const increasingNewIndexSequence = getSequence(newSequence)

      let anchorPreviousNode =
        c1[i - 1] || c1[0]?.previousSibling || el.previousSibling

      for (i = s2; i <= e2; i++) {
        const n2 = c2[i]

        if (
          increasingNewIndexSequence.length &&
          oldToNew.get(newSequence[increasingNewIndexSequence[0]]) === i
        ) {
          n2._r = false
          anchorPreviousNode = n2
          increasingNewIndexSequence.shift()
          continue
        }

        insertBefore(anchorPreviousNode?.nextSibling || el, n2)

        if (!n2._r) {
          mount(n2)
        }

        n2._r = false

        anchorPreviousNode = n2
      }
    }

    el.__children = c2
  }

  function generateNewList() {
    const newList: ChildElement[] = []

    const newDataElMap = new Map<T, ChildElement[]>()

    unref(props.list).forEach((dataKey, idx) => {
      if (dataElMap.has(dataKey)) {
        const reuseEl = popElFromMap(dataElMap, dataKey)
        reuseEl._r = true

        appendElToMap(newDataElMap, dataKey, reuseEl)

        newList.push(reuseEl)

        return
      }

      const newEl = h(props.render, { item: dataKey, index: idx })

      if (newEl) {
        appendElToMap(newDataElMap, dataKey, newEl)

        newList.push(newEl)
      }
    })

    dataElMap.values().forEach((item) => {
      item.forEach((child) => {
        unmount(child)
      })
    })

    dataElMap = newDataElMap

    return newList
  }
}

function appendElToMap<K, V>(map: Map<K, V[]>, key: K, value: V) {
  let list = map.get(key)
  if (!list) {
    list = []
    map.set(key, list)
  }

  list.push(value)
}

function popElFromMap<K, V>(map: Map<K, V[]>, key: K) {
  const collection = map.get(key)!
  const reuseEl = collection.shift()!

  if (!collection.length) {
    map.delete(key)
  }

  return reuseEl
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
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
