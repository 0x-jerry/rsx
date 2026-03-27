import { EventEmitter } from '@0x-jerry/utils'
import type { ComponentNode } from './ComponentNode'
import { AnyProps } from './props'

export const ComponentContextEventNameMap = {
  beforeMount: 'bm',
  mounted: 'm',

  beforeUnmount: 'bum',
  unmounted: 'um',
} as const

export type ComponentEvents = {
  /**
   * before mount
   */
  bm: []
  /**
   * mounted
   */
  m: []

  /**
   * before unmount
   */
  bum: []
  /**
   * unmounted
   */
  um: []
}

export interface ComponentContext {
  emitter: EventEmitter<ComponentEvents>
  id: number
  name?: string
  children?: Set<ComponentContext>
  el?: Node
  parent?: ComponentContext | null
  node?: ComponentNode

  /**
   * Component root node
   */
  root?: unknown

  /**
   * Normalized proxy props
   */
  props?: AnyProps

  /**
   * Provide extra data
   */
  ex?: Record<string | symbol, unknown>
}

let contextId = 1

export const {
  push: setCurrentContext,
  pop: popCurrentContext,
  current: getCurrentContext,
  runWith: runWithContext,
} = defineContext<ComponentContext>()

export function createNodeContext(node: ComponentNode) {
  const ctx: ComponentContext = {
    emitter: new EventEmitter<ComponentEvents>(),
    id: contextId++,
    name: node.type.name,
    node,
  }

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

export function appendToCurrentContext(ctx: ComponentContext) {
  const parentCtx = getCurrentContext()

  if (!parentCtx) {
    return
  }

  ctx.emitter.on(ComponentContextEventNameMap.unmounted, () => {
    // remove it self
    parentCtx.children?.delete(ctx)
    ctx.parent = null
  })

  parentCtx.children ||= new Set()
  parentCtx.children.add(ctx)
  ctx.parent = parentCtx
}
