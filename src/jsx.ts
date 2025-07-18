import { isString } from '@0x-jerry/utils'
import type { FunctionalComponent } from './defineComponent'
import { createComponentNode } from './nodes/ComponentNode'
import { createNativeNode } from './nodes/NativeNode'
import type { NodeElement } from './nodes/shared'
import type { AnyProps } from './props'

export function h(
  type: string | FunctionalComponent,
  props?: AnyProps,
  ...children: unknown[]
): NodeElement {
  if (isString(type)) {
    return createNativeNode(type, props, children)
  }

  return createComponentNode(type, props, children)
}
