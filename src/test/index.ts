import type { Fn } from '@0x-jerry/utils'
import type { FunctionalComponent } from '../defineComponent'
import { mountApp } from '../mount'
import { def } from '../utils'
import { ComponentContext } from '../context'

export interface RootNode extends HTMLElement {
  _: ComponentContext
}

export function mountTestApp(App: FunctionalComponent) {
  const doc = document.createElement('div') as any as RootNode
  doc.id = 'App'

  const node = mountApp(App, doc)

  doc._ = node.context!

  return doc
}

export interface ContextJson {
  name?: string
  children: ContextJson[]
}

export function contextToJson(context: ComponentContext): ContextJson {
  return {
    name: context.name,
    children: [...(context.children || [])].map((n) => contextToJson(n)),
  }
}

export function defineComponentName(fn: Fn, name: string) {
  def(fn, 'name', { value: name })
}
