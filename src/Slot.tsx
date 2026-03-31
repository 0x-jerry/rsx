import type { Ref } from '@vue/reactivity'
import { type AnyProps, defineComponent, toBindingRefs, useRawChildren, isComponentNode } from '.'
import type { FunctionalComponent } from './defineComponent'
import { defineComponentName } from './test'

export type Slot = FunctionalComponent

const SlotImpl = () => {
  return <></>
}

/**
 * Filter and remove raw children by Component
 *
 * @private
 *
 * @param SlotComponent
 * @returns
 */
function useRawChildrenBySlot(SlotComponent: Slot) {
  const children = useRawChildren()

  const Contents = children
    .filter((child) => isComponentNode(child) && child.type === SlotComponent)
    .flatMap((n) => n.children)
    .filter((n) => n != null)

  return Contents
}

export function defineNamedSlot(name?: string) {
  const Component = SlotImpl.bind({})

  if (name) {
    defineComponentName(Component, name)
  }

  return Component as Slot
}

export function useSlot<T extends AnyProps>(SlotComponent: Slot) {
  const rawChildren = useRawChildrenBySlot(SlotComponent)

  const Slot = defineComponent<T>((props) => {
    return <>{rawChildren}</>
  })

  return Slot
}
