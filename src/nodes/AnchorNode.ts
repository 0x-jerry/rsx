import { EventEmitter, isObject } from '@0x-jerry/utils'

type AnchorNodeEvents = {
  moved: []
}

const AnchorNodeSymbol = Symbol('AnchorNode')
type AnchorNodeSymbol = typeof AnchorNodeSymbol

export interface AnchorNodeContext {
  firstChild?: ChildNode | null
  emitter: EventEmitter<AnchorNodeEvents>
}

export interface AnchorNode {
  [AnchorNodeSymbol]: true
  name?: string
  children?: unknown[]
  mounted?: boolean
  unmounted?: boolean
  context?: AnchorNodeContext
}

/**
 * Used by dynamic component, which will change children position by internal logic
 *
 * @param name
 * @returns
 */
export function createAnchorNode(name = 'dynamic') {
  const anchor: AnchorNode = {
    [AnchorNodeSymbol]: true,
    name,
  }

  return anchor
}

export function isAnchorNode(o: unknown): o is AnchorNode {
  return isObject(o) && AnchorNodeSymbol in o
}

export function mountAnchorNode(node: AnchorNode) {
  const anchorEl = document.createComment(node.name ?? '')

  const ctx: AnchorNodeContext = {
    emitter: new EventEmitter(),
  }

  node.mounted = true
  node.context = ctx

  return anchorEl
}
