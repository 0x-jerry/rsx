import {
  EventEmitter,
  PrimitiveType,
  isPrimitive,
  walkTree,
} from '@0x-jerry/utils'
import { MaybeRef } from './types'
import { effect, effectScope, isRef, unref } from '@vue/reactivity'
import { isObject } from '@0x-jerry/utils'

export interface DNodeContext extends EventEmitter<DNodeEventMap> {
  mount(parent: ParentNode, anchor?: Node): void
  state?: Map<string, any>
}

type DNodeEventMap = {
  created(): void
  mounted(): void
  unmounted(fromParent?: boolean): void
}

type MixDComponent = {
  _: DNodeContext
}

export type DElement = HTMLElement & MixDComponent

export type DText = Text & MixDComponent

export type DFragment = MixDComponent & {
  _fg: true
  children: (DComponent | Node)[]
}

export type DComponent = DText | DFragment | DElement

export type DNode = DComponent | HTMLElement | MaybeRef<PrimitiveType>

export function createNativeElement(
  type: string,
  props?: Record<string, any>,
  children?: DNode[],
) {
  const el = document.createElement(type) as DElement

  const ctx = createNodeContext()
  el._ = ctx

  const u = createUpdaterScope()

  Object.entries(props || {}).forEach(([key, value]) => {
    if (!isRef(value)) {
      updateEl(el, key, value)
      return
    }

    ctx.state ||= new Map()

    u.add(() => {
      const old = ctx.state!.get(key)

      // todo: check old !== value
      updateEl(el, key, value, old)

      ctx.state!.set(key, value)
    })
  })

  ctx.on('mounted', u.run)
  ctx.on('unmounted', (fromParent: boolean) => {
    u.stop()

    walkTree(el, (item) => {
      getContext(item).emit('unmounted', true)
    })

    if (!fromParent) {
      el.remove()
    }
  })

  mountChildren(el, children)

  return el
}

export function createTextElement(content: MaybeRef<PrimitiveType>) {
  const el = document.createTextNode('') as DText

  const ctx = createNodeContext()
  el._ = ctx

  const u = createUpdaterScope()

  if (isRef(content)) {
    u.add(() => {
      el.textContent = String(unref(content) ?? '')
    })
  } else {
    el.textContent = String(content ?? '')
  }

  ctx.on('mounted', u.run)
  ctx.on('unmounted', u.stop)

  return el
}

export function createFragment(children: DNode[]) {
  const ctx = createNodeContext()

  const el: DFragment = {
    _: ctx,
    _fg: true,
    children: [],
  }

  ctx.mount = (parent, anchor) => {
    mountChildren(parent, children, anchor)
    ctx.emit('mounted')
  }

  el._ = ctx

  return el
}

// ---- utils ----

function createNodeContext() {
  const ctx = new EventEmitter() as DNodeContext

  ctx.mount = (p, a) => {
    ctx.emit('mounted')
  }

  return ctx
}

export function createUpdaterScope() {
  let flushQueue = new Set<() => void>()
  const scope = effectScope()

  let pending: Promise<void> | null = null

  return {
    add(fn: () => void) {
      const runner = effect(fn, {
        lazy: true,
        scope,
        scheduler() {
          flushQueue.add(runner)

          if (pending) {
            return
          }

          pending = Promise.resolve().then(() => {
            flush()
            pending = null
          })
        },
      })

      flushQueue.add(runner)

      return runner
    },
    run: flush,
    stop: scope.stop,
  }

  function flush() {
    for (const run of flushQueue) {
      run()
    }

    flushQueue = new Set()
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

function mountChildren(parent: ParentNode, children?: DNode[], anchor?: Node) {
  for (const child of children || []) {
    if (isRef(child)) {
      const childEl = createTextElement(child)

      getContext(childEl)!.mount(parent)

      mount(childEl)
      continue
    }

    if (isPrimitive(child)) {
      const childEl = createTextElement(child)

      mount(childEl)
      getContext(childEl).mount(parent)
    } else if (isDComponent(child)) {
      if (!isFragment(child)) {
        mount(child)
      }

      getContext(child).mount(parent)
    } else {
      mount(child)
      console.warn(
        `find pure dom element child, may cause unexpected behavior.`,
        child,
      )
    }
  }

  function mount(child: Node) {
    if (anchor) {
      parent.insertBefore(child, anchor)
    } else {
      parent.appendChild(child)
    }
  }
}

export function getContext(el?: DComponent): DNodeContext
export function getContext(el?: unknown): DNodeContext | null
export function getContext(el?: unknown): DNodeContext | null {
  return isDComponent(el) ? el._ : null
}

export function isDComponent(o: unknown): o is DComponent {
  return isObject(o) && '_' in o
}

export function isFragment(o: unknown): o is DFragment {
  return isDComponent(o) && '_fg' in o
}
