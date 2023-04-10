import { isString } from '@0x-jerry/utils'
import {
  DComponent,
  DNode,
  createFragment,
  createNativeElement,
  isDComponent,
} from './node'

type FunctionalComponent = (props?: any, children?: DNode[]) => DComponent

export function h(
  type: string | FunctionalComponent | DComponent,
  props?: Record<string, any>,
  ...children: DComponent[]
): DComponent {
  if (isDComponent(type)) {
    return type
  }

  if (!isString(type)) {
    return type(props, children)
  }

  return createNativeElement(type, props, children)
}

export const Fragment: FunctionalComponent = (_, children) => {
  return createFragment(children || [])
}
