import { onUnmounted } from '@/hook'
import { type MaybeRef, unref } from '@/reactivity'

export interface UseTimeoutOption {
  immediate?: boolean
}

export function useTimeout(
  cb: () => void,
  ts: MaybeRef<number> = 0,
  opt?: UseTimeoutOption,
) {
  let handler: number = 0

  if (opt?.immediate) {
    restart()
  }

  onUnmounted(stop)

  return {
    restart,
    stop,
  }

  function restart() {
    clearTimeout(handler)

    handler = window.setTimeout(cb, unref(ts))
  }

  function stop() {
    return clearTimeout(handler)
  }
}
