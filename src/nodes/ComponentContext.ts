import { EventEmitter } from '@0x-jerry/utils'
import type { AnyProps } from '../props'
import type { ComponentNode } from '../internalComponents'
import type { AnyNode } from './node'

export const ComponentContextEventNameMap = {
  mounted: 'm',
  unmounted: 'um',
} as const

export type ComponentEvents = {
  /**
   * mounted
   */
  m: []

  /**
   * unmounted
   */
  um: []
}

export type ComponentEventsName = keyof ComponentEvents

export interface ComponentContext<Events extends {} = {}> {
  emitter: EventEmitter<ComponentEvents & Events>
  id: number
  name?: string
  children?: Set<ComponentContext>

  parent?: ComponentContext | null
  node?: ComponentNode

  /**
   * Component root node
   */
  root?: AnyNode

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

  parentCtx.children ||= new Set()
  parentCtx.children.add(ctx)
  ctx.parent = parentCtx
}

export enum TriggerEventOrder {
  Preface = 1,
  Postscript = 2,
}

export function triggerEvent(
  event: ComponentEventsName,
  ctx: ComponentContext,
  order: TriggerEventOrder = TriggerEventOrder.Preface,
) {
  if (order === TriggerEventOrder.Preface) {
    ctx.emitter.emit(event)
  }

  for (const child of ctx?.children || []) {
    triggerEvent(event, child, order)
  }

  if (order === TriggerEventOrder.Postscript) {
    ctx.emitter.emit(event)
  }
}
