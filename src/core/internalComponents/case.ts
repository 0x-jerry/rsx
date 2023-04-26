import { JsonPrimitive, Optional, makePair } from '@0x-jerry/utils'
import { computed, unref } from '@vue/reactivity'
import { DComponent, createFragment } from '../node'
import { MaybeRef } from '../types'
import { mount, onMounted, unmount, useContext, useWatch } from '../hook'
import { runWithContext } from '../context'
import { h } from '../jsx'
import { insertBefore } from '../nodeOp'

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
