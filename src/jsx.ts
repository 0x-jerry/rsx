import { isString } from '@0x-jerry/utils'
import type { FunctionalComponent } from './defineComponent'
import { Fragment } from './internalComponents'
import { createFragment } from './nodes/AnchorNode'
import { createComponentNode } from './nodes/ComponentNode'
import { createNativeNode } from './nodes/NativeNode'
import type { AnyProps } from './props'

export function h(
  type: string | FunctionalComponent,
  props?: AnyProps,
  ...children: unknown[]
) {
  if (isString(type)) {
    return createNativeNode(type, props, children)
  }

  if (type === Fragment) {
    return createFragment(children)
  }

  return createComponentNode(type, props, children)
}
