import { lazyEffect } from './reactivity'

const resolvedPromise = Promise.resolve()

let currentPromise: Promise<void> | null = null

export function nextTick(this: any, fn?: () => any) {
  const p = currentPromise || resolvedPromise

  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

type Job = () => void

const queue = {
  pre: new Set<Job>(),
  sync: new Set<Job>(),
  post: new Set<Job>(),
}

export function flushJobs() {
  for (const job of queue.pre.values()) {
    job()
  }

  for (const job of queue.sync.values()) {
    job()
  }

  for (const job of queue.post.values()) {
    job()
  }

  queue.pre.clear()
  queue.sync.clear()
  queue.post.clear()

  currentPromise = null
}

type QueueSequence = keyof typeof queue

export function queueJob(job: Job, flush: QueueSequence = 'sync') {
  queue[flush].add(job)

  if (currentPromise) return

  currentPromise = resolvedPromise.then(flushJobs)
}

export interface QueueJobOption {
  immediate?: boolean
  flush?: QueueSequence
}

export function queueEffectJob(job: Job, opt: QueueJobOption = {}) {
  const runner = lazyEffect(job, {
    scheduler: () => {
      queueJob(runner, opt.flush)
    },
  })

  if (opt.immediate) {
    runner()
  } else {
    queueJob(runner, opt.flush)
  }

  return runner
}
