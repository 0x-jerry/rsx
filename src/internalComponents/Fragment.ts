import { defineComponentName } from '@/test'
import {
  AnchorNodeEventNames,
  createAnchorNode,
  dispatchAnchorMovedEvent,
} from '../anchorNode'
import { runWithContext } from '../context'
import type { FunctionalComponent } from '../defineComponent'
import { onBeforeMount, onBeforeUnmount, useContext } from '../hook'
import { insertBefore, processRawChildren } from '../nodeOp'

export const Fragment: FunctionalComponent = (_, children) => {
  const anchorNode = createAnchorNode('fragment')
  const ctx = useContext()

  const childNodes: ChildNode[] = []

  onBeforeMount(() => {
    runWithContext(() => {
      processRawChildren(children || [], (childEl) => {
        childNodes.push(childEl)

        insertBefore(anchorNode, childEl)

        if (!anchorNode.__firstChild) {
          anchorNode.__firstChild = childEl
        }
      })
    }, ctx)
  })

  anchorNode.addEventListener(AnchorNodeEventNames.Moved, () => {
    for (const childEl of childNodes) {
      insertBefore(anchorNode, childEl)
      dispatchAnchorMovedEvent(childEl)
    }
  })

  onBeforeUnmount(() => {
    for (const childEl of childNodes) {
      childEl.remove()
    }
  })

  return anchorNode
}

defineComponentName(Fragment, 'Fragment')

export function createNamedFragment(name: string) {
  const Component = Fragment.bind({})

  defineComponentName(Component, name)

  return Component
}
