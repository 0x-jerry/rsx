import { defineComponentName } from '../test'
import { defineComponent, FunctionalComponent } from '../defineComponent'
import { onMounted, useWatch } from '../hook'
import { ComponentNode } from '../nodes'
import { connect } from '../ops'
import { asyncWatcherScheduler, nextTick } from '../reactivity/scheduler'
import { moveTo } from '../nodeOp'

export interface TeleportProps {
  to?: string
}

export const Teleport = defineComponent<TeleportProps>((props, children) => {})

defineComponentName(Teleport, 'Teleport')

export function isTeleportComponent(type: FunctionalComponent) {
  return type === Teleport
}

export function connectTeleportNode(node: ComponentNode, _parentEl?: ParentNode) {
  const ctx = node.context!
  const props: TeleportProps = ctx.props!

  const nonExistsContainer = document.createDocumentFragment()

  const initRootEl = init()

  onMounted(() => {
    const targetEl = props.to ? document.querySelector(props.to) : undefined

    if (targetEl) {
      moveTo(targetEl, initRootEl)
    }
  })

  useWatch(
    () => props.to,
    () => update(),
    {
      scheduler: asyncWatcherScheduler,
    },
  )

  function init() {
    const rootEl = document.createDocumentFragment()

    for (const child of node.children || []) {
      connect(child, rootEl)
    }

    return rootEl
  }

  function update() {
    const rootEl = props.to
      ? document.querySelector(props.to) || nonExistsContainer
      : nonExistsContainer
    // todo
  }
}
