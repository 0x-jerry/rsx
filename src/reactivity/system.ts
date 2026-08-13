import { createReactiveSystem, type Link, type ReactiveNode } from 'alien-signals/system'
import { brandSignal } from './helpers'
import { queueJob, type JobPhase } from './scheduler'
import type { Signal } from './types'

/**
 * Signal/computed/effect core built on alien-signals' `createReactiveSystem`.
 *
 * Unlike alien-signals' default surface, effects are NOT flushed synchronously
 * on write: `notify` queues the effect into the shared microtask queue
 * (`queueJob`), so multiple writes in the same tick are coalesced into a single
 * re-run — matching the previous Vue-based scheduler behavior and `nextTick`.
 *
 * The rest of the machinery (link/unlink/propagate/checkDirty, updateComputed,
 * updateSignal, run/purgeDeps/cleanup, nested-effect handling) is adapted from
 * alien-signals' index.mjs.
 */

const HasChildEffect = 64

let cycle = 0
let runDepth = 0
let activeSub: ReactiveNode | undefined

interface SignalNode extends ReactiveNode {
  currentValue: unknown
  pendingValue: unknown
}

interface ComputedNode extends ReactiveNode {
  value: unknown
  getter: (previousValue?: unknown) => unknown
}

interface EffectNode extends ReactiveNode {
  fn: () => any
  cleanup: (() => void) | undefined
  /** Run synchronously on dependency change instead of queueing a microtask. */
  sync?: boolean
  /** Queue phase for deferred runs; defaults to 'queue'. */
  phase?: JobPhase
}

const { link, unlink, propagate, checkDirty, shallowPropagate } = createReactiveSystem({
  update(node) {
    if ('getter' in node) {
      return updateComputed(node as ComputedNode)
    }
    if ('currentValue' in node) {
      return updateSignal(node as SignalNode)
    }
    node.flags = 1
    return true
  },
  notify(effect) {
    effect.flags &= ~2
    const e = effect as EffectNode
    if (e.sync) {
      // `flush: 'sync'` watchers run their effect immediately on write.
      run(e)
    } else {
      // Defer the effect run to the shared microtask queue. The queue is a
      // Set, so an effect that is notified multiple times before flushing
      // only runs once.
      queueJob(() => run(e), e.phase)
    }
  },
  unwatched(node) {
    if ('getter' in node) {
      const computed = node as ComputedNode
      if (computed.depsTail !== undefined) {
        computed.flags = 1 | 16
        disposeAllDepsInReverse(computed)
      }
    } else if ('currentValue' in node) {
      // nothing to dispose
    } else if ('fn' in node) {
      effectOper.call(node as EffectNode)
    } else {
      effectScopeOper.call(node as EffectNode)
    }
  },
})

export function getActiveSub() {
  return activeSub
}

export function setActiveSub(sub?: ReactiveNode) {
  const prevSub = activeSub
  activeSub = sub
  return prevSub
}

export function signal<T>(): Signal<T | undefined>
export function signal<T>(initialValue: T): Signal<T>
export function signal<T>(initialValue?: T): Signal<T | undefined> {
  const s = signalOper.bind({
    currentValue: initialValue,
    pendingValue: initialValue,
    subs: undefined,
    subsTail: undefined,
    flags: 1,
  } as SignalNode)

  return brandSignal(s as Signal<T | undefined>)
}

export function computed<T>(getter: (previousValue?: T) => T): Signal<T> {
  const c = computedOper.bind({
    value: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 0,
    getter,
  } as ComputedNode)

  return brandSignal(c as any) as Signal<T>
}

export interface EffectOptions {
  /**
   * Run the effect synchronously on dependency change instead of deferring
   * the run to the shared microtask queue. Used by `watch` with
   * `flush: 'sync'`. A write performed inside the effect's own run is
   * coalesced into the next run (it never re-enters the running effect).
   */
  sync?: boolean
  /**
   * Scheduler queue phase for deferred runs ('pre' | 'queue' | 'post').
   * Defaults to 'queue'. Used by `watch` so that a 'pre' watcher detects
   * changes before the render queue is flushed (and 'post' after).
   */
  phase?: JobPhase
}

export function effect(fn: () => any, options: EffectOptions = {}): () => void {
  const e: EffectNode = {
    fn,
    cleanup: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 2 | 4,
    sync: !!options.sync,
    phase: options.phase,
  }

  const prevSub = setActiveSub(e)
  if (prevSub !== undefined) {
    link(e, prevSub, 0)
    prevSub.flags |= HasChildEffect
  }

  try {
    ++runDepth
    e.cleanup = e.fn()
  } finally {
    --runDepth
    activeSub = prevSub
    e.flags &= ~4
  }

  return effectOper.bind(e)
}

