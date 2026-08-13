import { effect } from './system'
import { queueJob, queuePostJob, queuePreJob } from './scheduler'
import type {
  WatchCallback,
  WatchEffect,
  WatchHandle,
  WatchOptions,
  WatchSource,
} from './types'

export type { WatchCallback, WatchEffect, WatchHandle, WatchOptions, WatchSource }

export function watch<T = any>(
  source: WatchSource<T> | WatchSource<T>[] | WatchEffect,
  cb?: WatchCallback<T, T> | null,
  options: WatchOptions = {},
): WatchHandle {
  const { immediate = false, deep = false, flush = 'pre', scheduler } = options

  let oldValue: any
  let latestValue: any
  let firstRun = true
  let cleanup: (() => void) | undefined
  let stopped = false

  const onCleanup = (fn: () => void) => {
    cleanup = fn
  }

  const evaluate = (): any => {
    return Array.isArray(source) ? source.map((s) => s()) : source()
  }

  const hasChanged = (newValue: any, oldValue: any) => {
    if (Object.is(newValue, oldValue)) {
      return false
    }
    return deep ? !isDeepEqual(newValue, oldValue) : true
  }

  const scheduleJob = (job: () => void) => {
    if (scheduler) {
      scheduler(job, false)
    } else if (flush === 'sync') {
      job()
    } else if (flush === 'pre') {
      queuePreJob(job)
    } else if (flush === 'post') {
      queuePostJob(job)
    } else {
      queueJob(job)
    }
  }

  const run = () => {
    if (stopped) {
      return
    }

    cleanup?.()
    cleanup = undefined

    // Reuse the value captured by the effect run instead of re-evaluating the
    // source (the effect already tracked and re-ran on every change).
    const newValue = latestValue

    if (!hasChanged(newValue, oldValue)) {
      return
    }

    const prev = oldValue
    oldValue = newValue
    cb?.(newValue, prev, onCleanup)
  }

  const stopEffect = effect(
    () => {
      if (stopped) {
        return
      }

      const newValue = evaluate()
      latestValue = newValue

      if (firstRun) {
        // Initial value is captured synchronously at watch creation, so writes
        // that happen before the first flush still trigger the callback.
        // `immediate` is handled here too: the callback fires exactly once,
        // before the watcher is returned.
        firstRun = false
        oldValue = newValue
        if (immediate) {
          cb?.(newValue, undefined as any, onCleanup)
        }
        return
      }

      if (!hasChanged(newValue, oldValue)) {
        return
      }

      scheduleJob(run)
    },
    { sync: flush === 'sync', phase: flush === 'sync' ? undefined : flush },
  )

  const stop = () => {
    if (stopped) {
      return
    }

    stopped = true
    // Vue runs the pending cleanup when a watcher is stopped; our cleanup is
    // stored in a closure, so invoke it here explicitly.
    cleanup?.()
    cleanup = undefined
    stopEffect()
  }

  return stop
}

function isDeepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) {
    return true
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) {
        return false
      }
    }
    return true
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) {
      return false
    }
    for (const key of keysA) {
      if (!isDeepEqual(a[key], b[key])) {
        return false
      }
    }
    return true
  }

  return false
}

function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
