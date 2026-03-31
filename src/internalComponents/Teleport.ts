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

function connectTeleportNode(node: TeleportComponentNode, parentEl?: ParentNode) {
  const ctx = node.context!
  const props: TeleportProps = ctx.props!

  const anchor = document.createComment('Teleport')
  node._el = anchor
  parentEl?.appendChild(anchor)

  init()

  onMounted(() => update())

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
    const rootEl = props.to ? document.querySelector(props.to) : undefined
    const targetEl = rootEl || document.createDocumentFragment()

    for (const child of node.children || []) {
      moveNode(child, targetEl)
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
