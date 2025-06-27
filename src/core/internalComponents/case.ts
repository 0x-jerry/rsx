import type { JsonPrimitive, Optional } from '@0x-jerry/utils'
import type { DNodeContext } from '../context'
import { defineComponent, type FunctionalComponent } from '../defineComponent'
import { createDynamicNode, dispatchMovedEvent } from '../dynamicNode'
import { mount, onBeforeMount, unmount, useWatch } from '../hook'
import { createComponentInstance, transformProps } from '../jsx'
import { insertBefore } from '../nodeOp'
import { $, computed } from '../reactivity'

export interface CaseComponentProps {
  condition: JsonPrimitive
  cases?: Record<string, Optional<FunctionalComponent>>
}

export const VCase = defineComponent<CaseComponentProps>((props) => {
  const el = createDynamicNode()

  const caseKey = computed(() => String(props.condition))

  let renderedCtxNode: Optional<DNodeContext> = null

  useWatch(caseKey, updateCase)

  onBeforeMount(updateCase)

  el.addEventListener('moved', () => {
    if (renderedCtxNode?.el) {
      insertBefore(el, renderedCtxNode.el)
      dispatchMovedEvent(renderedCtxNode.el)
    }
  })

  return el

  function updateCase() {
    if (renderedCtxNode) {
      unmount(renderedCtxNode)
      renderedCtxNode = null
    }

    renderedCtxNode = rebuildChild()
  }

  function rebuildChild() {
    const render = props.cases?.[caseKey.value]
    if (!render) {
      return
    }

    const newChild = createComponentInstance(render)
    if (newChild.el) {
      insertBefore(el, newChild.el)
    }

    mount(newChild)

    return newChild
  }
})

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
