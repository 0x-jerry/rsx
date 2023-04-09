import { PrimitiveType, isObject, isPrimitive, walkTree } from '@0x-jerry/utils'
import { effect, isReactive, isRef, stop, unref } from '@vue/reactivity'
import { MaybeRef } from './types'

export type VElement = {
  unmount(): void
  state: Map<string, any>
}

interface VElementEventMap {
  unmount: Event
}

type MixVElement = {
  _: VElement

  // custom event
  addEventListener<K extends keyof VElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: VElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof VElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: VElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void
}

export type VHTMLElement = HTMLElement & MixVElement

export type VText = Text & MixVElement

export type VFragment = HTMLElement & MixVElement

export type VInternalElements = VText | VFragment | VHTMLElement

export type VNode = VInternalElements | HTMLElement | MaybeRef<PrimitiveType>

export function createEl(
  type: string,
  props?: Record<string, any>,
  children?: VNode[]
): HTMLElement {
  const el = document.createElement(type) as VHTMLElement

  const vEl = createVElement(el)
  const u = createUpdater()

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

    u.updaters.push(updater)
  })

  u.run()

  el.addEventListener('unmount', u.stop)

  el._ = vEl

  createChildren(el, children)

  return el
}

export function createTextEl(content: MaybeRef<PrimitiveType>) {
  const el = document.createTextNode('') as VText

  const vEl = createVElement(el)

  const u = createUpdater()

  if (isRef(content)) {
    u.updaters.push(() => {
      el.textContent = String(unref(content) ?? '')
    })
  } else {
    el.textContent = String(content ?? '')
  }

  u.run()

  el.addEventListener('unmount', u.stop)

  el._ = vEl

  return el
}

export function createFragment(children?: VNode[]) {
  const el = document.createElement('div') as any as VFragment
  el.style.display = 'contents'

  const vEl: VElement = {
    unmount() {
      el.dispatchEvent(new Event('unmount'))
    },
    state: new Map()
  }

  el._ = vEl

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

function createVElement(el: Node) {
  const vEl: VElement = {
    unmount() {
      el.dispatchEvent(new Event('unmount'))
    },
    state: new Map()
  }

  return vEl
}

export function createUpdater() {
  const updaters: (() => void)[] = []

  let pending: Promise<void> | null = null

  const runner = effect(
    () => {
      updaters.forEach((fn) => fn())
    },
    {
      lazy: true,
      scheduler() {
        if (pending) return

        pending = Promise.resolve().then(() => {
          runner()
          pending = null
        })
      }
    }
  )

  return {
    updaters,
    run: runner,
    stop() {
      stop(runner)
    }
  }
}

export function unmount(el: VInternalElements) {
  walkTree(el, (item) => {
    const ctx = item._
    ctx.unmount()
  })
}

export function isInternalElements(o: unknown): o is VInternalElements {
  return isObject(o) && '_' in o
}
