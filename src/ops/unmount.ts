import { normalizeChildren } from '../utils'
import {
  isNativeNode,
  unmountNativeNode,
  isComponentNode,
  unmountComponentNode,
  NativeNode,
} from '../nodes'

export function unmount(node: unknown) {
  if (isNativeNode(node)) {
    unmountChildren(node)

    unmountNativeNode(node)
    return
  }

  if (isComponentNode(node)) {
    unmount(node.context?.root)

    unmountComponentNode(node)
    return
  }
}

function unmountChildren(node: NativeNode) {
  for (const child of normalizeChildren(node.children)) {
    unmount(child)
  }
}
