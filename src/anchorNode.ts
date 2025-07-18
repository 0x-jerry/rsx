import { EventEmitter } from '@0x-jerry/utils'

type AnchorNodeEvents = {
  moved: []
}

class AnchorNodeContext extends EventEmitter<AnchorNodeEvents> {
  firstChild?: ChildNode | null
}

export interface AnchorNode extends Comment {
  /**
   * @private
   */
  __dyn: AnchorNodeContext
}

/**
 * Used by dynamic component, which will change children position by internal logic
 *
 * @param name
 * @returns
 */
export function createAnchorNode(name = 'dynamic') {
  const el = document.createComment(name) as AnchorNode
  el.__dyn = new AnchorNodeContext()

  return el
}

export function isAnchorNode(o: Node): o is AnchorNode {
  return '__dyn' in o && o.__dyn instanceof AnchorNodeContext
}

export function listenAnchorMoveEvent(node: AnchorNode, callback: () => void) {
  return node.__dyn.on('moved', callback)
}

export function dispatchAnchorMovedEvent(el: Node) {
  if (isAnchorNode(el)) {
    el.__dyn.emit('moved')
  }
}

export function setAnchorNodeFirstChildren(
  anchorNode: AnchorNode,
  childEl?: ChildNode | null,
) {
  anchorNode.__dyn.firstChild = childEl
}

export function isAnchorNodeHasFirstChildren(anchorNode: AnchorNode) {
  return anchorNode.__dyn.firstChild != null
}

export function getAnchorFirstChildNode(node: AnchorNode) {
  const firstChild = node.__dyn.firstChild
  if (!firstChild) {
    return node
  }

  if (isAnchorNode(firstChild)) {
    return getAnchorFirstChildNode(firstChild)
  }

  return firstChild
}
