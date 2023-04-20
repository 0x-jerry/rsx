import { effect } from '@vue/reactivity'

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

function scheduler(job: Job, flush: keyof typeof queue) {
  queue[flush].add(job)

  if (currentPromise) return

  currentPromise = resolvedPromise.then(flushJobs)
}

export function queueJob(job: () => void, flush: keyof typeof queue = 'sync') {
  const runner = effect(job, {
    lazy: true,
    scheduler: () => {
      scheduler(runner, flush)
    },
  })

  scheduler(runner, flush)

  return runner
}
