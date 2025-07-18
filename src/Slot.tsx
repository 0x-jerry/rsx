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

type SlotWithData<T extends AnyProps> = Slot & { [key in keyof T]: Ref<T[key]> }

function defineSlotProps<T extends AnyProps>(Slot: Slot) {
  const createProp = (key: string) => {
    let currentSlotCtx: DNodeContext | null = null
    return $(() => {
      if (!currentSlotCtx) {
        currentSlotCtx = resolveContext()
      }

      const data = (currentSlotCtx.ex?.[SlotDataKey] as any)?.[key]

      return data
    })
  }

  const ProxiedSlot = new Proxy(Slot, {
    get(_target, p, _receiver) {
      const key = p as string

      return createProp(key)
    },
  })

  return ProxiedSlot as SlotWithData<T>

  function resolveContext() {
    let ctx: DNodeContext | undefined | null = useContext()

    while (ctx) {
      if (ctx._node?.type === ProxiedSlot) {
        return ctx
      }
      ctx = ctx.parent
    }

    throw Error(
      `Slot data should only used inside the corelative Slot instance.`,
    )
  }
}

export function useSlot<T extends AnyProps>(SlotComponent: SlotWithData<T>) {
  const rawChildren = useRawChildrenBySlot(SlotComponent)

  const Slot = defineComponent<T>((props) => {
    rawChildren.forEach((child) => {
      Object.assign(child.props, toBindingRefs(props))
    })

    return <>{rawChildren}</>
  })

  return Slot
}
