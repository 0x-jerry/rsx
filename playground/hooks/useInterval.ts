import { onUnmounted } from '../../src'

export function useInterval(fn: () => void, ts = 100) {
  const handler = setInterval(fn, ts)

  onUnmounted(() => {
    clearInterval(handler)
  })
}
