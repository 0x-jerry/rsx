import { PrimitiveType, isPrimitive, walkTree } from '@0x-jerry/utils'
import { MaybeRef } from './types'
import { effect, effectScope, unref } from '@vue/reactivity'
import { isObject } from '@0x-jerry/utils'
import { DNodeContext, getContext, onUnmounted, useContext } from './hook'

type MixDComponent = {
  _: DNodeContext
}

export type DElement = HTMLElement & MixDComponent

export type DText = Text & MixDComponent

export type DFragment = MixDComponent & {
  _fg: true
  children: DComponent[]
  getLastElement(): Node | null
  moveTo(parent: ParentNode, anchor?: Node): void
}

export type DComponent = DText | DFragment | DElement

export type DNode = DComponent | MaybeRef<PrimitiveType>

export function createNativeElement(
  type: string,
  props: Record<string, any>,
  children?: DNode[],
) {
  const el = document.createElement(type) as DElement

  const ctx = useContext()

  el._ = ctx

  const keys = Object.keys(props)

  if (keys.length) {
    ctx.state ||= new Map()

    for (const key of keys) {
      ctx.updater.add(() => {
        const value = props![key]

        const old = ctx.state!.get(key)

        // todo: check old !== value
        updateEl(el, key, value, old)

        ctx.state!.set(key, value)
      })
    }
  }

  ctx.on('mounted', ctx.updater.flush)
  ctx.on('unmounted', () => {
    ctx.updater.scope.stop()

    walkTree(el, (item) => {
      getContext(item).emit('unmounted', true)
    })

    el.remove()
  })

  const _children = moveChildren(el, children)

  _children.forEach((item) => getContext(item).emit('mounted'))

  return el
}

export function createTextElement(content: MaybeRef<PrimitiveType>) {
  const el = document.createTextNode('') as DText

  const ctx = useContext()
  el._ = ctx

  ctx.updater.add(() => {
    el.textContent = String(unref(content) ?? '')
  })

  ctx.on('mounted', ctx.updater.flush)
  ctx.on('unmounted', () => {
    ctx.updater.scope.stop()

    el.remove()
  })

  return el
}

export function createFragment(children: DNode[]) {
  const ctx = useContext()

  let mounted = false

  const el: DFragment = {
    _: ctx,
    _fg: true,
    children: [],
    getLastElement() {
      const last = el.children.at(-1)

      if (isFragment(last)) {
        return this.getLastElement()
      }

      return last || null
    },
    moveTo(parent, anchor) {
      const _children = moveChildren(
        parent,
        mounted ? el.children : children,
        anchor,
      )
      el.children = _children

      if (!mounted) {
        mounted = true

        el.children.forEach((item) => getContext(item).emit('mounted'))
      }
    },
  }

  onUnmounted(() => {
    el.children.forEach((item) => getContext(item)?.emit('unmounted'))
  })

  return el
}

// ---- utils ----

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

function moveChildren(parent: ParentNode, children?: DNode[], anchor?: Node) {
  const _children: DComponent[] = []

  for (const child of children || []) {
    const childEl = normalizeNode(child)

    if (isFragment(childEl)) {
      childEl.moveTo(parent, anchor)
    } else {
      move(childEl)
    }

    _children.push(childEl)
  }

  return _children

  function move(child: Node) {
    if (anchor) {
      parent.insertBefore(child, anchor)
    } else {
      parent.appendChild(child)
    }
  }
}

export function normalizeNode(node: DNode): DComponent {
  const rawValue = unref(node)

  if (isPrimitive(rawValue)) {
    return createTextElement(node as MaybeRef<PrimitiveType>)
  }

  if (isFragment(rawValue)) {
    return rawValue
  } else {
    return rawValue
  }
}

export function isDComponent(o: unknown): o is DComponent {
  return isObject(o) && '_' in o
}

export function isFragment(o: unknown): o is DFragment {
  return isDComponent(o) && '_fg' in o
}
