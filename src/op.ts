import { isString } from '@0x-jerry/utils'
import { isComponentNode } from './ComponentNode'
import { disableSSR, enableSSR } from './config'
import {
  appendToCurrentContext,
  createNodeContext,
  type DNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'
import type { FunctionalComponent } from './defineComponent'
import { mount, unmount } from './hook'
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
    throw new Error(`Can't find container`)
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

  return ctx
}

export function unmountApp(app: DNodeContext) {
  if (app._unmounted) {
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
