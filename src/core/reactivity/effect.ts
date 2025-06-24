import { effect as _effect } from '@vue/reactivity'
import { type Job, queueJob } from './scheduler'

export function effect(job: Job) {
  const runner = _effect(job, {
    scheduler: () => {
      queueJob(runner)
    },
  })

  return runner
}
