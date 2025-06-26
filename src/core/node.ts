import { isObject, type PrimitiveType } from '@0x-jerry/utils'
import { type ReactiveEffectRunner, stop } from '@vue/reactivity'
import { clsx } from 'clsx'
import type { DNodeContext } from './context'
import { onMounted, onUnmounted } from './hook'
import { moveChildren, updateEl } from './nodeOp'
import { effect, isRef, unref } from './reactivity'
import type { MaybeRef } from './types'

interface DContext {
  _: DNodeContext
}

export interface DFragment extends Comment, DContext {
  __fg: true
  __children: DElement[]
}

/**
 * TODO: improve render headless component, remove ChildNode inherency
 */
export interface DComponent extends ChildNode, DContext {}

export type DElement = DComponent | DFragment | HTMLElement | Text

export function createNativeElement(
  type: string,
  props: Record<string, any>,
  children?: unknown[],
) {
  const el = document.createElement(type) as DElement

  const keys = Object.keys(props)

  if (keys.length) {
    const effects: ReactiveEffectRunner[] = []
    const previousProps = new Map()

    for (const key of keys) {
      const runner = effect(() => {
        const value = transformProps(key, props[key])

        const old = previousProps.get(key)

        if (value !== old) {
          updateEl(el as HTMLElement, key, value, old)
          previousProps.set(key, value)
        }
      })

      // stop it when don't have active deps
      const hasDeps = 'deps' in runner.effect && runner.effect.deps
      if (hasDeps) {
        effects.push(runner)
      } else {
        stop(runner)
        previousProps.delete(key)
      }
    }

    if (effects.length) {
      onUnmounted(() => effects.forEach((item) => stop(item)))
    }
  }

  moveChildren(el as ParentNode, children)

  return el
}

function transformProps(key: string, value: unknown) {
  if (key === 'class') {
    return clsx(value as any)
  }

  return value
}

export function createTextElement(content: MaybeRef<PrimitiveType>) {
  const el = document.createTextNode('')

  if (isRef(content)) {
    const runner = effect(() => {
      el.textContent = String(unref(content) ?? '')
    })

    onUnmounted(() => stop(runner))
  } else {
    el.textContent = String(content ?? '')
  }

  return el
}

export function createFragment(children: unknown[] = []) {
  const el = document.createComment('fragment') as DFragment

  el.__fg = true
  el.__children = []

  onMounted(() => {
    el.__children = moveChildren(el.parentElement!, children, el)
  })

  onUnmounted(() => {
    el.__children.forEach((item) => item.remove())
  })

  return el
}

// ---- utils ----

export function normalizeNode(node: unknown): DElement {
  const rawValue = unref(node)

  if (isDElement(rawValue)) {
    return rawValue
  }

  return createTextElement(node as MaybeRef<PrimitiveType>)
}

export function isDElement(o: unknown): o is DElement {
  return o instanceof Node
}

export function isDComponent(o: unknown): o is DComponent {
  return isObject(o) && '_' in o
}

export function isFragment(o: unknown): o is DFragment {
  return isObject(o) && '__fg' in o
}

export function getContext(el?: unknown): DNodeContext | null {
  return isObject(el) && '_' in el && (el._ as any)
}
