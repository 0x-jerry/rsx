class AnchorNodeMovedEvent extends Event {
  constructor() {
    super('moved')
  }
}

interface AnchorNode extends Comment {
  __dyn: true

  addEventListener(
    type: 'moved',
    listener: (event: AnchorNodeMovedEvent) => void,
  ): void

  removeEventListener(
    type: 'moved',
    listener: (event: AnchorNodeMovedEvent) => void,
  ): void
}

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

function isDynamicNode(o: Node): o is AnchorNode {
  return '__dyn' in o && o.__dyn === true
}

export function dispatchAnchorMovedEvent(el: Node) {
  if (isDynamicNode(el)) {
    el.dispatchEvent(new AnchorNodeMovedEvent())
  }
}
