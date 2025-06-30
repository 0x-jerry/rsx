import { isString } from '@0x-jerry/utils'
import { type ComponentNode, createComponentNode } from './ComponentNode'
import type { FunctionalComponent } from './defineComponent'
import { createNativeElement } from './node'
import type { AnyProps } from './props'

export function h(
  type: string | FunctionalComponent,
  props?: AnyProps,
  ...children: unknown[]
): ChildNode | ComponentNode {
  if (isString(type)) {
    return createNativeElement(type, props, children)
  }

  return createComponentNode(type, props, children)
}
