import { isString } from '@0x-jerry/utils'
import { disableSSR, enableSSR } from './config'
import type { FunctionalComponent } from './defineComponent'
import { mount, unmount } from './hook'
import { h } from './jsx'
import { moveTo } from './nodeOp'
import type { ComponentNode } from './nodes/ComponentNode'

export function mountApp(
  App: FunctionalComponent,
  selector: string | HTMLElement,
) {
  const container = isString(selector)
    ? document.querySelector(selector)
    : selector

  if (!container) {
    throw new Error(`Can't find container`)
  }

  const rootEl = h(App) as ComponentNode

  rootEl.initialize()

  if (rootEl.el) {
    moveTo(container, rootEl.el)
  }

  mount(rootEl.context)

  return rootEl
}

export function unmountApp(app: ComponentNode) {
  if (app.context._unmounted) {
    return
  }

  unmount(app.context)
}

export function renderToString(Comp: FunctionalComponent) {
  // todo
  enableSSR()

  const app = document.createElement('div')
  mountApp(Comp, app)

  disableSSR()

  return app.innerHTML
}
