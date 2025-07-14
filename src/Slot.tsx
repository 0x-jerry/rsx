import { remove } from '@0x-jerry/utils'
import type { Ref } from '@vue/reactivity'
import {
  Fragment as _Fragment,
  $,
  type AnyProps,
  defineComponent,
  provide,
  toBindingRefs,
  useContext,
  useRawChildren,
} from '.'
import { type ComponentNode, isComponentNode } from './ComponentNode'
import type { DNodeContext } from './context'
import type { FunctionalComponent } from './defineComponent'
import { defineComponentName } from './test'

export type Slot = FunctionalComponent

const SlotDataKey = '__slot_data'

const SlotImpl = defineComponent((props, children) => {
  provide(SlotDataKey, props)

  return _Fragment(props, children)
})

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

  const Contents = remove(
    children,
    (child) => isComponentNode(child) && child.type === SlotComponent,
  )

  return Contents as ComponentNode[]
}

export function defineNamedSlot<T extends AnyProps = AnyProps>(name?: string) {
  const Component = SlotImpl.bind({})

  if (name) {
    defineComponentName(Component, name)
  }

  return defineSlotProps<T>(Component)
}

type SlotWithData<T extends AnyProps> = Slot & T

function defineSlotProps<T extends AnyProps>(Slot: Slot) {
  let currentSlotCtx: DNodeContext | null = null

  const cachedProps: Record<string, Ref> = {}

  const createProp = (key: string) => {
    return $(() => {
      if (!currentSlotCtx) {
        currentSlotCtx = useContext()
      }

      const data = (currentSlotCtx.ex?.[SlotDataKey] as any)?.[key]

      return data
    })
  }

  const _Slot = new Proxy(Slot, {
    get(_target, p, _receiver) {
      const key = p as string

      let prop = cachedProps[key]

      if (!prop) {
        prop = createProp(key)
        cachedProps[key] = prop
      }

      return prop
    },
  })

  return _Slot as SlotWithData<T>
}

export function useSlot<T extends AnyProps>(SlotComponent: SlotWithData<T>) {
  const rawChildren = useRawChildrenBySlot(SlotComponent)

  const Slot = defineComponent<T>((props) => {
    const clonedChildren = rawChildren.map((child) => child.clone())

    clonedChildren.forEach((child) => {
      Object.assign(child.props, toBindingRefs(props))
    })

    return <>{clonedChildren}</>
  })

  return Slot
}
