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
  const el = createAnchorNode('fragment')
  const ctx = useContext()

  onBeforeMount(() => {
    runWithContext(() => {
      for (const child of children || []) {
        const childEl = normalizeNode(child)

        if (childEl != null) {
          insertBefore(el, childEl)
        }
      }
    }, ctx)
  })

  el.addEventListener(AnchorNodeEventNames.Moved, () => {
    for (const child of children || []) {
      const childEl = normalizeNode(child)

      if (childEl != null) {
        insertBefore(el, childEl)
        dispatchAnchorMovedEvent(childEl)
      }
    }
  })

  onBeforeUnmount(() => {
    children?.forEach((child) => child.remove())
  })

  return el
}

defineComponentName(Fragment, 'Fragment')
