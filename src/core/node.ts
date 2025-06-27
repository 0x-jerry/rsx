import type { PrimitiveType } from '@0x-jerry/utils'
import { type ReactiveEffectRunner, stop } from '@vue/reactivity'
import { clsx } from 'clsx'
import { onUnmounted } from './hook'
import { moveChildren, updateEl } from './nodeOp'
import { effect, isRef, unref } from './reactivity'
import type { MaybeRef } from './types'

export function createNativeElement(
  type: string,
  props: Record<string, any>,
  children?: unknown[],
) {
  const el = document.createElement(type)

  generateBindingFunction(el, props)
  moveChildren(el, children)

  return el
}

function generateBindingFunction(el: HTMLElement, props: Record<string, any>) {
  const effects: ReactiveEffectRunner[] = []
  const previousProps = new Map()

  for (const key in props) {
    const runner = effect(() => {
      const value = transformProps(key, props[key])

      const old = previousProps.get(key)

      if (value !== old) {
        updateEl(el, key, value, old)
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

// ---- utils ----

export function normalizeNode(node: unknown): ChildNode | null {
  const rawValue = unref(node)

  if (rawValue == null) {
    return null
  }

  if (isHTMLNode(rawValue)) {
    return rawValue as ChildNode
  }

  return createTextElement(node as MaybeRef<PrimitiveType>)
}

export function isHTMLNode(o: unknown): o is ChildNode {
  return o instanceof Node
}
