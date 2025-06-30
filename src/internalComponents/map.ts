import { defineComponentName } from '@/test'
import { type ComponentNode, createComponentNode } from '../ComponentNode'
import { runWithContext } from '../context'
import { defineComponent, type FunctionalComponent } from '../defineComponent'
import { createDynamicNode, dispatchMovedEvent } from '../dynamicNode'
import { mount, onBeforeMount, unmount, useContext, useWatch } from '../hook'
import { insertBefore } from '../nodeOp'
import { unref } from '../reactivity'

export interface MapComponentProps<T> {
  list: T[]
  render: FunctionalComponent<{ item: T; index: number }>
}

interface ChildContext extends ComponentNode {
  /**
   * mark this is a reuse element
   */
  _r?: boolean
}

export const VMap = defineComponent(<T>(props: MapComponentProps<T>) => {
  const ctx = useContext()

  const el = createDynamicNode('map')

  let children: ChildContext[] = []

  let dataContextMap = new Map<T, ChildContext[]>()

  useWatch(
    () => [...unref(props.list)],
    () => runWithContext(() => update(), ctx),
  )

  onBeforeMount(() => {
    runWithContext(() => update(), ctx)
  })

  el.addEventListener('moved', () => {
    children.forEach((child) => {
      const childEl = child.instance?.el
      if (childEl) {
        insertBefore(el, childEl)

        dispatchMovedEvent(childEl)
      }
    })
  })

  return el

  function update() {
    const c1: ChildContext[] = children
    const c2: ChildContext[] = buildNewChildren()

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
        const anchor = c1[e1 + 1]?.instance.el || el

        const nEl = n.instance.el
        if (nEl) {
          insertBefore(anchor, nEl)
          dispatchMovedEvent(nEl)
        }

        mount(n.instance)

        i++
      }
    } else if (i > e2) {
      // already unmounted
      // no need to do anything
    } else {
      const s1 = i
      const s2 = i

      const newSequence: number[] = []
      const oldToNew = new Map<number, number>()

      const cc1 = c1.slice(s1, e1 + 1)

      // todo, move check
      for (let j = s2; j <= e2; j++) {
        const element = c2[j]
        const oldIdx = cc1.indexOf(element)
        if (oldIdx !== -1) {
          newSequence.push(oldIdx)
          oldToNew.set(oldIdx, j)
        }
      }

      const increasingNewIndexSequence = getSequence(newSequence)

      let anchorPreviousNode =
        c1[i - 1]?.instance.el ||
        (c1[0] ? c1[0]?.instance.el?.previousSibling : el.previousSibling)

      for (i = s2; i <= e2; i++) {
        const n2 = c2[i]

        if (
          increasingNewIndexSequence.length &&
          oldToNew.get(newSequence[increasingNewIndexSequence[0]]) === i
        ) {
          n2._r = false
          anchorPreviousNode = n2.instance?.el as ChildNode | null
          increasingNewIndexSequence.shift()
          continue
        }

        const n2El = n2.instance.el
        if (n2El) {
          const anchor =
            (anchorPreviousNode
              ? anchorPreviousNode.nextSibling
              : c1[0]?.instance.el?.parentElement
                ? c1[0]?.instance.el
                : null) || el

          insertBefore(anchor, n2El)
          dispatchMovedEvent(n2El)

          anchorPreviousNode = n2El
        }

        if (n2._r) {
          n2._r = false
        } else {
          mount(n2.instance)
        }
      }
    }

    children = c2
  }

  function buildNewChildren() {
    const newChildren: ChildContext[] = []

    const newDataContextMap = new Map<T, ChildContext[]>()

    props.list.forEach((dataKey, idx) => {
      if (dataContextMap.has(dataKey)) {
        const reuseCtx = popElFromMap(dataContextMap, dataKey)
        reuseCtx._r = true

        appendElToMap(newDataContextMap, dataKey, reuseCtx)

        newChildren.push(reuseCtx)

        return
      }

      const newCtx = createComponentNode(
        props.render,
        {
          item: dataKey,
          index: idx,
        },
        [],
      )

      newCtx.initialize()
      newCtx.instance.name = 'VMap.item'

      appendElToMap(newDataContextMap, dataKey, newCtx)
      newChildren.push(newCtx)
    })

    dataContextMap.values().forEach((ctxList) => {
      ctxList.forEach((child) => {
        if (child.instance) {
          unmount(child.instance)
        } else {
          throw new Error('child without instance')
        }
      })
    })

    dataContextMap = newDataContextMap

    return newChildren
  }
})

defineComponentName(VMap, 'VMap')

function appendElToMap<K, V>(map: Map<K, V[]>, key: K, value: V) {
  let list = map.get(key)
  if (!list) {
    list = []
    map.set(key, list)
  }

  list.push(value)
}

function popElFromMap<K, V>(map: Map<K, V[]>, key: K) {
  // biome-ignore lint/style/noNonNullAssertion: has checked before
  const collection = map.get(key)!
  // biome-ignore lint/style/noNonNullAssertion: has checked before
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
  // biome-ignore lint/suspicious/noImplicitAnyLet: just ignored
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
