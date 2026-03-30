import {
  AnyNode,
  ComponentNode,
  disconnectComponentNode,
  disconnectNativeNode,
  isComponentNode,
  isNativeNode,
} from '../nodes'
import {
  ComponentContextEventNameMap,
  triggerEvent,
  TriggerEventOrder,
} from '../nodes/ComponentContext'

export function unmount(node: ComponentNode) {
  disconnect(node)

  if (!node.context) {
    throw new Error(`Unmount node failed`)
  }

  triggerEvent(ComponentContextEventNameMap.unmounted, node.context, TriggerEventOrder.Postscript)
}

function disconnect(node: AnyNode): undefined {
  if (isNativeNode(node)) {
    disconnectNativeNode(node)
    for (const child of node.children || []) {
      disconnect(child)
      continue
    }
  }

  if (isComponentNode(node)) {
    disconnectComponentNode(node)
  }
}
