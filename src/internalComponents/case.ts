import type { JsonPrimitive, Optional } from '@0x-jerry/utils'
import { asyncWatcherScheduler } from '../reactivity/scheduler'
import { defineComponentName } from '../test'
import { runWithContext } from '../nodes/ComponentContext'
import { defineComponent, type FunctionalComponent } from '../defineComponent'
import { useWatch } from '../hook'
import { $, computed } from '../reactivity'
import { connect, mount, unmount } from '../ops'
import { h } from '../jsx'
import { ComponentNode } from '../nodes'
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

export function isCaseComponent(c: FunctionalComponent) {
  return c === VCase
}

export function connectCaseNode(node: ComponentNode, parentEl?: ParentNode) {
  const ctx = node.context!
  const props = (ctx.props || {}) as CaseComponentProps<any>

  ctx.el = document.createComment('Case') as any as HTMLElement
  parentEl?.appendChild(ctx.el)

  let currentChild: ComponentNode | null = null

  const ChildComponent = computed(() => {
    if (Array.isArray(props.cases)) {
      return props.cases.find((n) => n.where(props.condition))?.render
    }

    return props.cases?.[String(props.condition)]
  })

  rebuildChild(true)

  useWatch(ChildComponent, () => rebuildChild(), {
    immediate: false,
    scheduler: asyncWatcherScheduler,
  })

  function rebuildChild(firstTime = false) {
    const Component = ChildComponent.value

    if (currentChild) {
      unmount(currentChild)
      currentChild = null
    }

    if (!Component) {
      return
    }

    runWithContext(() => {
      const _props = { value: $(() => props.condition) }
      const node = h(Component, _props) as ComponentNode
      const pEl = document.createDocumentFragment()

      if (firstTime) {
        connect(node, pEl)
      } else {
        mount(node, pEl)
      }

      if (parentEl) {
        moveTo(parentEl, pEl, ctx.el)
      }
      currentChild = node
    }, ctx)
  }
}

defineComponentName(VCase, 'VCase')

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
