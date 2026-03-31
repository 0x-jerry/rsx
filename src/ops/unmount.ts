import { type ComponentNode, isComponentNode } from '../internalComponents'
import {
  triggerEvent,
  ComponentContextEventNameMap,
  TriggerEventOrder,
  type AnyNode,
  isNativeNode,
  disconnectNativeNode,
  disconnectComponentNode,
} from '../nodes'

export function unmount(node: ComponentNode) {
  disconnect(node)

  if (!node.context) {
    throw new Error(`Unmount node failed`)
  }

  triggerEvent(ComponentContextEventNameMap.unmounted, node.context, TriggerEventOrder.Postscript)
}

export function disconnect(node: AnyNode): undefined {
  if (isNativeNode(node)) {
    for (const child of node.children || []) {
      disconnect(child)
      continue
    }

    disconnectNativeNode(node)
  }

  if (isComponentNode(node)) {
    disconnectComponentNode(node)
  }
}
