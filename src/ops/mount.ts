import { FunctionalComponent } from '../defineComponent'
import { h } from '../jsx'
import { createTextElement } from '../node'
import { normalizeChildren } from '../utils'
import {
  isNativeNode,
  mountNativeNode,
  isComponentNode,
  mountComponentNode,
  NativeNode,
  isAnchorNode,
  ComponentNode,
} from '../nodes'

export function mount(node: unknown): HTMLElement | undefined {
  if (isNativeNode(node)) {
    const el = mountNativeNode(node)
    mountChildren(node, el)
    return el
  }

  if (isComponentNode(node)) {
    return mountComponentNode(node)
  }

  return undefined
}

function mountChildren(node: NativeNode, el?: HTMLElement) {
  for (const child of normalizeChildren(node.children)) {
    if (isNativeNode(child) || isComponentNode(child) || isAnchorNode(child)) {
      const childEl = mount(child)
      if (childEl) {
        el?.appendChild(childEl)
      }
      continue
    }

    el?.appendChild(createTextElement(child))
  }
}

export function mountApp(App: FunctionalComponent, rootEl: HTMLElement) {
  const app = h(App) as ComponentNode

  const appEl = mountComponentNode(app)

  if (appEl) {
    rootEl.append(appEl)
  }

  return app
}
