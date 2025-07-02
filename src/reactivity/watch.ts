import type {
  WatchCallback,
  WatchEffect,
  WatchHandle,
  WatchOptions,
  WatchSource,
} from '@vue/reactivity'

import { watch as _watch } from '@vue/reactivity'
// import { queueJob } from './scheduler'

export type { WatchOptions, WatchHandle }

export function watch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb?: WatchCallback | null,
  options?: WatchOptions,
): WatchHandle {
  return _watch(source, cb, {
    ...options,
    // scheduler: (job, _isFirstRun) => {
    //   if (_isFirstRun) {
    //     job()
    //   } else {
    //     queueJob(job)
    //   }
    // },
  })
}
