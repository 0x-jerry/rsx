import { BaseNode, NodeType, normalizeNodes } from './shared'

export class AnchorNode extends BaseNode {
  static is(o: unknown): o is AnchorNode {
    return o instanceof AnchorNode
  }

  readonly type = NodeType.Text

  name?: string

  el?: Comment

  initialize(): void {
    this.el = document.createComment(this.name || '')
  }
}

export function createFragment(children?: unknown[]) {
  const node = new AnchorNode()

  if (children?.length) {
    node.children = normalizeNodes(children)
  }

  return node
}
