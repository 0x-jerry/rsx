import type { JsonPrimitive, Optional } from '@0x-jerry/utils'
import { defineComponentName } from '@/test'
import {
  AnchorNodeEventNames,
  createAnchorNode,
  dispatchAnchorMovedEvent,
} from '../anchorNode'
import { type ComponentNode, createComponentNode } from '../ComponentNode'
import { runWithContext } from '../context'
import { defineComponent, type FunctionalComponent } from '../defineComponent'
import { mount, onBeforeMount, unmount, useContext, useWatch } from '../hook'
import { insertBefore } from '../nodeOp'
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

  const anchorEl = createAnchorNode('case')

  const caseKey = computed(() => props.condition)

  let renderedCtxNode: Optional<ComponentNode> = null

  const rebuildChildren = () => runWithContext(updateCase, ctx)

  useWatch(caseKey, rebuildChildren)

  onBeforeMount(rebuildChildren)

  anchorEl.addEventListener(AnchorNodeEventNames.Moved, () => {
    const childEl = renderedCtxNode?.instance.el

    if (childEl) {
      insertBefore(anchorEl, childEl)
      dispatchAnchorMovedEvent(childEl)
    }
  })

  return anchorEl

  function updateCase() {
    if (renderedCtxNode) {
      unmount(renderedCtxNode.instance)
      renderedCtxNode = null
    }

    renderedCtxNode = rebuildChild()
  }

  function rebuildChild() {
    const Component = getComponent()
    if (!Component) {
      return
    }

    const node = createComponentNode(
      Component,
      { value: $(() => props.condition) },
      [],
    )

    node.initialize()

    if (node.instance.el) {
      insertBefore(anchorEl, node.instance.el)
    }

    mount(node.instance)

    return node
  }

  function getComponent() {
    if (Array.isArray(props.cases)) {
      return props.cases.find((n) => n.where(caseKey.value))?.render
    }

    return props.cases?.[String(caseKey.value)]
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
