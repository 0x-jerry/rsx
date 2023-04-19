import { EventEmitter, Fn, isObject } from '@0x-jerry/utils'
import { effectScope, effect } from '@vue/reactivity'
import { DComponent } from './node'

type DNodeEventMap = {
  mounted(): void
  unmounted(fromParent?: boolean): void
}

export interface DNodeContext extends EventEmitter<DNodeEventMap> {
  name?: string
  updater: Updater
  children?: DNodeContext[]
}

const currentCtxStack: DNodeContext[] = []

type Updater = ReturnType<typeof createUpdaterScope>

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
    flush,
    scope,
  }

  function flush() {
    for (const run of flushQueue) {
      run()
    }

    flushQueue = new Set()
  }
}

export function createNodeContext(name?: string) {
  const ctx = new EventEmitter() as DNodeContext
  ctx.name = name

  let updater: Updater | null = null

  Object.defineProperty(ctx, 'updater', {
    get() {
      return updater || (updater = createUpdaterScope())
    },
  })

  ctx.on('mounted', ctx.updater.flush)

  ctx.on('unmounted', () => {
    ctx.updater.scope.stop()
  })

  return ctx
}

export function appendToCurrentContext(ctx: DNodeContext) {
  const previousCtx = getCurrentContext()

  if (!previousCtx) {
    return
  }

  ctx.on('unmounted', () => {
    // remove it self
    const idx = previousCtx.children?.indexOf(ctx)
    if (idx != null && idx >= 0) {
      previousCtx.children?.splice(idx, 1)
    }
  })

  previousCtx.children ||= []
  previousCtx.children.push(ctx)
}

export function setCurrentContext(ctx: DNodeContext) {
  currentCtxStack.push(ctx)
}

export function popCurrentContext() {
  return currentCtxStack.pop()
}

export function getCurrentContext() {
  return currentCtxStack.at(-1)
}

export function getContext(el?: unknown): DNodeContext | null {
  return isObject(el) && '_' in el && (el._ as any)
}

export function unmount(node: DComponent) {
  const ctx = getContext(node)

  node.remove()

  if (!ctx) return

  ctx.children?.forEach((child) => child.emit('unmounted'))

  ctx.emit('unmounted')
}

export function mount(node: DComponent) {
  const ctx = getContext(node)

  if (!ctx) return
  ctx.emit('mounted')
}

//  --------
export function useContext() {
  const ctx = getCurrentContext()

  if (!ctx) {
    debugger
    throw new Error('This should only used inside functional component.')
  }

  return ctx
}

export function runWithContext(ctx: DNodeContext, fn: () => void) {
  setCurrentContext(ctx)
  fn()
  return popCurrentContext()
}

export function onMounted(fn: Fn) {
  const ctx = useContext()

  ctx.on('mounted', fn)
}

export function onUnmounted(fn: Fn) {
  const ctx = useContext()

  ctx.on('unmounted', fn)
}

export function watchEffect(fn: Fn) {
  const ctx = useContext()

  return effect(fn, {
    scope: ctx.updater.scope,
  })
}

export function watch<T>(
  getter: () => T,
  fn: (val: T, oldVal: T | null) => any,
) {
  const ctx = useContext()

  let oldValue: T | null = null
  ctx.updater.add(() => {
    const newValue = getter()

    Promise.resolve().then(() => {
      fn(newValue, oldValue)
      oldValue = newValue
    })
  })
}
