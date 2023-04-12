import { EventEmitter, Fn } from '@0x-jerry/utils'
import { effectScope, effect } from '@vue/reactivity'
import { DComponent, isDComponent } from './node'

type DNodeEventMap = {
  mounted(): void
  unmounted(fromParent?: boolean): void
}

export interface DNodeContext extends EventEmitter<DNodeEventMap> {
  state?: Map<string, any>
  updater: Updater
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

export function createNodeContext() {
  const ctx = new EventEmitter() as DNodeContext

  let updater: Updater | null = null

  Object.defineProperty(ctx, 'updater', {
    get() {
      return updater || (updater = createUpdaterScope())
    },
  })

  return ctx
}

export function setCurrentContext(ctx: DNodeContext) {
  currentCtxStack.push(ctx)
}

export function popCurrentContext() {
  return currentCtxStack.pop()
}

export function getCurrentContext() {
  return currentCtxStack
}

export function getContext(el?: DComponent): DNodeContext
export function getContext(el?: unknown): DNodeContext | null
export function getContext(el?: unknown): DNodeContext | null {
  return isDComponent(el) ? el._ : null
}

export function useContext() {
  const ctx = currentCtxStack.at(-1)

  if (!ctx)
    throw new Error('This should only used inside functional component.')

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
