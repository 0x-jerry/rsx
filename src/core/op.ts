import { isString } from '@0x-jerry/utils'
import { disableSSR, enableSSR } from './config'
import {
  appendToCurrentContext,
  createNodeContext,
  popCurrentContext,
  setCurrentContext,
} from './context'
import type { FunctionalComponent } from './defineComponent'
import { mount } from './hook'
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

  const el = App({}, [])

  ctx.el = el

  moveTo(container, el)

  popCurrentContext()

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
