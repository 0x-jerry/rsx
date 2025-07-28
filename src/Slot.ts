import { isFn, remove } from '@0x-jerry/utils'
import { type AnyProps, useRawChildren } from '.'
import type {
  ExposedFunctionalComponent,
  FunctionalComponent,
} from './defineComponent'
import { defineComponentName } from './helper'
import { ComponentNode } from './nodes/ComponentNode'
import type { NodeElement } from './nodes/shared'
import { TextNode } from './nodes/TextNode'

export type Slot<T extends AnyProps = AnyProps> =
  ExposedFunctionalComponent<T> & {
    __slot: true
    name: string
  }

function isSlot(o: unknown): o is Slot {
  return isFn(o) && '__slot' in o
}

/**
 * Filter and remove raw children by Component
 *
 * @private
 *
 * @param factory
 * @returns
 */
export function useSlot<T extends AnyProps>(factory: SlotFactory<T>) {
  const children = useRawChildren()

  let dynamicSlot: unknown
  const staticSlotContents: NodeElement[][] = []

  const _ = remove(children, (child) => {
    const isStaticSlot = ComponentNode.is(child) && child.tag === factory

    if (isStaticSlot && child.children) {
      staticSlotContents.push(child.children)
      return true
    }

    const isDynamicSlot =
      TextNode.is(child) &&
      isSlot(child.content) &&
      child.content.name === factory.__slot_factory.name

    if (isDynamicSlot) {
      if (!dynamicSlot) dynamicSlot = child.content
      return true
    }

    return false
  })

  const slot = dynamicSlot ?? (() => staticSlotContents)

  return slot as Slot<T>
}

interface SlotFactory<T extends AnyProps = AnyProps>
  extends FunctionalComponent {
  (props: FunctionalComponent<T>): Slot<T>
  __slot_factory: {
    name: string
  }
}

function _isSlotFactory(o: unknown): o is SlotFactory {
  return isFn(o) && '__slot_factory' in o
}

export function defineNamedSlot<T extends AnyProps = AnyProps>(
  slotName: string,
) {
  const factory = ((slot) => {
    const SlotComponent = slot as Slot

    SlotComponent.__slot = true

    defineComponentName(SlotComponent, slotName)

    return SlotComponent
  }) as SlotFactory<T>

  factory.__slot_factory = { name: slotName }

  return factory
}
