import { type Ref, shallowRef } from '@vue/reactivity'
import { asyncWatcherScheduler } from '@/reactivity/scheduler'
import { defineComponentName } from '@/test'
import {
  createAnchorNode,
  dispatchAnchorMovedEvent,
  getAnchorFirstChildNode,
  isAnchorNode,
  listenAnchorMoveEvent,
  setAnchorNodeFirstChildren,
} from '../anchorNode'
import { type DNodeContext, runWithContext } from '../context'
import {
  defineComponent,
  type ExposedFunctionalComponent,
  type FunctionalComponent,
} from '../defineComponent'
import { mount, onBeforeMount, unmount, useContext, useWatch } from '../hook'
import { insertBefore } from '../nodeOp'
import { type ComponentNode, createComponentNode } from '../nodes/ComponentNode'
import { computed } from '../reactivity'

export interface MapItemProps<Item> {
  item: Item
  index: number
}

export type MapItemComponent<Item> = ExposedFunctionalComponent<
  MapItemProps<Item>
>

export interface MapComponentProps<T> {
  list: T[]
  key?: (item: T, index: number) => unknown
  render: FunctionalComponent<MapItemProps<T>>
}

interface ChildContext extends ComponentNode {
  /**
   * mark this is a reuse element
   */
  _r?: boolean
  _props?: {
    item: Ref<unknown>
    index: Ref<number>
  }
}

export const VMap = defineComponent(<T>(props: MapComponentProps<T>) => {
  const ctx = useContext()

  const anchorNode = createAnchorNode('map')

  let children: ChildContext[] = []

  let dataContextMap = new Map<unknown, ChildContext[]>()

  const childrenKeys = computed(() =>
    props.list.map((item, idx) => getItemKey(item, idx)),
  )

  useWatch(
    childrenKeys,
    () => {
      runWithContext(update, ctx)
    },
    {
      scheduler: asyncWatcherScheduler,
    },
  )

  onBeforeMount(() => {
    runWithContext(update, ctx)
  })

  listenAnchorMoveEvent(anchorNode, () => {
    children.forEach((child) => {
      const childEl = child.context?.el
      if (childEl) {
        insertBefore(anchorNode, childEl)

        dispatchAnchorMovedEvent(childEl)
      }
    })
  })

  return anchorNode

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
        const anchor = getFirstChildOfNode(c1[e1 + 1]?.context) || anchorNode

        const nEl = n.context.el
        if (nEl) {
          insertBefore(anchor, nEl)
          dispatchAnchorMovedEvent(nEl)
        }

        if (ctx._mounted) {
          mount(n.context)
        }

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
        c1[i - 1]?.context.el ||
        (c1[0]
          ? getFirstChildOfNode(c1[0]?.context)?.previousSibling
          : anchorNode.previousSibling)

      for (i = s2; i <= e2; i++) {
        const n2 = c2[i]

        if (
          increasingNewIndexSequence.length &&
          oldToNew.get(newSequence[increasingNewIndexSequence[0]]) === i
        ) {
          n2._r = false
          anchorPreviousNode = n2.context.el
          increasingNewIndexSequence.shift()
          continue
        }

        const n2El = n2.context.el
        if (n2El) {
          const anchor =
            (anchorPreviousNode
              ? anchorPreviousNode.nextSibling
              : c1[0]?.context.el?.parentElement
                ? getFirstChildOfNode(c1[0]?.context)
                : null) || anchorNode

          insertBefore(anchor, n2El)
          dispatchAnchorMovedEvent(n2El)

          anchorPreviousNode = n2El
        }

        if (n2._r) {
          n2._r = false
        } else {
          if (ctx._mounted) {
            mount(n2.context)
          }
        }
      }
    }

    children = c2

    // update first child
    {
      const firstEl = children.find((child) => child.context.el)?.context.el
      setAnchorNodeFirstChildren(anchorNode, firstEl)
    }
  }

  function buildNewChildren() {
    const newChildren: ChildContext[] = []

    const newDataContextMap = new Map<unknown, ChildContext[]>()

    props.list.forEach((item, idx) => {
      const dataKey = childrenKeys.value[idx]

      if (dataContextMap.has(dataKey)) {
        const reuseCtx = popItemFromMap(dataContextMap, dataKey)
        reuseCtx._r = true
        if (reuseCtx._props) {
          reuseCtx._props.item.value = item
          reuseCtx._props.index.value = idx
        }

        appendItemToMap(newDataContextMap, dataKey, reuseCtx)

        newChildren.push(reuseCtx)

        return
      }

      const childProps = {
        item: shallowRef(item),
        index: shallowRef(idx),
      }

      const newCtx = createComponentNode(
        props.render,
        childProps,
        [],
      ) as ChildContext

      newCtx._props = childProps

      newCtx.initialize()
      newCtx.context.name = 'VMap.item'

      appendItemToMap(newDataContextMap, dataKey, newCtx)
      newChildren.push(newCtx)
    })

    dataContextMap.values().forEach((ctxList) => {
      ctxList.forEach((child) => {
        if (child.context) {
          unmount(child.context)
        } else {
          throw new Error('child without instance')
        }
      })
    })

    dataContextMap = newDataContextMap

    return newChildren
  }

  function getItemKey(item: T, idx: number) {
    return props.key ? props.key(item, idx) : item
  }
})

defineComponentName(VMap, 'VMap')

function appendItemToMap<K, V>(map: Map<K, V[]>, key: K, value: V) {
  let list = map.get(key)
  if (!list) {
    list = []
    map.set(key, list)
  }

  list.push(value)
}

function popItemFromMap<K, V>(map: Map<K, V[]>, key: K) {
  // biome-ignore lint/style/noNonNullAssertion: already checked before use it
  const collection = map.get(key)!
  // biome-ignore lint/style/noNonNullAssertion: already checked before use it
  const item = collection.shift()!

  if (!collection.length) {
    map.delete(key)
  }

  return item
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  // biome-ignore lint/suspicious/noImplicitAnyLet: just ignore this
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

function getFirstChildOfNode(node?: DNodeContext) {
  if (!node?.el) return

  if (isAnchorNode(node.el)) {
    return getAnchorFirstChildNode(node.el)
  }

  return node.el
}
