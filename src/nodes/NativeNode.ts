import { createNativeElement, createTextElement } from '../node'
import { type AnyNode, AnyNodeSymbol, AnyNodeType, isAnyNode, type NodeElementRange } from './node'
import { moveTo } from '../nodeOp'
import type { AnyProps } from '../props'

export interface NativeNodeContext {
  el: HTMLElement | Text
  cleanup?: () => void
}

const TEXT_NODE_TYPE = '__text__'

export interface NativeNode extends AnyNode {
  [AnyNodeSymbol]: AnyNodeType.Native
  type: string
  context?: NativeNodeContext
}

export function createNativeNode(type: string, props?: AnyProps, children?: AnyNode[]): NativeNode {
  const o: NativeNode = {
    [AnyNodeSymbol]: AnyNodeType.Native,
    type: type,
    props,
    children,
  }

  return o
}

export function createNativeTextNode(content: unknown) {
  const node = createNativeNode(TEXT_NODE_TYPE, { textContent: content })

  return node
}

export function isNativeNode(o: unknown): o is NativeNode {
  return isAnyNode(o) && o[AnyNodeSymbol] === AnyNodeType.Native
}

export function connectNativeNode(
  node: NativeNode,
  parentEl?: ParentNode,
): HTMLElement | Text | undefined {
  const { el, cleanup } =
    node.type === TEXT_NODE_TYPE
      ? createTextElement(node.props?.textContent)
      : createNativeElement(node.type, node.props)

  node.context = {
    el,
    cleanup,
  }

  parentEl?.appendChild(el)

  return el
}

export function moveNativeNode(node: NativeNode, parentEl: ParentNode, anchor?: Node) {
  const el = node.context?.el

  if (!el) {
    throw new Error(`Native node not mounted!`)
  }

  moveTo(parentEl, el, anchor)
}

export function getNativeNodeElement(node: NativeNode): NodeElementRange {
  return {
    start: node.context?.el,
    end: node.context?.el,
  }
}

export function disconnectNativeNode(node: NativeNode) {
  node.context?.el.remove()
  node.context?.cleanup?.()
}
