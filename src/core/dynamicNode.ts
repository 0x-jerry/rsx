class DynamicNodeMovedEvent extends Event {
  constructor() {
    super('moved')
  }
}

interface DynamicNode extends Comment {
  __dyn: true

  addEventListener(
    type: 'moved',
    listener: (event: DynamicNodeMovedEvent) => any,
  ): void

  removeEventListener(
    type: 'moved',
    listener: (event: DynamicNodeMovedEvent) => any,
  ): void
}

/**
 * Used by dynamic component, which will change children position by internal logic
 *
 * @param name
 * @returns
 */
export function createDynamicNode(name = 'dynamic') {
  const el = document.createComment(name) as DynamicNode
  el.__dyn = true

  return el
}

export function isFragmentNode(o: Node): o is DynamicNode {
  return '__dyn' in o && o.__dyn === true
}

export function dispatchMovedEvent(el: Node) {
  if (isFragmentNode(el)) {
    el.dispatchEvent(new DynamicNodeMovedEvent())
  }
}