function updateComputed(c: ComputedNode) {
  if (c.flags & HasChildEffect) {
    let link = c.depsTail
    while (link !== undefined) {
      const prev = link.prevDep!
      const dep = link.dep
      if (!('getter' in dep) && !('currentValue' in dep)) {
        unlink(link, c)
      }
      link = prev
    }
  }

  c.depsTail = undefined
  c.flags = 1 | 4

  const prevSub = setActiveSub(c)
  try {
    ++cycle
    const oldValue = c.value
    return oldValue !== (c.value = c.getter(oldValue))
  } finally {
    activeSub = prevSub
    c.flags &= ~4
    purgeDeps(c)
  }
}

function updateSignal(s: SignalNode) {
  s.flags = 1
  return s.currentValue !== (s.currentValue = s.pendingValue)
}

function run(e: EffectNode) {
  const flags = e.flags

  if (flags & 16 || (flags & 32 && checkDirty(e.deps!, e))) {
    if (flags & HasChildEffect) {
      let link = e.depsTail
      while (link !== undefined) {
        const prev = link.prevDep!
        const dep = link.dep
        if (!('getter' in dep) && !('currentValue' in dep)) {
          unlink(link, e)
        }
        link = prev
      }
    }

    if (e.cleanup) {
      runCleanup(e)
      if (!e.flags) {
        return
      }
    }

    e.depsTail = undefined
    e.flags = 2 | 4

    const prevSub = setActiveSub(e)
    try {
      ++cycle
      ++runDepth
      e.cleanup = e.fn()
    } finally {
      --runDepth
      activeSub = prevSub
      e.flags &= ~4
      purgeDeps(e)
    }
  } else if (e.deps !== undefined) {
    e.flags = 2 | (flags & HasChildEffect)
  }
}

function computedOper(this: ComputedNode) {
  const flags = this.flags

  if (
    flags & 16 ||
    (flags & 32 &&
      (checkDirty(this.deps!, this) || ((this.flags = flags & ~32), false)))
  ) {
    if (updateComputed(this)) {
      const subs = this.subs
      if (subs !== undefined) {
        shallowPropagate(subs)
      }
    }
  } else if (!flags) {
    this.flags = 1 | 4
    const prevSub = setActiveSub(this)
    try {
      this.value = this.getter()
    } finally {
      activeSub = prevSub
      this.flags &= ~4
    }
  }

  const sub = activeSub
  if (sub !== undefined) {
    link(this, sub, cycle)
  }

  return this.value
}

function signalOper(this: SignalNode, ...value: unknown[]) {
  if (value.length) {
    if (this.pendingValue !== (this.pendingValue = value[0])) {
      this.flags = 1 | 16
      const subs = this.subs
      if (subs !== undefined) {
        propagate(subs, !!runDepth)
      }
    }
  } else {
    if (this.flags & 16) {
      if (updateSignal(this)) {
        const subs = this.subs
        if (subs !== undefined) {
          shallowPropagate(subs)
        }
      }
    }

    const sub = activeSub
    if (sub !== undefined) {
      link(this, sub, cycle)
    }

    return this.currentValue
  }
}

function runCleanup(e: EffectNode) {
  const cleanup = e.cleanup!
  e.cleanup = undefined
  const prevSub = activeSub
  activeSub = undefined
  try {
    cleanup()
  } finally {
    activeSub = prevSub
  }
}

function effectOper(this: EffectNode) {
  effectScopeOper.call(this)
  if (this.cleanup) {
    runCleanup(this)
  }
}

function effectScopeOper(this: EffectNode) {
  this.flags = 0
  disposeAllDepsInReverse(this)
  const sub = this.subs
  if (sub !== undefined) {
    unlink(sub)
  }
}

function disposeAllDepsInReverse(sub: ReactiveNode) {
  let link = sub.depsTail
  while (link !== undefined) {
    const prev = link.prevDep!
    unlink(link, sub)
    link = prev
  }
}

function purgeDeps(sub: ReactiveNode) {
  const depsTail = sub.depsTail
  let dep = depsTail !== undefined ? depsTail.nextDep : sub.deps
  while (dep !== undefined) {
    dep = unlink(dep, sub)
  }
}

export type { Link }
