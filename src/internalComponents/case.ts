import type { JsonPrimitive, Optional } from '@0x-jerry/utils'
import { asyncWatcherScheduler } from '@/reactivity/scheduler'
import { defineComponentName } from '@/test'
import {
  createAnchorNode,
  dispatchAnchorMovedEvent,
  listenAnchorMoveEvent,
  setAnchorNodeFirstChildren,
} from '../anchorNode'
import { runWithContext } from '../context'
import { defineComponent, type FunctionalComponent } from '../defineComponent'
import { mount, onBeforeMount, unmount, useContext, useWatch } from '../hook'
import { insertBefore } from '../nodeOp'
import { type ComponentNode, createComponentNode } from '../nodes/ComponentNode'
import { normalizeProps } from '../props'
import { $, computed } from '../reactivity'

export interface CaseItemComponentProps<T> {
  value: T
}

export type CaseItemComponent<T> = FunctionalComponent<
  CaseItemComponentProps<T>
>

export interface CaseItem<T> {
  where: (value: T) => boolean
  render: CaseItemComponent<T>
}

export interface CaseComponentProps<T = unknown> {
  condition: T
  cases?:
    | Record<string, Optional<CaseItemComponent<NoInfer<T>>>>
    | CaseItem<NoInfer<T>>[]
}

export const VCase = defineComponent(<T>(props: CaseComponentProps<T>) => {
  const ctx = useContext()

  const anchorNode = createAnchorNode('case')

  const ChildComponent = computed(() => {
    if (Array.isArray(props.cases)) {
      return props.cases.find((n) => n.where(props.condition))?.render
    }

    return props.cases?.[String(props.condition)]
  })

  let renderedCtxNode: Optional<ComponentNode> = null

  const rebuildChildren = () => runWithContext(updateCase, ctx)

  useWatch(ChildComponent, rebuildChildren, {
    scheduler: asyncWatcherScheduler,
  })

  onBeforeMount(rebuildChildren)

  listenAnchorMoveEvent(anchorNode, () => {
    const childEl = renderedCtxNode?.context.el

    if (childEl) {
      insertBefore(anchorNode, childEl)
      dispatchAnchorMovedEvent(childEl)
    }
  })

  return anchorNode

  function updateCase() {
    if (renderedCtxNode) {
      unmount(renderedCtxNode.context)
      renderedCtxNode = null
    }

    renderedCtxNode = rebuildChild()

    setAnchorNodeFirstChildren(anchorNode, renderedCtxNode?.context.el)
  }

  function rebuildChild() {
    const Component = ChildComponent.value

    if (!Component) {
      return
    }

    const node = createComponentNode(
      Component,
      { value: $(() => props.condition) },
      [],
    )

    node.initialize()

    if (node.context.el) {
      insertBefore(anchorNode, node.context.el)
    }

    if (ctx._mounted) {
      mount(node.context)
    }

    return node
  }
})

defineComponentName(VCase, 'VCase')

export interface IfComponentProps {
  condition: JsonPrimitive
  truthy?: FunctionalComponent
  falsy?: FunctionalComponent
}

export const VIf = defineComponent<IfComponentProps>((props) => {
  const _props = normalizeProps(VIf, {
    condition: $(() => !!props.condition),
    cases: {
      true: props.truthy,
      false: props.falsy,
    },
  })

  return VCase(_props as CaseComponentProps)
})

defineComponentName(VIf, 'VIf')
