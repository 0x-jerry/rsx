import { PrimitiveType, isPrimitive } from '@0x-jerry/utils'
import { MaybeRef } from './types'
import { ReactiveEffectRunner, isRef, stop, unref } from '@vue/reactivity'
import { isObject } from '@0x-jerry/utils'
import { onMounted, onUnmounted } from './hook'
import { DNodeContext } from './context'
import { queueEffectJob } from './scheduler'
import { moveChildren } from './nodeOp'

type MixDComponent = {
  _?: DNodeContext
}

export type DElement = HTMLElement & MixDComponent

export type DText = Text & MixDComponent

export type DFragment = Comment &
  MixDComponent & {
    __fg: true
    __children: DComponent[]
  }

export type DComponent = ChildNode & MixDComponent

export type DNode = DComponent | MaybeRef<PrimitiveType>

export function createNativeElement(
  type: string,
  props: Record<string, any>,
  children?: DNode[],
) {
  const el = document.createElement(type) as DElement

  const keys = Object.keys(props)

  if (keys.length) {
    const effects: ReactiveEffectRunner[] = []
    const state = new Map()

    for (const key of keys) {
      const runner = queueEffectJob(
        () => {
          const value = unref(props![key])

          const old = state.get(key)

          if (value !== old) {
            updateEl(el, key, value, old)
            state.set(key, value)
          }
        },
        { immediate: true },
      )

      // stop it when don't have active deps
      if (runner.effect.deps.length) {
        effects.push(runner)
      } else {
        stop(runner)
        state.delete(key)
      }
    }

    if (effects.length) {
      onUnmounted(() => effects.forEach((item) => stop(item)))
    }
  }

  moveChildren(el, children)

  return el
}

export function createTextElement(content: MaybeRef<PrimitiveType>) {
  const el = document.createTextNode('') as DText

  if (isRef(content)) {
    const runner = queueEffectJob(
      () => {
        el.textContent = String(unref(content) ?? '')
      },
      {
        immediate: true,
      },
    )

    onUnmounted(() => stop(runner))
  } else {
    el.textContent = String(content ?? '')
  }

  return el
}

export function createFragment(children: DNode[] = []) {
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

function updateEl(el: HTMLElement, key: string, value: any, oldValue?: any) {
  if (/^on/.test(key)) {
    const eventName = key.slice(2).toLowerCase()

    if (oldValue) {
      el.removeEventListener(eventName, oldValue)
    }

    el.addEventListener(eventName, value)
    return
  }

  const isValueKey =
    el.tagName === 'INPUT' && ['value', 'checked'].includes(key)

  if (isValueKey) {
    // @ts-ignore
    el[key] = value
  } else {
    if (value == null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, value)
    }
  }
}

export function normalizeNode(node: DNode): DComponent {
  const rawValue = unref(node)

  if (isPrimitive(rawValue)) {
    return createTextElement(node as MaybeRef<PrimitiveType>)
  }

  return rawValue
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
