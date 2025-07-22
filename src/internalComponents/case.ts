import type { JsonPrimitive, Optional } from '@0x-jerry/utils'
import { createAnchorNode } from '@/nodes/AnchorNode'
import { mount, unmount } from '@/nodes/lifeCycle'
import { asyncWatcherScheduler } from '@/reactivity/scheduler'
import { defineComponentName } from '@/test'
import { runWithContext } from '../context'
import { defineComponent, type FunctionalComponent } from '../defineComponent'
import { onBeforeMount, useContext, useWatch } from '../hook'
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

  let renderedNode: Optional<ComponentNode>
  let initialized = false

  const rebuildChildren = () => runWithContext(updateCase, ctx)

  useWatch(ChildComponent, rebuildChildren, {
    scheduler: asyncWatcherScheduler,
  })

  onBeforeMount(() => {
    rebuildChildren()
    initialized = true
  })

  return anchorNode

  function updateCase() {
    if (renderedNode) {
      unmount(renderedNode)
      renderedNode = null
    }

    renderedNode = rebuildChild()
  }

  function rebuildChild() {
    const Component = ChildComponent.value

    if (!Component) {
      return
    }

    const childNode = createComponentNode(
      Component,
      { value: $(() => props.condition) },
      [],
    )

    childNode.initialize()

    if (childNode.el) {
      insertBefore(anchorNode.el!, childNode.el)
    }

    if (initialized) {
      mount(childNode)
    }

    anchorNode.children = [childNode]

    return childNode
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
