import { DNodeContextEventName } from '@/context'
import { type NodeElement, NodeType } from './shared'

export function mount(node: NodeElement) {
  switch (node.type) {
    case NodeType.Component: {
      const ctx = node.context
      ctx.emit(DNodeContextEventName.beforeMount)

      if (node.root) {
        mount(node.root)
      }

      ctx._mounted = true
      ctx.emit(DNodeContextEventName.mounted)

      break
    }

    case NodeType.Native:
    case NodeType.Anchor: {
      node.children?.forEach((child) => mount(child))

      break
    }

    case NodeType.Text: {
      break
    }

    default:
      break
  }
}

export function unmount(node: NodeElement) {
  switch (node.type) {
    case NodeType.Component: {
      const ctx = node.context
      ctx.emit(DNodeContextEventName.beforeUnmount)

      if (node.root) {
        unmount(node.root)
      }

      ctx._mounted = true
      ctx.emit(DNodeContextEventName.unmounted)

      node.el?.remove()
      break
    }

    case NodeType.Native:
    case NodeType.Anchor: {
      node.children?.forEach((child) => unmount(child))

      node.el?.remove()
      break
    }

    case NodeType.Text: {
      node.cleanup()
      node.el?.remove()
      break
    }

    default:
      break
  }
}
