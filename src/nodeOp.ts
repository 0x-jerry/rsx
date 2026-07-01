export const BOOLEAN_ATTRS = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defaultchecked',
  'defaultmuted',
  'defaultselected',
  'defer',
  'disabled',
  'enabled',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
  'truespeed',
  'typemustmatch',
  'visible',
])

function isBooleanAttr(key: string): boolean {
  return BOOLEAN_ATTRS.has(key.toLowerCase())
}

export function moveTo(parent: ParentNode, node: Node, anchor?: Node | null) {
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

export function updateEl(el: HTMLElement, key: string, value: any, oldValue?: any) {
  // Event handlers: `onClick` -> `click`
  if (key.startsWith('on')) {
    const eventName = key.slice(2).toLowerCase()

    if (oldValue != null) {
      el.removeEventListener(eventName, oldValue)
    }

    if (typeof value === 'function') {
      el.addEventListener(eventName, value)
    }

    return
  }

  // `style` attribute: string or object
  if (key === 'style') {
    const s = el as HTMLElement & { style: CSSStyleDeclaration }

    if (value == null || value === false) {
      // Clear cssText first so the `style` attribute becomes empty,
      // then drop the attribute. (Reversing the order re-adds `style=""`.)
      s.style.cssText = ''
      s.removeAttribute('style')
    } else if (typeof value === 'string') {
      s.style.cssText = value
    } else if (typeof value === 'object') {
      // object style: { color: 'red', '--x': '1px' }
      for (const k in value) {
        const v = (value as any)[k]
        if (v == null) {
          // @ts-ignore: indexed setter
          s.style[k as any] = ''
        } else {
          // @ts-ignore: indexed setter
          s.style[k as any] = v
        }
      }
    }

    return
  }

  // Boolean attributes: `disabled`, `checked`, `hidden`, ...
  if (isBooleanAttr(key)) {
    const isOn = value === true || value === '' || value === key

    if (isOn) {
      el.setAttribute(key, key)
    } else {
      el.removeAttribute(key)
    }

    return
  }

  // For input value/checked we must set the property so the UI reflects it.
  const isValueKey = el.tagName === 'INPUT' && (key === 'value' || key === 'checked')

  if (isValueKey) {
    // @ts-ignore
    el[key] = value
    return
  }

  // Generic attribute
  if (value == null || value === false) {
    el.removeAttribute(key)
  } else if (value === true) {
    el.setAttribute(key, key)
  } else {
    el.setAttribute(key, String(value))
  }
}