import type { JsonPrimitive, Optional } from '@0x-jerry/utils'
import { defineComponentName } from '@/test'
import { type ComponentNode, createComponentNode } from '../ComponentNode'
import { runWithContext } from '../context'
import { defineComponent, type FunctionalComponent } from '../defineComponent'
import { createDynamicNode, dispatchMovedEvent } from '../dynamicNode'
import { mount, onBeforeMount, unmount, useContext, useWatch } from '../hook'
import { insertBefore } from '../nodeOp'
import { transformProps } from '../props'
import { $, computed } from '../reactivity'

export interface CaseComponentProps {
  condition: JsonPrimitive
  cases?: Record<string, Optional<FunctionalComponent>>
}

export const VCase = defineComponent<CaseComponentProps>((props) => {
  const ctx = useContext()

  const el = createDynamicNode('case')

  const caseKey = computed(() => String(props.condition))

  let renderedCtxNode: Optional<ComponentNode> = null

  const rebuildChildren = () => runWithContext(updateCase, ctx)

  useWatch(caseKey, rebuildChildren)

  onBeforeMount(rebuildChildren)

  el.addEventListener('moved', () => {
    const childEl = renderedCtxNode?.instance.el

    if (childEl) {
      insertBefore(el, childEl)
      dispatchMovedEvent(childEl)
    }
  })

  return el

  function updateCase() {
    if (renderedCtxNode) {
      unmount(renderedCtxNode.instance)
      renderedCtxNode = null
    }

    renderedCtxNode = rebuildChild()
  }

  function rebuildChild() {
    const Component = props.cases?.[caseKey.value]
    if (!Component) {
      return
    }

    const node = createComponentNode(Component, {}, [])

    node.initialize()

    if (node.instance.el) {
      insertBefore(el, node.instance.el)
    }

    mount(node.instance)

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
  const _props = transformProps(VIf, {
    condition: $(() => !!props.condition),
    cases: {
      true: props.truthy,
      false: props.falsy,
    },
  })

  return VCase(_props)
})

defineComponentName(VIf, 'VIf')
