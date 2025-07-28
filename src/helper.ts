import type { Fn } from '@0x-jerry/utils'
import type { DNodeContext } from '@/context'
import type { ComponentNode } from '@/nodes/ComponentNode'
import { def } from '@/utils'
import type { FunctionalComponent } from './defineComponent'
import { mountApp } from './op'

export interface RootNode extends HTMLElement {
  _: ComponentNode
}

export function mountTestApp(App: FunctionalComponent) {
  const doc = document.createElement('div') as unknown as RootNode
  document.body.append(doc)
  doc.id = 'app'

  doc._ = mountApp(App, doc)

  return doc
}

export interface ContextJson {
  name?: string
  children: ContextJson[]
}

export function contextToJson(context: DNodeContext): ContextJson {
  return {
    name: context.name,
    children: [...(context.children || [])].map((n) => contextToJson(n)),
  }
}

export function defineComponentName(fn: Fn, name: string) {
  def(fn, 'name', { value: name })
}
