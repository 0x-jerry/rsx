import { type ReactiveEffectRunner, stop } from '@vue/reactivity'
import { type ClassValue, clsx } from 'clsx'
import { isComponentNode } from './ComponentNode'
import { onUnmounted } from './hook'
import { moveChildren, updateEl } from './nodeOp'
import { type AnyProps, normalizeProps } from './props'
import { effect, isRef, unref } from './reactivity'

export function createNativeElement(
  type: string,
  props?: AnyProps,
  children?: unknown[],
) {
  const el = document.createElement(type)

  if (props) {
    const _props = normalizeProps(type, props)
    generateBindingFunction(el, _props)
  }

  moveChildren(el, children)

  return el
}

function generateBindingFunction(el: HTMLElement, props: AnyProps) {
  const effects: ReactiveEffectRunner[] = []
  const previousProps = new Map()

  for (const key in props) {
    const runner = effect(() => {
      const value = convertAttrValue(key, props[key])

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

function convertAttrValue(attr: string, value: unknown) {
  if (attr === 'class') {
    return clsx(value as ClassValue)
  }

  return value
}

export function createTextElement(content: unknown) {
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

export function normalizeNode(node: unknown): ChildNode | null | undefined {
  const rawValue = unref(node)

  if (rawValue == null) {
    return null
  }

  if (isHTMLNode(rawValue)) {
    return rawValue as ChildNode
  }

  if (isComponentNode(node)) {
    if (!node.instance) {
      node.initialize()
    }

    return node.instance.el
  }

  return createTextElement(node)
}

export function isHTMLNode(o: unknown): o is ChildNode {
  return o instanceof Node
}
