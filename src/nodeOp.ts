import { normalizeNode } from './node'

export function moveTo(parent: ParentNode, node: Node, anchor?: Node) {
  if (!(node instanceof Node)) {
    throw new Error('node is not a node')
  }

  if (!(parent instanceof Node)) {
    throw new Error('parent is not a node')
  }

  if (anchor) {
    if (!(anchor instanceof Node)) {
      throw new Error('anchor is not a node')
    }

    parent.insertBefore(node, anchor)
  } else {
    parent.appendChild(node)
  }
}

export function insertBefore(anchor: Node, node: Node) {
  if (anchor.parentElement) {
    moveTo(anchor.parentElement, node, anchor)
  } else {
    console.error('Anchor is not attached into DOM')
    // throw new Error('Anchor is not attached into DOM')
  }
}

export function moveChildren(
  parent: ParentNode,
  children?: unknown[],
  anchor?: Node,
) {
  const stack = (children || [])?.slice()

  while (stack.length) {
    const child = stack.shift()
    if (Array.isArray(child)) {
      stack.push(...child)
      continue
    }

    const childEl = normalizeNode(child)

    if (childEl != null) {
      moveTo(parent, childEl, anchor)
    }
  }
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
