import { isString } from '@0x-jerry/utils'
import { type ComponentNode, createComponentNode } from './ComponentNode'
import type { FunctionalComponent } from './defineComponent'
import type { AnyProps } from './props'
import { createNativeNode, NativeNode } from './NativeNode'

export function h(
  type: string | FunctionalComponent,
  props?: AnyProps,
  ...children: unknown[]
): ComponentNode | NativeNode {
  if (isString(type)) {
    return createNativeNode(type, props, children)
  }

  return createComponentNode(type, props, children)
}
