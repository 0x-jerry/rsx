import { isString } from '@0x-jerry/utils'
import { disableSSR, enableSSR } from './config'
import type { FunctionalComponent } from './defineComponent'
import { h } from './jsx'
import { moveTo } from './nodeOp'
import type { ComponentNode } from './nodes/ComponentNode'
import { mount, unmount } from './nodes/lifeCycle'

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

  const appNode = h(App) as ComponentNode

  appNode.initialize()

  if (appNode.el) {
    moveTo(container, appNode.el)
  }

  mount(appNode)

  return appNode
}

export function unmountApp(app: ComponentNode) {
  if (app.context._unmounted) {
    return
  }

  unmount(app)
}

export function renderToString(Comp: FunctionalComponent) {
  // todo
  enableSSR()

  const app = document.createElement('div')
  mountApp(Comp, app)

  disableSSR()

  return app.innerHTML
}
