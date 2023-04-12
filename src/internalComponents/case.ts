import { JsonPrimitive, Optional, makePair } from '@0x-jerry/utils'
import { isRef, unref } from '@vue/reactivity'
import { DComponent, createTextElement, isFragment } from '../node'
import { MaybeRef } from '../types'
import {
  appendToCurrentContext,
  createNodeContext,
  getContext,
  mount,
  onMounted,
  onUnmounted,
  popCurrentContext,
  setCurrentContext,
  unmount,
} from '../hook'

export function vCase(
  condition: MaybeRef<JsonPrimitive>,
  /**
   * should return jsx
   */
  cases: Record<string, Optional<() => DComponent>>,
) {
  const ctx = createNodeContext()
  appendToCurrentContext(ctx)
  setCurrentContext(ctx)

  const anchor = createTextElement('')
  anchor._ = ctx

  const pair = makePair(cases)

  let renderedEl: Optional<DComponent> = null

  if (isRef(condition)) {
    ctx.updater.add(() => {
      const oldChild = renderedEl

      if (oldChild) unmount(oldChild)

      const newChild = mountCondition()

      renderedEl = newChild
    })
  } else {
    mountCondition()
  }

  onMounted(ctx.updater.flush)
  onUnmounted(() => {
    ctx.updater.scope.stop()

    getContext(renderedEl)?.emit('unmounted')
  })

  popCurrentContext()
  return anchor

  function mountCondition() {
    setCurrentContext(ctx)
    const newChild = pair(String(unref(condition)))
    popCurrentContext()

    if (newChild) {
      const parentEl = anchor.parentElement!

      if (isFragment(newChild)) {
        newChild.moveTo(parentEl, anchor)
      } else {
        parentEl.insertBefore(newChild, anchor)
      }

      mount(newChild)
    }

    return newChild
  }
}

export const vIf = (
  condition: MaybeRef<JsonPrimitive>,
  truthy?: () => any,
  falsy?: () => any,
) => vCase(condition, { true: truthy, false: falsy })
