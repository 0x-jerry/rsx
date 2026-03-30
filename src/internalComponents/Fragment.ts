import { defineComponentName } from '../test'
import type { FunctionalComponent } from '../defineComponent'
import { ComponentNode } from '../nodes'
import { connect } from '../ops'

export const Fragment: FunctionalComponent = () => {}

defineComponentName(Fragment, 'Fragment')

export function isFragmentComponent(type: FunctionalComponent) {
  return type === Fragment
}

export function connectFragmentNode(node: ComponentNode, parentEl?: ParentNode) {
  const ctx = node.context!

  ctx.el = document.createComment('fragment') as any as HTMLElement
  parentEl?.appendChild(ctx.el)

  for (const child of node.children || []) {
    connect(child, parentEl)
  }
}
