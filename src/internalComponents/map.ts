import { type Ref, shallowRef } from '@vue/reactivity'
import { asyncWatcherScheduler } from '../reactivity/scheduler'
import {
  defineComponent,
  defineComponentName,
  type ExposedFunctionalComponent,
  type FunctionalComponent,
} from '../defineComponent'
import { moveTo } from '../nodeOp'
import { computed } from '../reactivity'
import {
  ComponentContextEventNameMap,
  getNodeElement,
  moveNode,
  runWithContext,
  triggerEvent,
  type InternalComponentOps,
  type NodeElementRange,
} from '../nodes'
import { useWatch } from '../hook'
import { connect, disconnect, unmount } from '../ops'
import { h } from '../jsx'
import type { ComponentNode } from './ComponentNode'

export interface MapItemProps<Item> {
  item: Item
  index: number
}

export type MapItemComponent<Item> = ExposedFunctionalComponent<MapItemProps<Item>>

export interface MapComponentProps<T> {
  list: T[]
  key?: (item: T, index: number) => unknown
  render: FunctionalComponent<MapItemProps<T>>
}

interface ChildComponentNode extends ComponentNode {
  /**
   * mark this is a reuse element
   */
  _r?: boolean
  _props?: {
    item: Ref<unknown>
    index: Ref<number>
  }
}

interface MapComponentNode extends ComponentNode {
  _el?: Comment
  _renderedNodes?: ComponentNode[]
}

export const VMap = defineComponent(<T>(_props: MapComponentProps<T>) => {})

defineComponentName(VMap, 'VMap')

export const MapOps: InternalComponentOps = {
  is: isMapComponent,
  connect: connectMapNode,
  move: moveMapNode,
  getElementRange: getMapNodeElement,
  disconnect: disconnectMapNode,
}

function isMapComponent(type: FunctionalComponent) {
  return type === VMap
}

function connectMapNode(node: MapComponentNode, parentEl?: ParentNode) {
  const ctx = node.context!
  node._el = document.createComment('Map')
  parentEl?.append(node._el)

  const props = (ctx.props || {}) as MapComponentProps<any>

  let children: ChildComponentNode[] = []

  let dataContextMap = new Map<unknown, ChildComponentNode[]>()

  const childrenKeys = computed(() => props.list.map((item, idx) => getItemKey(item, idx)))

  const updateWithContext = (firstTime = false) => runWithContext(() => update(firstTime), ctx)

  useWatch(childrenKeys, () => updateWithContext(), {
    scheduler: asyncWatcherScheduler,
  })

  updateWithContext(true)

  function update(firstTime = false) {
    const c1: ChildComponentNode[] = children
    const c2: ChildComponentNode[] = buildNewChildren()

    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    /**
     * Track the last sorted element
     */
    let lastFinishedAnchor: ChildNode = node._el!

    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (n1 !== n2) {
        break
      }
      n1._r = false

      lastFinishedAnchor = getLastElement(n2) || lastFinishedAnchor
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

        const anchor = lastFinishedAnchor?.nextSibling

        if (node._el?.parentElement) {
          moveNode(n, node._el.parentElement, anchor)
        }

        lastFinishedAnchor = getLastElement(n) || lastFinishedAnchor

        if (!firstTime) {
          triggerEvent(ComponentContextEventNameMap.mounted, n.context!)
        }

        i++
      }
    } else if (i > e2) {
      // do nothing, already unmounted in `buildNewChildren`
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

      for (i = s2; i <= e2; i++) {
        const n2 = c2[i]

        if (
          increasingNewIndexSequence.length &&
          oldToNew.get(newSequence[increasingNewIndexSequence[0]]) === i
        ) {
          n2._r = false
          increasingNewIndexSequence.shift()
        } else {
          const anchor = lastFinishedAnchor?.nextSibling

          if (node._el?.parentElement) {
            moveNode(n2, node._el.parentElement, anchor)
          }
          if (n2._r) {
            n2._r = false
          } else if (!firstTime) {
            triggerEvent(ComponentContextEventNameMap.mounted, n2.context!)
          }
        }

        lastFinishedAnchor = getLastElement(n2) || lastFinishedAnchor
      }
    }

    children = c2

    node._renderedNodes = children
  }

  function buildNewChildren() {
    const newChildren: ChildComponentNode[] = []

    const newDataContextMap = new Map<unknown, ChildComponentNode[]>()

    props.list.forEach((item, idx) => {
      const dataKey = childrenKeys.value[idx]

      if (dataContextMap.has(dataKey)) {
        const reuseNode = popItemFromMap(dataContextMap, dataKey)
        reuseNode._r = true

        if (reuseNode._props) {
          reuseNode._props.item.value = item
          reuseNode._props.index.value = idx
        }

        appendItemToMap(newDataContextMap, dataKey, reuseNode)

        newChildren.push(reuseNode)

        return
      }

      const childProps = {
        item: shallowRef(item),
        index: shallowRef(idx),
      }

      const newCtx = h(props.render, childProps) as ChildComponentNode

      const pEl = document.createDocumentFragment()

      connect(newCtx, pEl)

      newCtx._props = childProps

      appendItemToMap(newDataContextMap, dataKey, newCtx)
      newChildren.push(newCtx)
    })

    dataContextMap.values().forEach((ctxList) => {
      for (const child of ctxList) {
        unmount(child)
      }
    })

    dataContextMap = newDataContextMap

    return newChildren
  }

  function getItemKey<T>(item: T, idx: number) {
    return props.key ? props.key(item, idx) : item
  }
}

function disconnectMapNode(node: MapComponentNode) {
  for (const child of node._renderedNodes || []) {
    disconnect(child)
  }

  node._el?.remove()
}

function moveMapNode(node: MapComponentNode, parentEl: ParentNode, anchor?: Node) {
  const currentAnchor = node._el
  if (!currentAnchor) {
    throw new Error(`Map component not mounted!`)
  }

  moveTo(parentEl, currentAnchor, anchor)

  for (const child of node._renderedNodes || []) {
    moveNode(child, parentEl, anchor)
  }
}

function getMapNodeElement(node: MapComponentNode): NodeElementRange {
  const first = node._renderedNodes?.at(0)
  const last = node._renderedNodes?.at(-1)

  const result = {
    start: getNodeElement(first)?.start,
    end: getNodeElement(last)?.end,
  }

  return result
}

// --------------

function getLastElement(node: ChildComponentNode) {
  return getNodeElement(node)?.end
}

function appendItemToMap<K, V>(map: Map<K, V[]>, key: K, value: V) {
  let list = map.get(key)
  if (!list) {
    list = []
    map.set(key, list)
  }

  list.push(value)
}

function popItemFromMap<K, V>(map: Map<K, V[]>, key: K) {
  const collection = map.get(key)!
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
