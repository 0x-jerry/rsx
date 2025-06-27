import { runWithContext } from '../context'
import type { FunctionalComponent } from '../defineComponent'
import { createDynamicNode, dispatchMovedEvent } from '../dynamicNode'
import { onBeforeMount, onBeforeUnmount, useContext } from '../hook'
import { normalizeNode } from '../node'
import { insertBefore } from '../nodeOp'

export const Fragment: FunctionalComponent = (_, children) => {
  const el = createDynamicNode('fragment')
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

  el.addEventListener('moved', () => {
    for (const child of children || []) {
      const childEl = normalizeNode(child)

      if (childEl != null) {
        insertBefore(el, childEl)
        dispatchMovedEvent(childEl)
      }
    }
  })

  onBeforeUnmount(() => {
    children?.forEach((child) => child.remove())
  })

  return el
}
