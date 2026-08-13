import type { JsonPrimitive, Optional } from '@0x-jerry/utils'
import { asyncWatcherScheduler } from '../reactivity/scheduler'
import { runWithContext } from '../nodes/ComponentContext'
import { defineComponent, defineComponentName, type FunctionalComponent } from '../defineComponent'
import { useWatch } from '../hook'
import { $, computed } from '../reactivity'
import { connect, disconnect, mount, unmount } from '../ops'
import { h } from '../jsx'
import { getNodeElement, moveNode, type InternalComponentOps } from '../nodes'
import type { ComponentNode } from './ComponentNode'
import { moveTo } from '../nodeOp'

export interface CaseItemComponentProps<T> {
  value: T
}

export type CaseItemComponent<T> = FunctionalComponent<CaseItemComponentProps<T>>

export interface CaseItem<T> {
  where: (value: T) => boolean
  render: CaseItemComponent<T>
}

export interface CaseComponentProps<T = unknown> {
  condition: T
  cases?: Record<string, Optional<CaseItemComponent<NoInfer<T>>>> | CaseItem<NoInfer<T>>[]
}

export const VCase = defineComponent(<T>(_props: CaseComponentProps<T>) => {})
defineComponentName(VCase, 'VCase')

export const CaseOps: InternalComponentOps = {
  is: isCaseComponent,
  connect: connectCaseNode,
  move: moveCaseNode,
  getElementRange: getCaseNodeElement,
  disconnect: disconnectCaseNode,
}

function isCaseComponent(c: FunctionalComponent) {
  return c === VCase
}

interface CaseComponentNode extends ComponentNode {
  _el?: Comment
  _renderedNode?: ComponentNode | null
}

function connectCaseNode(node: CaseComponentNode, parentEl?: ParentNode, anchor?: Node | null) {
  const ctx = node.context!
  const props = (ctx.props || {}) as CaseComponentProps<any>

  node._el = document.createComment('Case')
  parentEl?.insertBefore(node._el, anchor ?? null)

  const ChildComponent = computed(() => {
    if (Array.isArray(props.cases)) {
      return props.cases.find((n) => n.where(props.condition))?.render
    }

    return props.cases?.[String(props.condition)]
  })

  update(true)

  useWatch(ChildComponent, () => update(), {
    scheduler: asyncWatcherScheduler,
  })

  function update(firstTime = false) {
    const Component = ChildComponent()

    if (node._renderedNode) {
      if (node._renderedNode.type === Component) {
        return
      }

      unmount(node._renderedNode)
      node._renderedNode = null
    }

    if (!Component) {
      return
    }

    runWithContext(() => {
      const _props = { value: $(() => props.condition) }
      const targetNode = h(Component, _props) as ComponentNode
      const _pEl = document.createDocumentFragment()

      if (firstTime) {
        connect(targetNode, _pEl)
      } else {
        mount(targetNode, _pEl)
      }

      const parentEl = node._el?.parentElement

      if (parentEl) {
        moveNode(targetNode, parentEl, node._el)
      }

      node._renderedNode = targetNode
    }, ctx)
  }
}

function disconnectCaseNode(node: CaseComponentNode) {
  if (node._renderedNode) {
    disconnect(node._renderedNode)
  }

  node._el?.remove()
}

function moveCaseNode(node: CaseComponentNode, parentEl: ParentNode, anchor?: Node) {
  const currentAnchor = node._el

  if (!currentAnchor) {
    throw new Error(`Case component not mounted!`)
  }

  if (node._renderedNode) {
    moveNode(node._renderedNode, parentEl, anchor)
  }

  moveTo(parentEl, currentAnchor, anchor)
}

function getCaseNodeElement(node: CaseComponentNode) {
  if (node._renderedNode) {
    return getNodeElement(node._renderedNode)
  }
}

// ------------

export interface IfComponentProps {
  condition: JsonPrimitive
  truthy?: FunctionalComponent
  falsy?: FunctionalComponent
}

export const VIf = defineComponent<IfComponentProps>((props) => {
  const _props = {
    condition: $(() => !!props.condition),
    cases: {
      true: props.truthy,
      false: props.falsy,
    },
  }

  return h(VCase, _props)
})

defineComponentName(VIf, 'VIf')
