import type { WatchScheduler } from '@vue/reactivity'

const resolvedPromise = Promise.resolve()

let currentPromise: Promise<void> | null = null

export function nextTick(this: any, fn?: () => any) {
  const p = currentPromise || resolvedPromise

  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

export type Job = () => void

const queue = new Set<Job>()

export function flushJobs() {
  for (const job of queue.values()) {
    job()
  }

  queue.clear()

  currentPromise = null
}

export function queueJob(job: Job) {
  queue.add(job)

  if (currentPromise) return

  currentPromise = resolvedPromise.then(flushJobs)
}

export const asyncWatcherScheduler: WatchScheduler = (job, _isFirstRun) => {
  queueJob(job)
}
