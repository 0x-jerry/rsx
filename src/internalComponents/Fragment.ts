import { defineComponentName } from '@/test'
import {
  AnchorNodeEventNames,
  createAnchorNode,
  dispatchAnchorMovedEvent,
} from '../anchorNode'
import { runWithContext } from '../context'
import type { FunctionalComponent } from '../defineComponent'
import { onBeforeMount, onBeforeUnmount, useContext } from '../hook'
import { normalizeNode } from '../node'
import { insertBefore } from '../nodeOp'

export const Fragment: FunctionalComponent = (_, children) => {
  const anchorNode = createAnchorNode('fragment')
  const ctx = useContext()

  onBeforeMount(() => {
    runWithContext(() => {
      for (const child of children || []) {
        const childEl = normalizeNode(child)

        if (childEl != null) {
          insertBefore(anchorNode, childEl)

          if (!anchorNode.__firstChild) {
            anchorNode.__firstChild = childEl
          }
        }
      }
    }, ctx)
  })

  anchorNode.addEventListener(AnchorNodeEventNames.Moved, () => {
    for (const child of children || []) {
      const childEl = normalizeNode(child)

      if (childEl != null) {
        insertBefore(anchorNode, childEl)
        dispatchAnchorMovedEvent(childEl)
      }
    }
  })

  onBeforeUnmount(() => {
    children?.forEach((child) => child.remove())
  })

  return anchorNode
}

defineComponentName(Fragment, 'Fragment')
