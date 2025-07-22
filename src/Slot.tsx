import { isObject, type Optional, remove } from '@0x-jerry/utils'
import type { Ref } from '@vue/reactivity'
import {
  $,
  type AnyProps,
  defineComponent,
  provide,
  toBindingRefs,
  useContext,
  useRawChildren,
} from '.'
import type { DNodeContext } from './context'
import type { FunctionalComponent } from './defineComponent'
import { createFragment } from './nodes/AnchorNode'
import { ComponentNode, createComponentNode } from './nodes/ComponentNode'
import { createNativeNode } from './nodes/NativeNode'
import { type NodeElement, NodeType } from './nodes/shared'
import { createTextNode } from './nodes/TextNode'
import { defineComponentName } from './test'

export type Slot = FunctionalComponent

interface SlotProp {
  _slot_prop: true
  key: string
  slot: Slot
}

const SlotDataKey = '__slot_data'

const SlotImpl = defineComponent((props, children) => {
  provide(SlotDataKey, props)

  return createFragment(children)
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
    (child) => ComponentNode.is(child) && child.tag === SlotComponent,
  )

  return Contents as ComponentNode[]
}

export function defineNamedSlot<T extends AnyProps = AnyProps>(name?: string) {
  const Component = SlotImpl.bind({})

  if (name) {
    defineComponentName(Component, name)
  }

  const SlotComponent = defineSlotProps<T>(Component)

  return SlotComponent
}

type SlotWithData<T extends AnyProps> = Slot & { [key in keyof T]: Ref<T[key]> }

function defineSlotProps<T extends AnyProps>(Slot: Slot) {
  const ProxiedSlot = new Proxy(Slot, {
    get(_target, p, _receiver) {
      const key = p as string

      if (key === 'name') {
        return _target[key]
      }

      return createSlotProp(key)
    },
  })

  return ProxiedSlot as SlotWithData<T>

  function createSlotProp(key: string): SlotProp {
    return {
      _slot_prop: true,
      key,
      slot: ProxiedSlot,
    }
  }
}

export function useSlot<T extends AnyProps>(SlotComponent: SlotWithData<T>) {
  const rawChildren = useRawChildrenBySlot(SlotComponent)

  const Slot = defineComponent<T>((props) => {
    const clonedChildren = rawChildren.map((child) => {
      const newNode = cloneSlotContentNode(child)

      Object.assign(newNode.props, toBindingRefs(props))

      return newNode
    })

    return <>{clonedChildren}</>
  })

  return Slot
}

function cloneSlotContentNode<T extends NodeElement>(node: T): T {
  switch (node.type) {
    case NodeType.Component: {
      return createComponentNode(
        node.tag,
        cloneSlotContentProps(node.props),
        cloneSlotContentNodes(node.children),
      ) as T
    }

    case NodeType.Anchor: {
      return createFragment(cloneSlotContentNodes(node.children)) as T
    }

    case NodeType.Native: {
      return createNativeNode(
        node.tag,
        cloneSlotContentProps(node.props || {}),
        cloneSlotContentNodes(node.children),
      ) as T
    }

    case NodeType.Text: {
      return createTextNode(cloneSlotProp(node.content)) as T
    }

    default:
      throw new Error(`invalid node type`)
  }
}

function cloneSlotContentNodes(nodes?: NodeElement[]) {
  return nodes?.map((node) => cloneSlotContentNode(node))
}

function cloneSlotContentProps(props: AnyProps) {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => {
      return [key, cloneSlotProp(value)]
    }),
  )
}

function cloneSlotProp(value: unknown) {
  return isSlotRef(value) ? createSlotPropRef(value) : value
}

function isSlotRef(o: unknown): o is SlotProp {
  return isObject(o) && '_slot_prop' in o
}

function createSlotPropRef(prop: SlotProp) {
  let ctx: Optional<DNodeContext>
  return $(() => {
    if (!ctx) {
      ctx = resolveContext(prop)
    }

    const data = (ctx.ex?.[SlotDataKey] as any)?.[prop.key]
    return data
  })
}

function resolveContext(prop: SlotProp) {
  let ctx: DNodeContext | undefined | null = useContext()

  while (ctx) {
    if (ctx._node?.tag === prop.slot) {
      return ctx
    }
    ctx = ctx.parent
  }

  throw Error(`Slot data should only used inside the corelative Slot instance.`)
}
