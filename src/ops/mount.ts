import type { FunctionalComponent } from '../defineComponent'
import { type ComponentNode, isComponentNode } from '../internalComponents'
import { h } from '../jsx'
import {
  isNativeNode,
  connectNativeNode,
  type AnyNode,
  connectComponentNode,
  triggerEvent,
  ComponentContextEventNameMap,
} from '../nodes'

export function mount(node: ComponentNode, parentEl?: ParentNode): undefined {
  connect(node, parentEl)

  if (!node.context) {
    throw new Error(`Mount node failed!`)
  }

  triggerEvent(ComponentContextEventNameMap.mounted, node.context)
}

export function connect(node: AnyNode, parentEl?: ParentNode) {
  if (isNativeNode(node)) {
    const el = connectNativeNode(node, parentEl)

    for (const child of node.children || []) {
      connect(child, el)
    }
  }

  if (isComponentNode(node)) {
    connectComponentNode(node, parentEl)
  }
}

export function mountApp(App: FunctionalComponent, rootEl: HTMLElement) {
  const app = h(App) as ComponentNode

  mount(app, rootEl)

  return app
}
