import { defineComponentName } from '../test'
import { createAnchorNode } from '../nodes'
import { runWithContext } from '../context'
import type { FunctionalComponent } from '../defineComponent'
import { onBeforeMount, onBeforeUnmount, useContext } from '../hook'
import { insertBefore } from '../nodeOp'
import { normalizeChildren } from '../utils'

export const Fragment: FunctionalComponent = (_, children) => {
  const anchorNode = createAnchorNode('fragment')

  const ctx = useContext()

  // const childNodes: ChildNode[] = []

  // // TODO
  // onBeforeMount(() => {
  //   runWithContext(() => {
  //     for (const child of normalizeChildren(children)) {
  //       // childNodes.push(childEl)
  //       // insertBefore(anchorNode, childEl)
  //       // if (!isAnchorNodeHasFirstChildren(anchorNode)) {
  //       //   setAnchorNodeFirstChildren(anchorNode, childEl)
  //       // }
  //     }
  //   }, ctx)
  // })

  // listenAnchorMoveEvent(anchorNode, () => {
  //   for (const childEl of childNodes) {
  //     insertBefore(anchorNode, childEl)
  //     dispatchAnchorMovedEvent(childEl)
  //   }
  // })

  // onBeforeUnmount(() => {
  //   for (const childEl of childNodes) {
  //     childEl.remove()
  //   }
  // })

  return anchorNode
}

defineComponentName(Fragment, 'Fragment')
