import type { WatchScheduler } from './types'

const resolvedPromise = Promise.resolve()

let currentPromise: Promise<void> | null = null

export function nextTick(this: any, fn?: () => any) {
  const p = currentPromise || resolvedPromise

  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

export type Job = () => void

export type JobPhase = 'pre' | 'queue' | 'post'

const preQueue = new Set<Job>()
const queue = new Set<Job>()
const postQueue = new Set<Job>()

function getQueue(phase: JobPhase): Set<Job> {
  return phase === 'pre' ? preQueue : phase === 'post' ? postQueue : queue
}

let isFlushing = false

function flushQueue(q: Set<Job>) {
  // flush 期间派生的新 job 会被重新 add 进 Set,继续被本循环消费,而不是另起 microtask。
  while (q.size) {
    const jobs = Array.from(q)
    q.clear()

    for (const job of jobs) {
      try {
        job()
      } catch (error) {
        console.error(error)
      }
    }
  }
}

export function flushJobs() {
  if (isFlushing) return

  try {
    isFlushing = true
    flushQueue(preQueue)
    flushQueue(queue)
    flushQueue(postQueue)
  } finally {
    isFlushing = false
    currentPromise = null

    // flush 期间又产生新 job:在同一 tick 内继续 flush
    if (preQueue.size || queue.size || postQueue.size) {
      currentPromise = resolvedPromise.then(flushJobs)
    }
  }
}

export function queueJob(job: Job, phase: JobPhase = 'queue') {
  getQueue(phase).add(job)

  if (isFlushing || currentPromise) return

  currentPromise = resolvedPromise.then(flushJobs)
}

export function queuePreJob(job: Job) {
  queueJob(job, 'pre')
}

export function queuePostJob(job: Job) {
  queueJob(job, 'post')
}

export const asyncWatcherScheduler: WatchScheduler = (job, _isFirstRun) => {
  queueJob(job)
}