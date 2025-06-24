import { type DComponent, type DNode, isFragment, normalizeNode } from './node'

export function moveTo(parent: ParentNode, node: Node, anchor?: Node) {
  if (!isFragment(node)) {
    moveSelf()

    return
  }

  node.__children.forEach((item) => moveTo(parent, item, anchor))

  moveSelf()

  return

  function moveSelf() {
    if (anchor) {
      parent.insertBefore(node, anchor)
    } else {
      parent.appendChild(node)
    }
  }
}

export function insertBefore(anchor: Node, node: Node) {
  moveTo(anchor.parentElement!, node, anchor)
}

export function moveChildren(
  parent: ParentNode,
  children?: DNode[],
  anchor?: Node,
) {
  const _children: DComponent[] = []

  for (const child of children || []) {
    const childEl = normalizeNode(child)

    moveTo(parent, childEl, anchor)

    _children.push(childEl)
  }

  return _children
}
