import { type JsonPrimitive, makePair, type Optional } from '@0x-jerry/utils'
import { computed, unref } from '@vue/reactivity'
import { runWithContext } from '../context'
import { mount, onMounted, unmount, useContext, useWatch } from '../hook'
import { h } from '../jsx'
import { createFragment, type DComponent } from '../node'
import { insertBefore } from '../nodeOp'
import type { MaybeRef } from '../types'

export function VCase(props: {
  condition: JsonPrimitive
  cases?: Record<string, Optional<() => DComponent>>
}) {
  const ctx = useContext()

  const el = createFragment()
  el._ = ctx

  const pair = makePair(props.cases || {})

  const caseKey = computed(() => String(unref(props.condition)))

  let renderedEl: Optional<DComponent> = null

  useWatch(caseKey, updateCase)

  onMounted(updateCase)

  return el

  function updateCase() {
    const oldChild = renderedEl

    if (oldChild) unmount(oldChild)

    const newChild = mountCondition()

    renderedEl = newChild
  }

  function mountCondition() {
    const newChild = runWithContext(() => pair(caseKey.value), ctx)

    if (newChild) {
      insertBefore(el, newChild)

      mount(newChild)
    }

    return newChild
  }
}

export function vCase(
  condition: MaybeRef<JsonPrimitive>,
  /**
   * should return jsx
   */
  cases: Record<string, Optional<() => DComponent>>,
) {
  return h(VCase, { condition, cases })
}

export const vIf = (
  condition: MaybeRef<JsonPrimitive>,
  truthy?: () => DComponent,
  falsy?: () => DComponent,
) => vCase(condition, { true: truthy, false: falsy })
