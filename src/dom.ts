import { PrimitiveType, isPrimitive, isString } from '@0x-jerry/utils'
import { effect, isReactive, isRef, stop, unref } from '@vue/reactivity'
import { MaybeRef } from '@vueuse/core'

export type Element = {
  unmount(): void
  state: Map<string, any>
}

export type VHTMLElement = HTMLElement & {
  _: Element
}

export type VText = Text & {
  _: Element
}

export type VFragment = DocumentFragment & {
  /**
   * fragment type: for or if
   */
  _t: FragmentType
  _: Element
}

export type VNode =
  | VHTMLElement
  | VFragment
  | VText
  | HTMLElement
  | MaybeRef<PrimitiveType>

export function createEl(
  type: string,
  props?: Record<string, any>,
  children?: VNode[]
): HTMLElement {
  const el = document.createElement(type) as VHTMLElement

  const vEl: Element = {
    state: new Map(),
    unmount() {
      stop(runner)
    }
  }

  const updaters: (() => void)[] = []

  Object.entries(props || {}).forEach(([key, value]) => {
    const _reactive = isReactive(value) || isRef(value)

    if (!_reactive) {
      updateEl(el, key, value)
      return
    }

    const updater = () => {
      const old = vEl.state.get(key)

      // todo: check old !== value
      updateEl(el, key, value, old)

      vEl.state.set(key, value)
    }

    updaters.push(updater)
  })

  const runner = effect(() => {
    updaters.forEach((fn) => fn())
  })

  el._ = vEl

  createChildren(el, children)

  return el
}

function createTextEl(content: MaybeRef<PrimitiveType>) {
  const el = document.createTextNode('') as VText

  const vEl: Element = {
    unmount() {
      stop(runner)
    },
    state: new Map()
  }

  const updaters: (() => void)[] = []

  if (isRef(content)) {
    updaters.push(() => {
      el.textContent = String(unref(content) ?? '')
    })
  } else {
    el.textContent = String(content ?? '')
  }

  const runner = effect(() => {
    updaters.forEach((fn) => fn())
  })

  el._ = vEl

  return el
}

export enum FragmentType {
  None,
  For,
  If
}

export function createFragment(
  type: FragmentType = FragmentType.None,
  children?: VNode[]
) {
  const el = document.createDocumentFragment() as VFragment

  const vEl: Element = {
    unmount() {},
    state: new Map()
  }

  el._ = vEl
  el._t = type

  createChildren(el, children)

  return el
}

function createChildren(el: ParentNode, children?: VNode[]) {
  for (const child of children || []) {
    if (isRef(child)) {
      const childEl = createTextEl(child)

      el.append(childEl)
      continue
    }

    if (isPrimitive(child)) {
      const childEl = createTextEl(child)

      el.append(childEl)
    } else {
      el.append(child)
    }
  }
}

function updateEl(el: HTMLElement, key: string, value: any, oldValue?: any) {
  if (/^on/.test(key)) {
    const eventName = key.slice(2).toLowerCase()

    if (oldValue) {
      el.removeEventListener(eventName, oldValue)
    }

    el.addEventListener(eventName, value)
    return
  }

  if (value == null) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, value)
  }
}
