import { defineComponentName, type FunctionalComponent } from '../defineComponent'
import {
  getNodeElement,
  moveNode,
  type InternalComponentOps,
  type NodeElementRange,
} from '../nodes'
import { connect, disconnect } from '../ops'
import type { ComponentNode } from './ComponentNode'

export const Fragment: FunctionalComponent = () => {}

defineComponentName(Fragment, 'Fragment')

export const FragmentOps: InternalComponentOps = {
  is: isFragmentComponent,
  connect: connectFragmentNode,
  move: moveFragmentNode,
  getElementRange: getFragmentNodeElement,
  disconnect: disconnectFragmentNode,
}

function isFragmentComponent(type: FunctionalComponent) {
  return type === Fragment
}

function connectFragmentNode(node: ComponentNode, parentEl?: ParentNode) {
  for (const child of node.children || []) {
    connect(child, parentEl)
  }
}

function disconnectFragmentNode(node: ComponentNode) {
  for (const child of node.children || []) {
    disconnect(child)
  }
}

function moveFragmentNode(node: ComponentNode, parentEl: ParentNode, anchor?: Node) {
  for (const child of node.children || []) {
    moveNode(child, parentEl, anchor)
  }
}

function getFragmentNodeElement(node: ComponentNode): NodeElementRange {
  const first = node.children?.at(0)
  const last = node.children?.at(-1)

  const result = {
    start: getNodeElement(first)?.start,
    end: getNodeElement(last)?.end,
  }

  return result
}
