import { isString } from '@0x-jerry/utils'
import {
  type ComponentNode,
  createComponentNode,
  transformProps,
} from './ComponentNode'
import type { FunctionalComponent } from './defineComponent'
import { createNativeElement } from './node'
import type { AnyProps } from './props'

export function h(
  type: string | FunctionalComponent,
  props?: AnyProps,
  ...children: unknown[]
): ChildNode | ComponentNode {
  const _props = transformProps(type, props)

  if (isString(type)) {
    return createNativeElement(type, _props, children)
  }

  return createComponentNode(type, _props, children)
}
