import { onMounted, useWatch } from '../hook'
import { connect, disconnect } from '../ops'
import { asyncWatcherScheduler } from '../reactivity/scheduler'
import { defineComponent, defineComponentName, type FunctionalComponent } from '../defineComponent'
import { moveNode, type InternalComponentOps, type NodeElementRange } from '../nodes'
import type { ComponentNode } from './ComponentNode'
import { moveTo } from '../nodeOp'

export interface TeleportProps {
  to?: string
}

export const Teleport = defineComponent<TeleportProps>((props, children) => {})

defineComponentName(Teleport, 'Teleport')

export const TeleportOps: InternalComponentOps = {
  is: isTeleportComponent,
  connect: connectTeleportNode,
  move: moveTeleportNode,
  getElementRange: getTeleportNodeElement,
  disconnect: disconnectTeleportNode,
}

function isTeleportComponent(type: FunctionalComponent) {
  return type === Teleport
}

interface TeleportComponentNode extends ComponentNode {
  _el?: Comment
}

function connectTeleportNode(node: TeleportComponentNode, parentEl?: ParentNode, anchor?: Node | null) {
  const ctx = node.context!
  const props: TeleportProps = ctx.props!

  const placeholder = document.createComment('Teleport')
  node._el = placeholder
  parentEl?.insertBefore(placeholder, anchor ?? null)

  // Children are first connected into a detached fragment; the first
  // `update()` (run on mount, and again whenever `to` changes) moves them to
  // the real target. Connect always into the same throwaway fragment — child
  // contexts/refs stay valid across the subsequent `moveNode`.
  const staging = document.createDocumentFragment()
  for (const child of node.children || []) {
    connect(child, staging)
  }

  onMounted(() => update())

  useWatch(
    () => props.to,
    () => update(),
    {
      scheduler: asyncWatcherScheduler,
    },
  )

  function update() {
    const target = (props.to && document.querySelector(props.to)) || document.createDocumentFragment()

    for (const child of node.children || []) {
      moveNode(child, target)
    }
  }
}

function moveTeleportNode(node: TeleportComponentNode, parentEl: ParentNode, anchor?: Node) {
  if (node._el) {
    moveTo(parentEl, node._el, anchor)
  }
}

function getTeleportNodeElement(node: TeleportComponentNode) {
  const r: NodeElementRange = {
    start: node._el,
    end: node._el,
  }

  return r
}

function disconnectTeleportNode(node: TeleportComponentNode) {
  for (const child of node.children || []) {
    disconnect(child)
  }

  node._el?.remove()
}
