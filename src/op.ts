import { isString } from '@0x-jerry/utils'
import { isComponentNode } from './ComponentNode'
import { disableSSR, enableSSR } from './config'
import {
  appendToCurrentContext,
  createNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'
import type { FunctionalComponent } from './defineComponent'
import { mount } from './hook'
import { isHTMLNode } from './node'
import { moveTo } from './nodeOp'

export function mountApp(
  App: FunctionalComponent,
  selector: string | HTMLElement,
) {
  const container = isString(selector)
    ? document.querySelector(selector)
    : selector

  if (!container) {
    console.warn(`Can't find container`)
    return
  }

  const ctx = createNodeContext('Root')

  appendToCurrentContext(ctx)

  setCurrentContext(ctx)

  const rootEl = App({}, [])

  if (isComponentNode(rootEl)) {
    rootEl.initialize()

    ctx.el = rootEl.instance.el
  } else if (isHTMLNode(rootEl)) {
    ctx.el = rootEl as ChildNode
  } else {
    console.warn('[ComponentNode] Invalid component node', rootEl)
  }

  popCurrentContext()

  if (ctx.el) {
    moveTo(container, ctx.el)
  }

  mount(ctx)
}

export function renderToString(Comp: FunctionalComponent<any>) {
  // todo
  enableSSR()

  const app = document.createElement('div')
  mountApp(Comp, app)

  disableSSR()

  return app.innerHTML
}
