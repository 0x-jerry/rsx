import { EventEmitter } from '@0x-jerry/utils'

type DNodeEventMap = {
  mounted: []
  unmounted: []
}

export interface DNodeContext extends EventEmitter<DNodeEventMap> {
  name?: string
  children?: Set<DNodeContext>
}

export const {
  push: setCurrentContext,
  pop: popCurrentContext,
  current: getCurrentContext,
  runWith: runWithContext,
} = defineContext<DNodeContext>()

export function createNodeContext(name?: string) {
  const ctx = new EventEmitter() as DNodeContext

  ctx.name = name

  return ctx
}

function defineContext<T>() {
  const stack: T[] = []

  const actions = {
    push(ctx: T) {
      stack.push(ctx)
    },
    pop() {
      return stack.pop()
    },
    current() {
      return stack.at(-1)
    },
    runWith<U>(fn: () => U, ctx: T): U {
      actions.push(ctx)

      try {
        return fn()
      } catch (error) {
        throw error
      } finally {
        actions.pop()
      }
    },
  }

  return actions
}

export function appendToCurrentContext(ctx: DNodeContext) {
  const previousCtx = getCurrentContext()

  if (!previousCtx) {
    return
  }

  ctx.on('unmounted', () => {
    // remove it self
    previousCtx.children?.delete(ctx)
  })

  previousCtx.children ||= new Set()
  previousCtx.children.add(ctx)
}
