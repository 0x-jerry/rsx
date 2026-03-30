import { isComponentNode } from './ComponentNode'
import { isNativeNode } from './NativeNode'
import { AnyNode } from './node'

export function getNodeElement(node: AnyNode): HTMLElement | undefined {
  if (isNativeNode(node)) {
    return node.context?.el
  }

  if (isComponentNode(node)) {
    return node.context?.el
  }
}
