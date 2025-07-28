import { moveTo } from '@/nodeOp'
import { BaseNode } from './BaseNode'
import { NodeType, normalizeNodes } from './shared'

interface AnchorComment extends Comment {
  __node: AnchorNode
}

export class AnchorNode extends BaseNode {
  static is(o: unknown): o is AnchorNode {
    return o instanceof AnchorNode
  }

  readonly type = NodeType.Anchor

  name?: string

  el?: Comment

  initialize(): void {
    this.el = document.createComment(this.name || '')

    ;(this.el as AnchorComment).__node = this

    for (const child of this.children || []) {
      child.initialize()
    }
  }

  moveChildren() {
    for (const child of this.children || []) {
      if (child.el) {
        if (!this.el?.parentElement) {
          throw new Error(`This should be an internal bug`)
        }

        moveTo(this.el.parentElement, child.el, this.el)
      }
    }
  }
}

/**
 * Do not use this function, if you want to create a anchor node,
 * please use {@link createAnchorNode} instead of.
 *
 * @internal
 * @param children
 * @returns
 */
export function createFragment(children?: unknown[]) {
  if (!children?.length) {
    return null
  }

  const node = createAnchorNode('Fragment')

  node.children = normalizeNodes(children)

  // Simplify nested fragments
  if (node.children.length === 1) {
    const first = node.children[0]
    if (AnchorNode.is(first)) {
      return first
    }
  }

  return node
}

export function createAnchorNode(name?: string) {
  const node = new AnchorNode()
  node.name = name

  return node
}

export function isAnchorElement(node: unknown): node is AnchorComment {
  return node instanceof Comment && '__node' in node
}

export function getAnchorFirstChildElement(
  node: AnchorComment,
): HTMLElement | undefined {
  const firstEl = node.__node.children?.at(0)?.el || node.__node.el

  return isAnchorElement(firstEl)
    ? getAnchorFirstChildElement(firstEl)
    : (firstEl as HTMLElement)
}
