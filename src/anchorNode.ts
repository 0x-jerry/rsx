class AnchorNodeMovedEvent extends Event {
  constructor() {
    super(AnchorNodeEventNames.Moved)
  }
}

export interface AnchorNode extends Comment {
  __dyn: true

  /**
   * Used by position check in dynamic component
   */
  __firstChild?: ChildNode | null

  addEventListener(
    type: 'moved',
    listener: (event: AnchorNodeMovedEvent) => void,
  ): void

  removeEventListener(
    type: 'moved',
    listener: (event: AnchorNodeMovedEvent) => void,
  ): void
}

export const AnchorNodeEventNames = {
  Moved: 'moved',
} as const

/**
 * Used by dynamic component, which will change children position by internal logic
 *
 * @param name
 * @returns
 */
export function createAnchorNode(name = 'dynamic') {
  const el = document.createComment(name) as AnchorNode
  el.__dyn = true

  return el
}

export function isAnchorNode(o: Node): o is AnchorNode {
  return '__dyn' in o && o.__dyn === true
}

export function dispatchAnchorMovedEvent(el: Node) {
  if (isAnchorNode(el)) {
    el.dispatchEvent(new AnchorNodeMovedEvent())
  }
}

export function getAnchorFirstChildNode(node: AnchorNode) {
  if (!node.__firstChild) {
    return node
  }

  if (isAnchorNode(node.__firstChild)) {
    return getAnchorFirstChildNode(node.__firstChild)
  }

  return node.__firstChild
}
