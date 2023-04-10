import { JsonPrimitive, Optional, makePair } from '@0x-jerry/utils'
import { isRef, unref } from '@vue/reactivity'
import {
  DComponent,
  createTextElement,
  getContext,
  createUpdaterScope,
  isDComponent,
  isFragment,
} from '../node'
import { MaybeRef } from '../types'

export function vCase(
  condition: MaybeRef<JsonPrimitive>,
  /**
   * should return jsx
   */
  cases: Record<string, Optional<() => DComponent>>,
) {
  const anchor = createTextElement('')
  const ctx = getContext(anchor)
  const u = createUpdaterScope()

  const pair = makePair(cases)

  let renderedEl: Optional<DComponent> = null

  if (isRef(condition)) {
    u.add(() => {
      const oldChild = renderedEl

      if (isDComponent(oldChild)) {
        getContext(oldChild).emit('unmounted')
      }

      const newChild = mountCondition()

      renderedEl = newChild
    })
  } else {
    mountCondition()
  }

  ctx.on('mounted', u.run)
  ctx.on('unmounted', () => {
    u.stop()

    getContext(renderedEl)?.emit('unmounted')
  })

  return anchor

  function mountCondition() {
    const newChild = pair(String(unref(condition)))

    if (newChild) {
      const parentEl = anchor.parentElement!

      getContext(newChild).mount(parentEl, anchor)

      if (!isFragment(newChild)) {
        parentEl.insertBefore(newChild, anchor)
      }
    }

    return newChild
  }
}

export const vIf = (
  condition: MaybeRef<JsonPrimitive>,
  truthy?: () => any,
  falsy?: () => any,
) => vCase(condition, { true: truthy, false: falsy })
