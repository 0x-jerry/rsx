import { ComponentNode, isComponentNode, mountComponentNode } from './ComponentNode'
import { FunctionalComponent } from './defineComponent'
import { h } from './jsx'
import { NativeNode, isNativeNode, mountNativeNode } from './NativeNode'

export function mount(node: NativeNode | ComponentNode): HTMLElement | undefined {
  if (isNativeNode(node)) {
    return mountNativeNode(node)
  }

  if (isComponentNode(node)) {
    return mountComponentNode(node)
  }

  return undefined
}

export function mountApp(App: FunctionalComponent, rootEl: HTMLElement) {
  const app = h(App) as ComponentNode

  const appEl = mountComponentNode(app)

  if (appEl) {
    rootEl.append(appEl)
  }

  return app
}
