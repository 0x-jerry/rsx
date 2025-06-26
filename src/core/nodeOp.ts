import { type DElement, isFragment, normalizeNode } from './node'

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
  children?: unknown[],
  anchor?: Node,
) {
  const _children: DElement[] = []

  for (const child of children || []) {
    const childEl = normalizeNode(child)

    moveTo(parent, childEl, anchor)

    _children.push(childEl)
  }

  return _children
}

export function updateEl(
  el: HTMLElement,
  key: string,
  value: any,
  oldValue?: any,
) {
  if (/^on/.test(key)) {
    const eventName = key.slice(2).toLowerCase()

    if (oldValue) {
      el.removeEventListener(eventName, oldValue)
    }

    el.addEventListener(eventName, value)
    return
  }

  const isValueKey =
    el.tagName === 'INPUT' && ['value', 'checked'].includes(key)

  if (isValueKey) {
    // @ts-ignore
    el[key] = value
  } else {
    if (value == null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, value)
    }
  }
}
