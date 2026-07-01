import { type ReactiveEffectRunner, stop } from '@vue/reactivity'
import { type ClassValue, clsx } from 'clsx'
import { updateEl } from './nodeOp'
import { type AnyProps, normalizeProps, RAW_PROPS_KEY } from './props'
import { effect, isRef, unref } from './reactivity'

export function createNativeElement(type: string, props?: AnyProps) {
  const el = document.createElement(type)

  const { ref, ...otherProps } = props || {}

  const normProps = normalizeProps(type, otherProps)

  const cleanup = bindingProperties(el, normProps)

  // Respect `ref` prop
  if (isRef(ref)) {
    ref.value = el
  }

  return {
    el,
    cleanup,
  }
}

function bindingProperties(el: HTMLElement, props: AnyProps) {
  const effects: ReactiveEffectRunner[] = []
  const previousProps = new Map()

  const _raw: AnyProps = (props as any)[RAW_PROPS_KEY] || props

  for (const key in _raw) {
    if (isRef(_raw[key])) {
      const runner = effect(() => {
        const value = convertAttrValue(key, props[key])

        const old = previousProps.get(key)

        if (value !== old) {
          updateEl(el, key, value, old)
          previousProps.set(key, value)
        }
      })

      effects.push(runner)
    } else {
      const value = convertAttrValue(key, _raw[key])
      updateEl(el, key, value)
    }
  }

  if (effects.length) {
    return () => effects.forEach((item) => stop(item))
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

  let cleanup

  if (isRef(content)) {
    const runner = effect(() => {
      el.textContent = String(unref(content) ?? '')
    })

    cleanup = () => stop(runner)
  } else {
    el.textContent = String(content ?? '')
  }

  return {
    el,
    cleanup,
  }
}

export function isHTMLNode(o: unknown): o is ChildNode {
  return o instanceof Node
}
