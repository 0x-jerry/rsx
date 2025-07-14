import { type Arrayable, ensureArray } from '@0x-jerry/utils'
import { type MaybeRef, unref } from '@/reactivity'
import { useEventListener } from './useEventListener'

export type ClickOutsideCallback = () => void

export function useClickOutside(
  target: Arrayable<MaybeRef<HTMLElement>>,
  cb: ClickOutsideCallback,
) {
  useEventListener(window, 'click', (event: Event) => {
    const node = unref(target)
    if (!node) {
      return
    }

    if (
      isInsideElement(
        event.target as HTMLElement,
        ensureArray(target).map(unref),
      )
    ) {
      return
    }

    cb()
  })
}

function isInsideElement(current: HTMLElement, targets: HTMLElement[]) {
  let node: HTMLElement | null = current

  while (node) {
    if (targets.some((n) => n === node)) {
      return true
    }
    node = node.parentElement
  }

  return false
}
